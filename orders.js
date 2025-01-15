import api from './service.js';
import Modal from './modal.js';
import popup from './popup.js';

class Orders {
    constructor() {
        this.container = document.querySelector('.js-orders');
        this.template = document.getElementById("js-order-item");
        this.orders = [];
        this.ordersIdData = {};
        this.productsBiId = {};
        this.modalDelete = new Modal('modal-delete');
        this.modalView = new Modal('modal-view');

        this.init();
    }

    async init() {
        this.orders = await api.getOrders();
        await this.getOrdersData();
        this.setOrders();

        this.container.addEventListener('click', this.handleOrderClick.bind(this));
        this.initDeleteModal();
        this.initViewModal();
    }

    handleOrderClick(event) {
        const target = event.target;
        const item = target.closest('.orders__list-item');
        const orderId = item?.dataset?.orderId;

        if (orderId) {
            if (target.matches('.js-order-view')) {
                this.modalView.open(orderId, this.getOrderData(orderId));
            } else if (target.matches('.js-order-edit')) {
                this.modalView.open(orderId, this.getOrderData(orderId), true);
            } else if (target.matches('.js-order-delete')) {
                this.modalDelete.open(orderId);
            }
        }
    }

    getOrderData(orderId) {
        const order = this.orders.find(({ id }) => id === Number(orderId));
        const products = this.productsBiId[orderId];
        const formattedDate = this.formatDate(order.created_at);

        return {
            date: formattedDate,
            name: order.full_name,
            phone: order.phone,
            email: order.email,
            adress: order.delivery_address,
            delivery_date: this.formatDate(order.delivery_date),
            delivery_interval: order.delivery_interval,
            comment: order.comment,
            price: this.getTotalSum(orderId),
            products: products.map(i => i.name),
        };
    }

    async getOrdersData() {
        this.orders.forEach(item => {
            this.ordersIdData[item.id] = item.good_ids;
        });

        for (let key in this.ordersIdData) {
            this.productsBiId[key] = await Promise.all(this.ordersIdData[key].map(id => api.getItem(id)));
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    getTotalSum(orderId) {
        return this.productsBiId[orderId].reduce((acc, item) => acc + (item.actual_price || item.discount_price), 0);
    }

    setOrders() {
        this.container.innerHTML = '';
        this.orders.forEach((order, index) => {
            const formattedDate = this.formatDate(order.delivery_date);
            const clone = this.template.content.cloneNode(true);
            clone.querySelector(".orders__list-item").dataset.orderId = order.id;
            clone.querySelector(".orders__num").textContent = `${index + 1}.`;
            clone.querySelector(".orders__date").textContent = this.formatDate(order.created_at);
            clone.querySelector(".orders__price").textContent = `${this.getTotalSum(order.id)} ₽`;
            clone.querySelector(".orders__names").innerHTML = this.getProductNames(order.id);
            clone.querySelector(".orders__delivery").innerHTML = `<p>${formattedDate}</p><p>${order.delivery_interval}</p>`;
            this.container.appendChild(clone);
        });
    }

    getProductNames(orderId) {
        const products = this.productsBiId[orderId];
        return `<p>${products[0]?.name || ''}</p><p>${products[1]?.name || ''}</p>`;
    }

    initDeleteModal() {
        const closeBtn = this.modalDelete.popup.querySelector('.modal-close');
        const submitBtn = this.modalDelete.popup.querySelector('.modal-submit');

        closeBtn.addEventListener('click', () => this.modalDelete.close());
        submitBtn.addEventListener('click', async () => {
            await this.deleteOrder(this.modalDelete.orderId);
            this.modalDelete.close();
            this.orders = await api.getOrders();
            await this.getOrdersData();
            this.setOrders();
        });
    }

    initViewModal() {
        const closeBtns = this.modalView.popup.querySelectorAll('.modal-close');
        closeBtns.forEach(el => el.addEventListener('click', () => this.modalView.close()));
    }

    async deleteOrder(id) {
        const res = await api.deleteOrderById(id);
        if (res) popup.openPopup('Заказ удален');
    }
}

new Orders();

import api from './apishka.js';

class Cart {
    constructor() {
        this.container = document.querySelector('.js-card-list');
        this.totalBlock = document.querySelector('.js-total');
        this.template = document.getElementById("js-card-template");
        this.emptyText = document.querySelector('.cart__empty-description');
        this.dateField = document.querySelector('.js-date');
        this.timeField = document.querySelector('.js-time');
        this.form = document.querySelector('.js-form');
        this.resetBtn = document.querySelector('.js-form-reset');
        this.productIdList = JSON.parse(localStorage.getItem('cartList')) || [];
        this.cartList = [];
        this.deliverySettings = {
            dayIndex: null,
            partDay: '08:00-12:00',
            cost: 200,
        };

        this.init();
    }

    async init() {
        this.addEventListeners();
        await this.reloadCart();
    }

    addEventListeners() {
        this.container.addEventListener('click', (e) => this.handleCardClick(e));
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.resetBtn.addEventListener('click', (e) => this.handleReset(e));
        this.dateField.addEventListener('change', (e) => this.updateDeliveryDate(e.target.value));
        this.timeField.addEventListener('change', (e) => this.updateDeliveryTime(e.target.value));
    }

    handleCardClick(event) {
        const target = event.target;
        if (target.matches('.btn')) {
            const card = target.closest('.card');
            if (card && card.dataset.productId) {
                this.removeProductFromCart(card.dataset.productId);
            }
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        if (!this.productIdList.length) {
            window.location.replace('/');
            return;
        }

        const formData = this.getFormData();
        const response = await api.createOrder(formData);

        if (response) {
            this.resetCart();
        }
    }

    handleReset(event) {
        event.preventDefault();
        this.form.reset();
    }

    getFormData() {
        const formData = new FormData(this.form);

        formData.append('delivery_interval', this.deliverySettings.partDay);
        if (formData.has('mailing')) {
            formData.append('subscribe', 1);
            formData.delete('mailing');
        }

        const [year, month, day] = formData.get('delivery_date').split('-');
        formData.set('delivery_date', `${day}.${month}.${year}`);
        formData.append('good_ids', this.productIdList.map(Number));

        return formData;
    }

    async reloadCart() {
        await this.fetchCartItems();
        this.renderCart();
        this.updateTotal();
    }

    async fetchCartItems() {
        this.cartList = await Promise.all(this.productIdList.map(id => api.getItem(id)));
    }

    renderCart() {
        this.container.innerHTML = '';
        if (!this.cartList.length) {
            this.emptyText.style.display = 'block';
            return;
        }

        this.emptyText.style.display = 'none';
        this.cartList.forEach(item => this.renderCartItem(item));
    }

    renderCartItem(item) {
        const clone = this.template.content.cloneNode(true);
        const mainPrice = item.discount_price || item.actual_price;

        clone.querySelector(".card").dataset.productId = item.id;
        clone.querySelector(".card__title").textContent = item.name;
        clone.querySelector(".card__rating-num").textContent = item.rating;
        this.highlightRating(item.rating, clone);

        clone.querySelector(".card__pice-new").textContent = `${mainPrice} ₽`;
        if (item.discount_price) {
            clone.querySelector(".card__pice-old").textContent = `${item.actual_price} ₽`;
            clone.querySelector(".card__pice-discount").textContent = this.calculateDiscount(item.actual_price, item.discount_price);
        }

        if (item.image_url) {
            clone.querySelector(".card__picture-img").src = item.image_url;
        }

        const btn = clone.querySelector(".js-card-btn");
        btn.classList.add('card__btn_added');
        btn.textContent = 'Удалить';

        this.container.appendChild(clone);
    }

    highlightRating(rating, clone) {
        const stars = clone.querySelectorAll(".card__rating-star");
        stars.forEach((star, index) => {
            if (index < Math.round(rating)) {
                star.classList.add('card__rating-star_active');
            }
        });
    }

    calculateDiscount(originalPrice, discountPrice) {
        return `-${Math.round((originalPrice - discountPrice) / (originalPrice / 100))}%`;
    }

    updateTotal() {
        const total = this.cartList.reduce((sum, { discount_price, actual_price }) => sum + (discount_price || actual_price), 0);
        const delivery = this.deliverySettings.cost;

        this.totalBlock.querySelector('.js-total-price').textContent = total + delivery;
        this.totalBlock.querySelector('.js-total-delivery').textContent = delivery;
    }

    updateDeliveryDate(value) {
        const date = new Date(value);
        this.deliverySettings.dayIndex = date.getDay();
        this.deliverySettings.cost = [0, 6].includes(this.deliverySettings.dayIndex) ? 500 : 200;
        if (this.deliverySettings.partDay === '18:00-22:00' && this.deliverySettings.cost !== 500) {
            this.deliverySettings.cost = 400;
        }
        this.updateTotal();
    }

    updateDeliveryTime(value) {
        this.deliverySettings.partDay = value;
        if (![0, 6].includes(this.deliverySettings.dayIndex)) {
            this.deliverySettings.cost = value === '18:00-22:00' ? 400 : 200;
        }
        this.updateTotal();
    }

    removeProductFromCart(id) {
        this.productIdList = this.productIdList.filter(productId => productId !== id);
        localStorage.setItem('cartList', JSON.stringify(this.productIdList));
        this.reloadCart();
    }

    resetCart() {
        this.form.reset();
        localStorage.setItem('cartList', '[]');
        this.productIdList = [];
        window.location.replace('/');
    }
}

const cart = new Cart();

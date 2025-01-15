import api from './apishka.js';
import windows from './windows.js';

class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeButton = this.modal.querySelector('.js-modal-close-btn');
        this.isOpen = false;
        this.orderId = null;

        this.init();
    }

    init() {
        this.closeButton.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', this.handleModalClick.bind(this));
    }

    handleModalClick(event) {
        if (event.target === this.modal) this.close();
    }

    open(orderId, data, isEdit) {
        this.modal.classList.remove('hidden');
        this.modal.style.opacity = '1';
        this.isOpen = true;
        this.orderId = orderId;

        if (data) this.setModalView(data, isEdit);

        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    close() {
        this.modal.classList.add('hidden');
        this.modal.style.opacity = '0';
        this.isOpen = false;
        this.orderId = null;

        document.removeEventListener('keydown', this.handleKeydown.bind(this));
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    handleKeydown(event) {
        if (event.key === 'Escape') this.close();
    }

    setModalView(data, isEdit) {
        const modalView = document.getElementById('modal-view');
        const form = document.getElementById('modal-form');
        const namesStr = this.createNamesString(data.products);

        form.addEventListener('submit', this.handleFormSubmit.bind(this));

        modalView.querySelector('.modal-view__title').innerText = isEdit ? 'Редактирование заказа' : 'Просмотр заказа';
        modalView.querySelector('.modal__field_data').innerHTML = `<p>${data.date}</p>`;
        modalView.querySelector('.modal__field_price').innerHTML = `<p>${data.price} ₽</p>`;
        modalView.querySelector('.modal__field_names').innerHTML = namesStr;

        this.updateModalFields(modalView, data, isEdit);
    }

    createNamesString(products) {
        let namesStr = '';
        products.forEach((item, index) => {
            if (index < 2) {
                namesStr += `<p>${item}</p>`;
            }
            if (index === 2) {
                namesStr += `<p>...</p>`;
            }
        });
        return namesStr;
    }

    updateModalFields(modalView, data, isEdit) {
        if (isEdit) {
            this.prepareEditModal(modalView, data);
        } else {
            this.prepareViewModal(modalView, data);
        }
    }

    prepareEditModal(modalView, data) {
        modalView.classList.add('modal-view_edit');
        modalView.querySelectorAll('.modal__field').forEach(el => el.classList.remove('modal__field_text'));
        modalView.querySelector('.modal__field_name input').value = data.name;
        modalView.querySelector('.modal__field_phone input').value = data.phone;
        modalView.querySelector('.modal__field_email input').value = data.email;
        modalView.querySelector('.modal__field_adress input').value = data.adress;
        modalView.querySelector('.modal__field_comment textarea').value = data.comment;
    }

    prepareViewModal(modalView, data) {
        modalView.classList.remove('modal-view_edit');
        modalView.querySelectorAll('.modal__field').forEach(el => el.classList.add('modal__field_text'));
        modalView.querySelector('.modal__field_name p').innerHTML = `${data.name}`;
        modalView.querySelector('.modal__field_phone p').innerHTML = `${data.phone}`;
        modalView.querySelector('.modal__field_email p').innerHTML = `${data.email}`;
        modalView.querySelector('.modal__field_adress p').innerHTML = `${data.adress}`;
        modalView.querySelector('.modal__field_d-date p').innerHTML = `${data.delivery_date}`;
        modalView.querySelector('.modal__field_d-time p').innerHTML = `${data.delivery_interval}`;
        modalView.querySelector('.modal__field_comment p').innerHTML = `${data.comment}`;
    }

    handleFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        api.editOrder(this.orderId, formData)
            .then(response => {
                if (response) {
                    event.target.reset();
                    this.close();
                    windows.openwindows('Данные сохранены.');
                }
            });
    }
}

export default Modal;

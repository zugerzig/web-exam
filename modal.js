import api from './service.js';
import popup from './popup.js';

class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.closeButton = this.modal.querySelector('.js-modal-close-btn');
        this.isOpen = false;
        this.orderId = null;

        this.init();
    }

    init() {
        // Клик на кнопку закрытия
        this.closeButton.addEventListener('click', () => this.close());

        // Клик вне модального окна
        this.modal.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.close();
            }
        });
    }

    open(orderId, data, isEdit) {
        this.modal.classList.remove('hidden');
        this.modal.style.opacity = '1';
        this.isOpen = true;
        this.orderId = orderId;

        if(data) {
            this.setModalView(data, isEdit);
        }

        // Закрытие по клавише Escape
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    close() {
        this.modal.classList.add('hidden');
        this.modal.style.opacity = '0';
        this.isOpen = false;
        this.orderId = null;

        // Удаление обработчика для Escape
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    handleKeydown(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    setModalView(data, isEdit) {
        let namesStr = '';
        data.products.forEach((item, index) => {
            if(index < 2) {
                namesStr += `<p>${item}</p>`;
            }
            if(index === 2) {
                namesStr += `<p>...</p>`;
            }
        });
        
        const modalView = document.getElementById('modal-view');   
        const form = document.getElementById('modal-form');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formElem = e.target; // Получаем форму            
            const formData = new FormData(formElem);

            const response = await api.editOrder(this.orderId, formData);
            if(response) {
                form.reset();
                this.close();
                console.log('save', response);
                
                popup.openPopup('Данные сохранены.');
            }
        })

        modalView.querySelector('.modal-view__title').innerText = isEdit ? 'Редактирование заказа' : 'Просмотр заказа';
        modalView.querySelector('.modal__field_data').innerHTML = `<p>${data.date}</p>`;
        modalView.querySelector('.modal__field_price').innerHTML = `<p>${data.price} ₽</p>`;
        modalView.querySelector('.modal__field_names').innerHTML = namesStr;

        if(isEdit) {
            modalView.classList.add('modal-view_edit');
            modalView.querySelectorAll('.modal__field').forEach(el => el.classList.remove('modal__field_text'));
            modalView.querySelector('.modal__field_name').querySelector('input').value = data.name;
            modalView.querySelector('.modal__field_phone').querySelector('input').value = data.phone;
            modalView.querySelector('.modal__field_email').querySelector('input').value = data.email;
            modalView.querySelector('.modal__field_adress').querySelector('input').value = data.adress;
            modalView.querySelector('.modal__field_comment').querySelector('textarea').value = data.comment;
        } else {
            modalView.classList.remove('modal-view_edit');
            modalView.querySelectorAll('.modal__field').forEach(el => el.classList.add('modal__field_text'));
            modalView.querySelector('.modal__field_name').querySelector('p').innerHTML = `${data.name}`;
            modalView.querySelector('.modal__field_phone').querySelector('p').innerHTML = `${data.phone}`;
            modalView.querySelector('.modal__field_email').querySelector('p').innerHTML = `${data.email}`;
            modalView.querySelector('.modal__field_adress').querySelector('p').innerHTML = `${data.adress}`;
            modalView.querySelector('.modal__field_d-date').querySelector('p').innerHTML = `${data.delivery_date}`;
            modalView.querySelector('.modal__field_d-time').querySelector('p').innerHTML = `${data.delivery_interval}`;
            modalView.querySelector('.modal__field_comment').querySelector('p').innerHTML = `${data.comment}`;
        }
    }
}

export default Modal;
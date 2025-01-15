import api from './service.js';

class Cart {
    constructor() {
        this.totalBlock = document.querySelector('.js-total');
        this.container = document.querySelector('.js-card-list');
        this.template = document.getElementById("js-card-template");
        this.productIdList = JSON.parse(localStorage.getItem('cartList'));
        this.emptyText = document.querySelector('.cart__empty-description');
        this.dateField = document.querySelector('.js-date');
        this.timeField = document.querySelector('.js-time');
        this.form = document.querySelector('.js-form');
        this.resetBtn = document.querySelector('.js-form-reset');
        this.submitBtn = document.querySelector('.js-form-submit');
        this.cartList = [];
        this.formObject = {};
        this.deliverySettings = {
            dayIndex: null,
            partDay: '08:00-12:00',
            cost: 200,
        };

        this.init();
    }

    async init() {
        this.container.addEventListener('click', (e) => {
            const target = e.target;
            // Проверяем, была ли нажата кнопка
            if (target.matches('.btn')) {
                // Находим ближайший родительский блок с классом 'card'
                const card = target.closest('.card');
                // Получаем значение product-id из блока
                if (card && card.hasAttribute('data-product-id')) {
                    const dataValue = card.dataset.productId;
                    this.cardBtnHandler(dataValue);
                }
            }
        });
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if(!this.productIdList.length) window.location.replace('/');

            const formElem = e.target; // Получаем форму            
            const formData = new FormData(formElem);

            formData.append('delivery_interval', this.deliverySettings.partDay);
            if(formData.has('mailing')) {
                formData.append('subscribe', 1);
                formData.delete('mailing');
            }
            const [year, month, day] = formData.get('delivery_date').split('-'); // Разбиваем строку на части
            const formattedDate = `${day}.${month}.${year}`; // Формируем строку в формате dd.mm.yyyy
            formData.delete('delivery_date');
            formData.append('delivery_date', formattedDate);            
            formData.append('good_ids', this.productIdList.map(Number));
            
            const response = await api.createOrder(formData);
            if(response) {
                this.form.reset();
                localStorage.setItem('cartList', '[]');
                this.productIdList = JSON.parse(localStorage.getItem('cartList'));
                window.location.replace('/');
            }
            
        });
        this.resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.form.reset();
        });
        this.dateField.addEventListener('change', (e) => {
            this.watchDate(e.target.value)
        });
        this.timeField.addEventListener('change', (e) => {
            this.watchTime(e.target.value)
        });

        // инициализируем корзину
        this.reloadCart();
    }

    watchDate(value) {
        // зависимость стоимости доставки от выходных дней
        const date = new Date(value);
        this.deliverySettings.dayIndex = date.getDay();
        if(this.deliverySettings.dayIndex === 6 || this.deliverySettings.dayIndex === 0) {
            this.deliverySettings.cost = 500;
        } else if (this.deliverySettings.partDay === '18:00-22:00') {
            this.deliverySettings.cost = 400;
        } else {
            this.deliverySettings.cost = 200;
        }

        this.setTotal();
    }

    watchTime(value) {
        // зависимость стоимости доставки от времени суток
        this.deliverySettings.partDay = value;

        if(this.deliverySettings.dayIndex !== 6 && this.deliverySettings.dayIndex !== 0) {
            if (this.deliverySettings.partDay === '18:00-22:00') {
                this.deliverySettings.cost = 400;
            } else {
                this.deliverySettings.cost = 200;
            }
        }

        this.setTotal();
    }

    async reloadCart() {
        await this.getCart();
        this.setTotal();
        this.setCart();
    }

    async getCart() {
        const ids = this.productIdList.map(Number);
        
        // Дожидаемся выполнения всех промисов
        this.cartList = await Promise.all(ids.map(async (id) => {
            return await api.getItem(id);
        }));
    }

    setCart() {
        this.container.innerHTML = '';
        if(!this.cartList.length) {
            this.emptyText.style.display = 'block';
            return;
        }

        // вычисляем процент скидки
        const setPercent = (price, discountPrice) => {
            return `-${Math.round((price - discountPrice) / (price / 100))}%`;
        }

        // закрашиваем звезды рейтинга
        const setRating = (num, clone) => {
            const roundedNum = Math.round(num);
            const list = clone.querySelector(".card__rating-list");
            const stars = list.querySelectorAll(".card__rating-star");

            stars.forEach((star, index) => {
                if(index <= roundedNum - 1) {
                    star.classList.add('card__rating-star_active');
                }
            });
        }
        
        this.emptyText.style.display = 'none';
        
        this.cartList.forEach(item => {
            const mainPrice = item.discount_price || item.actual_price;
            const hasDiscount = !!item.discount_price;

            const clone = this.template.content.cloneNode(true);
            clone.querySelector(".card").setAttribute("data-product-id", item.id);
            clone.querySelector(".card__title").textContent = item.name;
            clone.querySelector(".card__rating-num").textContent = item.rating;
            setRating(item.rating, clone);
            clone.querySelector(".card__pice-new").textContent = `${mainPrice} ₽`;
            if(hasDiscount) {
                clone.querySelector(".card__pice-old").textContent = `${item.actual_price} ₽`;
                clone.querySelector(".card__pice-discount").textContent = setPercent(Number(item.actual_price), Number(item.discount_price));
            }
            if(item.image_url){
                // устанавливаем изображение
                clone.querySelector(".card__picture-img").setAttribute("src", item.image_url);
            }

            // состояние кнопки
            clone.querySelector(".js-card-btn").classList.add('card__btn_added');
            clone.querySelector(".js-card-btn").innerText = 'Удалить';

            this.container.appendChild(clone);
        });
    }

    setTotal() {
        const totalPrice = this.cartList.reduce((acc, {discount_price, actual_price}) => (acc += discount_price || actual_price), 0);
        
        const price = this.totalBlock.querySelector('.js-total-price');
        const delivery = this.totalBlock.querySelector('.js-total-delivery');
        price.innerText = totalPrice + this.deliverySettings.cost;
        delivery.innerText = this.deliverySettings.cost;
    }

    async cardBtnHandler(id) {
        // удаляем id
        localStorage.setItem('cartList', JSON.stringify(this.productIdList.filter(i => i !== id)));
        this.productIdList = JSON.parse(localStorage.getItem('cartList'));
        // обновляем корзину
        this.reloadCart();
    }
}

const cart = new Cart();
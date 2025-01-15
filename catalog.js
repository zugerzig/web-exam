import api from './service.js';

class Catalog {
    constructor() {
        this.items = [];
        this.maxPrice = 0;
        this.filter = {categorys: []};
        this.template = document.getElementById("js-card-template");
        this.templateCategory = document.getElementById("js-catalog-category");
        this.container = document.querySelector('.js-catalog-list');
        this.containerCategorys = document.querySelector('.sidebar__list');
        this.moreBtn = document.querySelector('.js-catalog-btn');
        this.sidebarForm = document.querySelector('.js-sidebar');

        this.init();
    }

    init() {
        this.cartList = JSON.parse(localStorage.getItem('cartList') || '[]');

        if(this.container) {
            this.container.addEventListener('click', (e) => {
                const target = e.target;
                // Проверяем, была ли нажата кнопка
                if (target.matches('.btn')) {
                    // Находим ближайший родительский блок с классом 'card'
                    const card = target.closest('.card');
                    // Получаем значение product-id из блока
                    if (card && card.hasAttribute('data-product-id')) {
                        const dataValue = card.dataset.productId;
                        this.cardBtnHandler(dataValue, target);
                    }
                }
            });
        }
    }

    filterHandler(items) {
        this.filter = {categorys: []};
        // забираем данные из формы и нормализуем к удобному виду
        for (let element of this.sidebarForm.elements) {
            if (element.name && element.type === 'number') {
                this.filter[element.name] = element.value;
            }
            if (element.name && element.type === 'checkbox') {
                if(element.name === 'hasdiscount'){
                    this.filter[element.name] = element.checked;
                } else {
                    if(element.checked) this.filter.categorys.push(element.name)
                }   
            }
        }

        // фильтрация
        this.items = items.filter(item => {
            let isCategiry, isPriceRange = false;
            let hasDiscount = true;
            const price = item.discount_price || item.actual_price;

            if(this.filter.hasdiscount && !item.discount_price) hasDiscount = false;

            if(price >= Number(this.filter['price-from']) && price <= Number(this.filter['price-to'])) isPriceRange = true;

            if(!this.filter.categorys.length || this.filter.categorys.includes(item['main_category'])) isCategiry = true;

            return isCategiry && isPriceRange && hasDiscount;
        })
        
        return this.items;
    }

    // запрос списка товаров
    async fetchItems() {
        if(!this.container) return;

        this.items = await api.getItems();
        this.getCategory();

        return this.getData();
    }

    // формируем категории
    getCategory() {
        const categoryMap = new Set();

        this.items.forEach(({main_category}) => {
            categoryMap.add(main_category);
        })        

        const categoryList = Array.from(categoryMap);
        this.containerCategorys.innerHTML = '';
        categoryList.forEach(el => {
            const clone = this.templateCategory.content.cloneNode(true);
            clone.querySelector(".sidebar__category-name").textContent = el;
            clone.querySelector(".sidebar__category-name").setAttribute('for', el);
            clone.querySelector(".sidebar__list-checkbox").setAttribute('id', el);
            clone.querySelector(".sidebar__list-checkbox").setAttribute('name', el);

            this.containerCategorys.appendChild(clone);
        });
    }

    getData() {
        this.items.forEach(item => {
            this.maxPrice = Math.max(this.maxPrice, item.discount_price);
        });

        return {
            items: this.items,
            maxPrice: this.maxPrice,
        }
    }

    // обновляем каталог на странице из полученных данных
    setItems(countPerPage = 8, items = []) {
        if(!this.container) return;

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

        this.container.innerHTML = '';
        let countItems = countPerPage;

        if(!items.length) return;

        // скрываем кнопку "загрузить еще" если все товары помещаются на странице
        if(countPerPage >= items.length) {
            countItems = items.length;
            this.moreBtn.style.display = 'none';
        }
        
        // заполняем каталог в цикле, клонируется шаблон, в который подставляются поля
        for (let item = 0; item < countItems; item++) {
            const mainPrice = items[item].discount_price || items[item].actual_price;
            const hasDiscount = !!items[item].discount_price;

            const clone = this.template.content.cloneNode(true);
            clone.querySelector(".card").setAttribute("data-product-id", items[item].id);
            clone.querySelector(".card__title").textContent = items[item].name;
            clone.querySelector(".card__rating-num").textContent = items[item].rating;
            setRating(items[item].rating, clone);
            clone.querySelector(".card__pice-new").textContent = `${mainPrice} ₽`;
            if(hasDiscount) {
                clone.querySelector(".card__pice-old").textContent = `${items[item].actual_price} ₽`;
                clone.querySelector(".card__pice-discount").textContent = setPercent(Number(items[item].actual_price), Number(items[item].discount_price));
            }
            if(items[item].image_url){
                // устанавливаем изображение
                clone.querySelector(".card__picture-img").setAttribute("src", items[item].image_url);
            }
            
            if(this.cartList.includes(items[item].id.toString())) {
                // состояние кнопки
                clone.querySelector(".js-card-btn").classList.add('card__btn_added');
                clone.querySelector(".js-card-btn").innerText = 'Удалить';
            }
            
            // сформировали карточку из шаблона и вставляем в каталог
            this.container.appendChild(clone);
        }
    }

    cardBtnHandler(id, btnEl) {
        if(this.cartList.includes(id)) {
            // удаляем id
            localStorage.setItem('cartList', JSON.stringify(this.cartList.filter(i => i !== id)));
            // обновляем кнопку
            btnEl.classList.remove('card__btn_added');
            btnEl.innerText = 'Добавить';
        } else {
            // добавляем id в хранилище
            localStorage.setItem('cartList', JSON.stringify([...this.cartList, id]));
            // обновляем кнопку
            btnEl.classList.add('card__btn_added');
            btnEl.innerText = 'Удалить';
        }

        this.cartList = JSON.parse(localStorage.getItem('cartList'));
    }
}

export default new Catalog();
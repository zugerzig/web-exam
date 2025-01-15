import popup from './popup.js';

class Api {
    constructor() {
        this.key = '660d8630-65e6-4188-98c1-b68c93e47d7c';
        // url не используется, настроен редирект на стороне хоста
        this.url = 'https://edu.std-900.ist.mospolytech.ru';
    }

    // запрос списка товаров
    async getItems() {
        const req = `/api/goods?api_key=${this.key}`;
        try {
            const response = await fetch(req, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json', // Указываем формат данных
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response}`);
            }
        
            return await response.json();
        } catch (error) {
            console.error('Произошла ошибка:', error.message);
        }
    }

    // запрос одного товара
    async getItem(id) {
        const req = `/api/goods/${id}?api_key=${this.key}`;
        try {
            const response = await fetch(req, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json', // Указываем формат данных
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response}`);
            }
        
            return await response.json();
        } catch (error) {
            console.error('Произошла ошибка:', error.message);
        }
    }

    // запрос списка заказов
    async getOrders() {
        const req = `/api/orders?api_key=${this.key}`;
        try {
            const response = await fetch(req, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response}`);
            }
        
            return await response.json();
        } catch (error) {
            console.error('Произошла ошибка:', error.message);
        }
    }

    async createOrder(formData) {
        const req = `/api/orders`;
        try {
            const response = await fetch(`${req}?api_key=${this.key}`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            popup.openpopup('Ошибка при заполнении', 'error');
            console.error('Ошибка при отправке данных:', error.message);
        }
    }

    async editOrder(id, formData) {
        const req = `/api/orders/${id}?api_key=${this.key}`
        try {
            const response = await fetch(req, {
                method: 'PUT',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
    
            return await response.json();
        } catch (error) {
            console.error('Ошибка при отправке данных:', error.message);
        }
    }

    async deleteOrderById(id) {
        const req = `/api/orders/${id}?api_key=${this.key}`;
        try {
            const response = await fetch(req, {
                method: 'DELETE',
                headers: {
                'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response}`);
            }
        
            return await response.json();
        } catch (error) {
            popup.openpopup('Ошибка сервера', 'error');
            console.error('Произошла ошибка:', error.message);
        }
    }
}

export default new Api();
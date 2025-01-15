class Popup {
    constructor() {
        this.popup = document.querySelector('.js-popup');
        this.content = this.popup.querySelector('.popup__text');
        this.closeBtn = this.popup.querySelector('.popup__close');

        this.init();
    }

    init() {
        if(!this.popup) {
            return;
        }

        this.popup.addEventListener('click', () => {
            this.closePopup();
        })
    }

    setContent(text='') {
        this.popup.style.color = 'white';
        this.content.innerText = text;
    }

    openPopup(text, type) {
        if(type === 'error') {
            this.popup.style.backgroundColor = 'red';
        } else {
            this.popup.style.backgroundColor = 'green';
        }
        this.setContent(text);
        this.popup.style.top = '0px';

        setTimeout(() => {
            this.closePopup();
        }, 3000);
    }

    closePopup() {
        this.popup.style.top = '-50px'; // Переместить вверх
        this.setContent();
    }
}

export default new Popup();

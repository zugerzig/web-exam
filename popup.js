class Popup {
    constructor() {
        this.popup = document.querySelector('.js-popup');
        this.content = this.popup.querySelector('.popup__text');
        this.closeBtn = this.popup.querySelector('.popup__close');

        this.init();
    }

    init() {
        if (!this.popup) return;
        this.popup.addEventListener('click', this.closepopup.bind(this));
    }

    setContent(text = '') {
        this.popup.style.color = 'white';
        this.content.innerText = text;
    }

    openpopup(text, type) {
        this.popup.style.backgroundColor = type === 'error' ? 'red' : 'green';
        this.setContent(text);
        this.popup.style.top = '0px';

        setTimeout(() => this.closepopup(), 3000);
    }

    closepopup() {
        this.popup.style.top = '-50px';
        this.setContent();
    }
}

export default new popup();

class Windows {
    constructor() {
        this.windows = document.querySelector('.js-windows');
        this.content = this.windows.querySelector('.windows__text');
        this.closeBtn = this.windows.querySelector('.windows__close');

        this.init();
    }

    init() {
        if (!this.windows) return;
        this.windows.addEventListener('click', this.closewindows.bind(this));
    }

    setContent(text = '') {
        this.windows.style.color = 'white';
        this.content.innerText = text;
    }

    openwindows(text, type) {
        this.windows.style.backgroundColor = type === 'error' ? 'red' : 'green';
        this.setContent(text);
        this.windows.style.top = '0px';

        setTimeout(() => this.closewindows(), 3000);
    }

    closewindows() {
        this.windows.style.top = '-50px';
        this.setContent();
    }
}

export default new windows();

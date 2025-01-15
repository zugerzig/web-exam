import windows from './windows.js';
import catalog from './catalog.js';

class App {
    constructor() {
        this.catalogItems = [];
        this.countItems = 8;
        this.data = {};

        this.moreBtn = document.querySelector('.js-catalog-btn');
        this.sidebarBtn = document.querySelector('.js-sidebar-btn');
        this.searchBtn = document.querySelector('.js-search-btn');
        this.sortSelect = document.querySelector('.js-catalog-sort');
        this.toggleSidebar = document.getElementById('toggle-checkbox');

        this.init();
    }

    async init() {
        this.data = await catalog.fetchItems();
        this.catalogItems = this.data?.items;
        this.setCatalogItems(this.countItems, this.catalogItems);

        windows.init();

        if (!document.querySelector(`.js-sidebar`)) return;
        this.initFilterInputs();

        this.moreBtn.addEventListener('click', () => this.showMoreItems());

        this.sidebarBtn.addEventListener('click', () => {
            const filtredCatalog = catalog.filterHandler(this.catalogItems);
            this.setCatalogItems(this.countItems, filtredCatalog);
        });

        this.searchBtn.addEventListener('click', () => {
            const searchStr = document.querySelector('.js-search-input').value;
            if (searchStr) this.search(searchStr);
        });

        this.sortSelect.addEventListener('change', (e) => {
            if (e.target.value) this.sort(e.target.value);
        });

        this.toggleSidebar.addEventListener('change', (e) => {
            const sidebar = document.querySelector('.js-sidebar');
            sidebar.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    sort(value) {
        switch (value) {
            case 'rating-down':
                this.catalogItems.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-up':
                this.catalogItems.sort((a, b) => a.rating - b.rating);
                break;
            case 'price-down':
                this.catalogItems.sort((a, b) => (b.discount_price || b.actual_price) - (a.discount_price || a.actual_price));
                break;
            case 'price-up':
                this.catalogItems.sort((a, b) => (a.discount_price || a.actual_price) - (b.discount_price || b.actual_price));
                break;
            default:
                break;
        }
        const filtredCatalog = catalog.filterHandler(this.catalogItems);
        this.setCatalogItems(this.countItems, filtredCatalog);
    }

    search(str) {
        const searchedList = this.catalogItems.filter(({ name }) => {
            return name.toLocaleLowerCase().includes(str.trim().toLocaleLowerCase());
        });
        this.setCatalogItems(this.countItems, searchedList);
    }

    setCatalogItems(count, items) {
        catalog.setItems(count, items);
    }

    initFilterInputs() {
        document.querySelector(`.js-number-input-1`).value = this.data.maxPrice;

        const decrementButtons = document.querySelectorAll('.decrement');
        const incrementButtons = document.querySelectorAll('.increment');

        decrementButtons.forEach((btn, index) => {
            const input = document.querySelector(`.js-number-input-${index}`);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (input.value >= 1) input.value = parseInt(input.value) - 1;
            });
        });

        incrementButtons.forEach((btn, index) => {
            const input = document.querySelector(`.js-number-input-${index}`);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (input.value < this.data.maxPrice) input.value = parseInt(input.value) + 1;
            });
        });
    }

    showMoreItems() {
        this.countItems += 8;
        this.setCatalogItems(this.countItems, this.catalogItems);
    }
}

const app = new App();

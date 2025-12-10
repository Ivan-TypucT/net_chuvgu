/**
 * Хранилище товаров каталога
 */
Ext.define('Marketplace.store.Products', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Product',
    storeId: 'Products',

    autoLoad: true,
    remoteFilter: true,
    remoteSort: true,

    proxy: {
        type: 'ajax',
        url: '/api/products',
        reader: {
            type: 'json',
            rootProperty: 'data.products',  
            totalProperty: 'data.totalCount' 
        }
    },

    /**
     * Фильтрация по категории
     * @param {String} category - название категории
     */
    filterByCategory: function(category) {
        console.log(`📁 Фильтрация товаров по категории: ${category}`);
        this.clearFilter();

        if (category) {
            this.filter('category', category);
        }
    },

    /**
     * Поиск товаров по тексту
     * @param {String} searchText - текст для поиска
     */
    searchProducts: function(searchText) {
        console.log(`🔍 Поиск товаров: "${searchText}"`);
        this.clearFilter();

        if (searchText) {
            this.filterBy(function(record) {
                const text = searchText.toLowerCase();
                return record.get('name').toLowerCase().includes(text) ||
                    record.get('brand').toLowerCase().includes(text) ||
                    record.get('description').toLowerCase().includes(text);
            });
        }
    },

    /**
     * Получить избранные товары
     * @returns {Array}
     */
    getFavorites: function() {
        return this.query('isFavorite', true).items;
    },

    /**
     * Получить товары в корзине
     * @returns {Array}
     */
    getCartItems: function() {
        return this.query('inCart', true).items;
    }
});
/**
 * Хранилище избранных товаров
 */
Ext.define('Marketplace.store.Favorites', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Product',
    storeId: 'Favorites',

    autoLoad: false,

    proxy: {
        type: 'ajax',
        url: '/api/favorites',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    /**
     * Добавить товар в избранное
     * @param {Marketplace.model.Product} product - товар
     */
    addToFavorites: function(product) {
        console.log(`❤️ Добавление в избранное: ${product.get('name')}`);

        if (!this.findRecord('id', product.get('id'))) {
            this.add(product.copy());
            this.sync();
        }
    },

    /**
     * Удалить товар из избранного
     * @param {Number} productId - ID товара
     */
    removeFromFavorites: function(productId) {
        console.log(`💔 Удаление из избранного: productId=${productId}`);

        const item = this.findRecord('id', productId);
        if (item) {
            this.remove(item);
            this.sync();
        }
    },

    /**
     * Проверить, есть ли товар в избранном
     * @param {Number} productId - ID товара
     * @returns {Boolean}
     */
    isFavorite: function(productId) {
        return !!this.findRecord('id', productId);
    }
});
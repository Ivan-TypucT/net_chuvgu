/**
 * Хранилище категорий товаров
 */
Ext.define('Marketplace.store.Categories', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Category',
    storeId: 'Categories',

    autoLoad: true,
    remoteSort: true,

    proxy: {
        type: 'ajax',
        url: '/api/categories',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    sorters: [{
        property: 'displayOrder',
        direction: 'ASC'
    }],

    /**
     * Получить категорию по ID
     * @param {Number} id - ID категории
     * @returns {Marketplace.model.Category}
     */
    getCategoryById: function(id) {
        return this.findRecord('id', id);
    },

    /**
     * Получить категорию по имени
     * @param {String} name - название категории
     * @returns {Marketplace.model.Category}
     */
    getCategoryByName: function(name) {
        return this.findRecord('name', name);
    }
});
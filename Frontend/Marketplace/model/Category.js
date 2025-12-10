/**
 * Модель категории товаров
 */
Ext.define('Marketplace.model.Category', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'productCount', type: 'int' },
        { name: 'displayOrder', type: 'int' }
    ],

    validators: {
        name: { type: 'presence', message: 'Название категории обязательно' }
    }
});
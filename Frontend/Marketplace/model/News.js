/**
 * Модель новости/промо-баннера
 */
Ext.define('Marketplace.model.News', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'image', type: 'string' },
        { name: 'publishedAt', type: 'date' },
        { name: 'isActive', type: 'boolean' },
        { name: 'author', type: 'string' }
    ]
});
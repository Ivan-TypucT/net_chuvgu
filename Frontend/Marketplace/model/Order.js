/**
 * Модель заказа пользователя
 */
Ext.define('Marketplace.model.Order', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'orderNumber', type: 'string' },
        { name: 'orderDate', type: 'date' },
        { name: 'status', type: 'string' },
        { name: 'total', type: 'float' },
        { name: 'itemsCount', type: 'int' },
        { name: 'shippingAddress', type: 'string' }
    ],

    /**
     * Статусы заказа
     */
    statics: {
        STATUS_PENDING: 'pending',
        STATUS_PROCESSING: 'processing',
        STATUS_SHIPPED: 'shipped',
        STATUS_DELIVERED: 'delivered',
        STATUS_CANCELLED: 'cancelled'
    }
});
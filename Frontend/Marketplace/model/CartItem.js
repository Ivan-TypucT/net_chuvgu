/**
 * Модель элемента корзины покупок
 */
Ext.define('Marketplace.model.CartItem', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'productId', type: 'int' },
        { name: 'quantity', type: 'int' },
        { name: 'addedAt', type: 'date' },
        { name: 'product', type: 'auto' }
    ],

    validators: {
        productId: { type: 'presence', message: 'ID товара обязательно' },
        quantity: [
            { type: 'presence', message: 'Количество обязательно' },
            { type: 'range', min: 1, message: 'Количество должно быть больше 0' }
        ]
    },

    /**
     * Общая стоимость позиции
     * @returns {Number}
     */
    getTotalPrice: function() {
        const product = this.get('product');
        return product ? product.price * this.get('quantity') : 0;
    }
});
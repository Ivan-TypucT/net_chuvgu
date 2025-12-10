/**
 * Модель товара в каталоге
 */
Ext.define('Marketplace.model.Product', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'name', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'category', type: 'string' },
        { name: 'price', type: 'float' },
        { name: 'oldPrice', type: 'float' },
        { name: 'image', type: 'string' },
        { name: 'rating', type: 'float' },
        { name: 'reviewsCount', type: 'int' },
        { name: 'weight', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'inStock', type: 'boolean' },
        { name: 'stockQuantity', type: 'int' },
        { name: 'isFavorite', type: 'boolean' },
        { name: 'inCart', type: 'boolean' }
    ],

    validators: {
        name: { type: 'presence', message: 'Название товара обязательно' },
        price: { type: 'presence', message: 'Цена обязательна' }
    },

    /**
     * Проверка наличия скидки
     * @returns {Boolean}
     */
    hasDiscount: function() {
        return this.get('oldPrice') && this.get('oldPrice') > this.get('price');
    },

    /**
     * Размер скидки в процентах
     * @returns {Number}
     */
    getDiscountPercent: function() {
        if (!this.hasDiscount()) return 0;
        return Math.round((1 - this.get('price') / this.get('oldPrice')) * 100);
    }
});
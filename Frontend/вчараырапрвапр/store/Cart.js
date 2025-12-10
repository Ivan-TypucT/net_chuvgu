/**
 * Хранилище корзины покупок
 */
Ext.define('Marketplace.store.Cart', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.CartItem',
    storeId: 'Cart',

    autoLoad: false,

    proxy: {
        type: 'ajax',
        url: '/api/cart',
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    },

    /**
     * Добавить товар в корзину
     * @param {Number} productId - ID товара
     * @param {Number} quantity - количество
     */
    addToCart: function(productId, quantity) {
        console.log(`🛒 Добавление в корзину: productId=${productId}, quantity=${quantity}`);

        const existingItem = this.findRecord('productId', productId);

        if (existingItem) {
            // Увеличиваем количество существующего товара
            existingItem.set('quantity', existingItem.get('quantity') + quantity);
        } else {
            // Добавляем новый товар
            this.add({
                productId: productId,
                quantity: quantity,
                addedAt: new Date()
            });
        }

        this.sync();
    },

    /**
     * Обновить количество товара в корзине
     * @param {Number} productId - ID товара
     * @param {Number} quantity - новое количество
     */
    updateQuantity: function(productId, quantity) {
        console.log(`📦 Обновление количества: productId=${productId}, quantity=${quantity}`);

        const item = this.findRecord('productId', productId);
        if (item) {
            if (quantity <= 0) {
                this.remove(item);
            } else {
                item.set('quantity', quantity);
            }
            this.sync();
        }
    },

    /**
     * Удалить товар из корзины
     * @param {Number} productId - ID товара
     */
    removeFromCart: function(productId) {
        console.log(`🗑️ Удаление из корзины: productId=${productId}`);

        const item = this.findRecord('productId', productId);
        if (item) {
            this.remove(item);
            this.sync();
        }
    },

    /**
     * Очистить корзину
     */
    clearCart: function() {
        console.log('🧹 Очистка корзины');
        this.removeAll();
        this.sync();
    },

    /**
     * Общая стоимость корзины
     * @returns {Number}
     */
    getTotalPrice: function() {
        return this.getRange().reduce(function(total, item) {
            return total + item.getTotalPrice();
        }, 0);
    },

    /**
     * Общее количество товаров в корзине
     * @returns {Number}
     */
    getTotalItems: function() {
        return this.getRange().reduce(function(total, item) {
            return total + item.get('quantity');
        }, 0);
    }
});
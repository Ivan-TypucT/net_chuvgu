/**
 * Хранилище корзины покупок
 */
Ext.define('Marketplace.store.Cart', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.CartItem',
    storeId: 'Cart',

    // Используем memory proxy для локальной работы
    proxy: {
        type: 'memory',
        data: []
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
            this.fireEvent('update', this, existingItem, Ext.data.Model.EDIT);
        } else {
            // Добавляем новый товар
            const newItem = this.add({
                productId: productId,
                quantity: quantity,
                addedAt: new Date(),
                product: Ext.getStore('Products').getById(productId)?.getData() || null
            })[0];

            this.fireEvent('add', this, [newItem], this.getCount() - 1);
        }

        this.fireEvent('datachanged', this);
        console.log(`✅ Товар добавлен в локальную корзину`);
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
                this.fireEvent('remove', this, [item], 0);
            } else {
                item.set('quantity', quantity);
                this.fireEvent('update', this, item, Ext.data.Model.EDIT);
            }
            this.fireEvent('datachanged', this);
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
            this.fireEvent('remove', this, [item], 0);
            this.fireEvent('datachanged', this);
        }
    },

    /**
     * Очистить корзину
     */
    clearCart: function() {
        console.log('🧹 Очистка корзины');
        this.removeAll();
        this.fireEvent('datachanged', this);
    },

    /**
     * Загрузить корзину с сервера
     */
    load: function() {
        // Проверяем авторизацию
        const token = localStorage.getItem('authToken');
        if (!token || token === 'null' || token === 'undefined') {
            console.log('⚠️ Пользователь не авторизован, не загружаем корзину с сервера');
            return Promise.resolve([]);
        }

        return new Promise((resolve, reject) => {
            // Чистый AJAX запрос без использования store proxy
            Ext.Ajax.request({
                url: '/api/cart',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                success: (response) => {
                    try {
                        const result = Ext.decode(response.responseText);

                        if (result.success) {
                            const cartData = result.data || [];
                            console.log(`✅ Корзина загружена с сервера: ${cartData.length} товаров`);

                            // Очищаем текущую корзину
                            this.removeAll();

                            // Добавляем товары из сервера
                            if (cartData.length > 0) {
                                cartData.forEach(item => {
                                    // Получаем информацию о товаре
                                    const product = Ext.getStore('Products').getById(item.productId);
                                    if (product) {
                                        item.product = product.getData();
                                    }
                                    this.add(item);
                                });
                            }

                            this.fireEvent('load', this, cartData, true);
                            this.fireEvent('datachanged', this);
                            resolve(cartData);
                        } else {
                            console.warn('⚠️ Сервер вернул ошибку:', result.message);
                            this.fireEvent('load', this, [], false);
                            resolve([]);
                        }
                    } catch (e) {
                        console.error('❌ Ошибка обработки ответа:', e);
                        this.fireEvent('load', this, [], false);
                        resolve([]);
                    }
                },
                failure: (response) => {
                    console.warn('⚠️ Ошибка загрузки корзины:', response.status);
                    this.fireEvent('load', this, [], false);

                    if (response.status === 401) {
                        console.log('ℹ️ Пользователь не авторизован для просмотра корзины');
                        resolve([]);
                    } else {
                        reject('Ошибка загрузки корзины: ' + response.status);
                    }
                }
            });
        });
    },

    /**
     * Общая стоимость корзины
     * @returns {Number}
     */
    getTotalPrice: function() {
        return this.getRange().reduce(function(total, item) {
            const productPrice = item.get('product')?.price || 0;
            return total + (productPrice * item.get('quantity'));
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
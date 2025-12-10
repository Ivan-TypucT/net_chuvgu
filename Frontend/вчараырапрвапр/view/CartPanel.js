/**
 * Панель корзины покупок
 */
Ext.define('Marketplace.view.CartPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.cartpanel',

    layout: 'fit',
    cls: 'cart-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('🛒 Инициализация панели корзины');

        this.items = [this.createCartView()];
        this.dockedItems = [this.createCartFooter()];

        this.callParent(arguments);
    },

    /**
     * Создание представления корзины
     * @returns {Object} конфиг DataView
     */
    createCartView: function() {
        return {
            xtype: 'dataview',
            cls: 'cart-view',
            store: 'Cart',
            itemSelector: '.cart-item',
            itemTpl: new Ext.XTemplate(
                '<div class="cart-item">',
                '<div class="cart-item-image" style="background-image: url({product.image})"></div>',
                '<div class="cart-item-info">',
                '<div class="cart-item-name">{product.name}</div>',
                '<div class="cart-item-brand">{product.brand}</div>',
                '<div class="cart-item-price">{product.price}₽ × {quantity} = {[values.product.price * values.quantity]}₽</div>',
                '</div>',
                '<div class="cart-item-actions">',
                '<button type="button" onclick="Marketplace.app.getController(\'Products\').updateCartQuantity({productId}, {quantity}-1)">-</button>',
                '<span>{quantity}</span>',
                '<button type="button" onclick="Marketplace.app.getController(\'Products\').updateCartQuantity({productId}, {quantity}+1)">+</button>',
                '<button type="button" onclick="Marketplace.app.getController(\'Products\').removeFromCart({productId})">🗑️</button>',
                '</div>',
                '</div>'
            ),
            listeners: {
                refresh: this.onCartRefresh,
                scope: this
            }
        };
    },

    /**
     * Создание футера корзины
     * @returns {Object} конфиг футера
     */
    createCartFooter: function() {
        return {
            xtype: 'toolbar',
            dock: 'bottom',
            cls: 'cart-footer',
            items: [
                '->',
                {
                    xtype: 'component',
                    cls: 'cart-total',
                    html: '<strong>Итого: <span id="cartTotal">0</span>₽</strong>'
                },
                {
                    xtype: 'button',
                    text: 'Оформить заказ',
                    cls: 'checkout-btn',
                    handler: this.onCheckout,
                    scope: this
                }
            ]
        };
    },

    /**
     * Обработчик обновления корзины
     */
    onCartRefresh: function() {
        console.log('🔄 Обновление отображения корзины');
        this.updateCartTotal();
    },

    /**
     * Обновление общей суммы корзины
     */
    updateCartTotal: function() {
        const cartStore = Ext.getStore('Cart');
        const total = cartStore.getTotalPrice();

        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
            totalElement.textContent = total;
        }

        console.log(`💰 Общая сумма корзины: ${total}₽`);
    },

    /**
     * Обработчик оформления заказа
     */
    onCheckout: function() {
        console.log('💰 Оформление заказа');

        const cartStore = Ext.getStore('Cart');

        if (cartStore.getCount() === 0) {
            Marketplace.util.ErrorHandler.showWarning('Корзина пуста');
            return;
        }

        const authCtrl = Marketplace.app.getController('Auth');
        if (!authCtrl.isAuthenticated()) {
            Marketplace.util.ErrorHandler.showWarning('Для оформления заказа необходимо войти в систему');
            Marketplace.showLogin();
            return;
        }

        // Имитация оформления заказа
        Marketplace.util.API.post('/orders/create', {
            items: cartStore.getRange().map(function(item) {
                return {
                    productId: item.get('productId'),
                    quantity: item.get('quantity')
                };
            })
        }).then(function(response) {
            console.log('✅ Заказ успешно оформлен');
            Marketplace.util.ErrorHandler.showInfo('Заказ успешно оформлен!', 'Успех');
            cartStore.clearCart();
        }).catch(function(error) {
            console.error('❌ Ошибка оформления заказа:', error);
            Marketplace.util.ErrorHandler.showError(error, 'Ошибка оформления заказа');
        });
    }
});
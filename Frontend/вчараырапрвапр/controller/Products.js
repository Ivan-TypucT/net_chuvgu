/**
 * Контроллер управления товарами и корзиной
 */
Ext.define('Marketplace.controller.Products', {
    extend: 'Ext.app.Controller',

    /**
     * Инициализация контроллера
     */
    init: function() {
        console.log('🛍️ Инициализация Products контроллера');

        this.control({
            'productsgrid': {
                beforerender: this.onProductsGridRender
            }
        });
    },

    /**
     * Обработчик отрисовки сетки товаров
     * @param {Marketplace.view.ProductsGrid} grid - сетка товаров
     */
    onProductsGridRender: function(grid) {
        console.log('📊 Инициализация сетки товаров');

        const store = grid.getStore();
        if (store && store.getCount() === 0) {
            store.load();
        }
    },

    /**
     * Добавление товара в корзину
     * @param {Number} productId - ID товара
     */
    onAddToCart: function(productId) {
        console.log(`🛒 Добавление товара ${productId} в корзину`);

        const product = Ext.getStore('Products').getById(productId);
        if (!product) {
            console.error('❌ Товар не найден:', productId);
            Marketplace.util.ErrorHandler.showError('Товар не найден');
            return;
        }

        if (!product.get('inStock')) {
            console.warn('⚠️ Товар отсутствует в наличии:', productId);
            Marketplace.util.ErrorHandler.showWarning('Товар временно отсутствует в наличии');
            return;
        }

        const cartStore = Ext.getStore('Cart');
        cartStore.addToCart(productId, 1);

        this.showToast(`Товар "${product.get('name')}" добавлен в корзину`);
        this.updateCartCounter();
    },

    /**
     * Переключение статуса избранного
     * @param {Number} productId - ID товара
     */
    onToggleFavorite: function(productId) {
        console.log(`❤️ Переключение избранного для товара ${productId}`);

        const product = Ext.getStore('Products').getById(productId);
        if (!product) {
            console.error('❌ Товар не найден:', productId);
            return;
        }

        const isFavorite = product.get('isFavorite');
        product.set('isFavorite', !isFavorite);

        const favoritesStore = Ext.getStore('Favorites');

        if (!isFavorite) {
            favoritesStore.addToFavorites(product);
            this.showToast('Добавлено в избранное');
        } else {
            favoritesStore.removeFromFavorites(productId);
            this.showToast('Удалено из избранного');
        }
    },

    /**
     * Обновление счетчика корзины в заголовке
     */
    updateCartCounter: function() {
        const cartStore = Ext.getStore('Cart');
        const cartButton = Ext.ComponentQuery.query('#cartButton')[0];

        if (cartButton) {
            const totalItems = cartStore.getTotalItems();
            cartButton.setText(`Корзина (${totalItems})`);
            console.log(`🔢 Обновление счетчика корзины: ${totalItems} товаров`);
        }
    },

    /**
     * Показать уведомление
     * @param {String} message - сообщение
     */
    showToast: function(message) {
        console.log('💬 Показ уведомления:', message);

        Ext.toast({
            html: message,
            align: 't',
            slideInDuration: 400,
            minWidth: 300
        });
    },

    /**
     * Поиск товаров
     * @param {String} searchText - текст для поиска
     */
    searchProducts: function(searchText) {
        console.log(`🔍 Поиск товаров: "${searchText}"`);

        const productsStore = Ext.getStore('Products');
        productsStore.searchProducts(searchText);
    },

    /**
     * Фильтрация по категории
     * @param {String} category - категория
     */
    filterByCategory: function(category) {
        console.log(`📁 Фильтрация по категории: ${category}`);

        const productsStore = Ext.getStore('Products');
        productsStore.filterByCategory(category);
    }
});
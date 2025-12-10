/**
 * Панель избранных товаров
 */
Ext.define('Marketplace.view.FavoritesPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.favoritespanel',

    layout: 'fit',
    cls: 'favorites-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('❤️ Инициализация панели избранного');

        this.items = [this.createFavoritesView()];

        this.callParent(arguments);
    },

    /**
     * Создание представления избранных товаров
     * @returns {Object} конфиг DataView
     */
    createFavoritesView: function() {
        return {
            xtype: 'dataview',
            cls: 'favorites-view',
            store: 'Favorites',
            itemSelector: '.favorite-item',
            emptyText: '<div class="empty-favorites">❤️ Нет избранных товаров</div>',
            listeners: {
                refresh: this.onFavoritesRefresh,
                scope: this
            },
            itemTpl: new Ext.XTemplate(
                '<div class="favorite-item">',
                '<div class="favorite-image" style="background-image: url({image})"></div>',
                '<div class="favorite-info">',
                '<div class="favorite-brand">{brand}</div>',
                '<div class="favorite-name">{name}</div>',
                '<div class="favorite-description">{description}</div>',
                '<div class="favorite-price">{price}₽</div>',
                '<div class="favorite-meta">',
                '<span class="favorite-rating">⭐ {rating}</span>',
                '<span class="favorite-weight">{weight}</span>',
                '</div>',
                '</div>',
                '<div class="favorite-actions">',
                '<button type="button" class="add-to-cart-btn {[values.inStock ? "" : "disabled"]}" ',
                'onclick="Marketplace.addToCart({id})">',
                '{[values.inStock ? "В корзину" : "Нет в наличии"]}',
                '</button>',
                '<button type="button" class="remove-favorite-btn" ',
                'onclick="Marketplace.toggleFavorite({id})">',
                '🗑️ Удалить',
                '</button>',
                '</div>',
                '</div>'
            )
        };
    },

    /**
     * Обработчик обновления избранного
     */
    onFavoritesRefresh: function() {
        console.log('🔄 Обновление панели избранного');

        const favoritesStore = Ext.getStore('Favorites');
        console.log(`📊 Количество избранных товаров: ${favoritesStore.getCount()}`);
    }
});
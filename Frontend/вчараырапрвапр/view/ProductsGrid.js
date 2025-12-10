/**
 * Сетка/список товаров каталога
 */
Ext.define('Marketplace.view.ProductsGrid', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.productsgrid',

    layout: 'vbox',
    cls: 'products-grid',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('📊 Инициализация сетки товаров');

        this.items = [
            this.createPromoBanner(),
            this.createCategoriesPanel(),
            this.createFilterPanel(),
            this.createProductsView()
        ];

        this.callParent(arguments);
    },

    /**
     * Создание промо-баннера
     * @returns {Object} конфиг баннера
     */
    createPromoBanner: function() {
        console.log('🎨 Создание промо-баннера');

        return {
            xtype: 'panel',
            cls: 'promo-banner',
            height: 120,
            html: [
                '<div class="promo-content">',
                '<h2>🚀 Скидки до 50% на всю бытовую химию!</h2>',
                '<p>Только до конца месяца • Бесплатная доставка от 1500₽</p>',
                '</div>'
            ].join('')
        };
    },

    /**
     * Создание панели категорий
     * @returns {Object} конфиг панели категорий
     */
    createCategoriesPanel: function() {
        console.log('📁 Создание панели категорий');

        const categoriesStore = Ext.getStore('Categories');
        const categoryButtons = categoriesStore.getRange().map(function(category) {
            return {
                xtype: 'button',
                text: `${category.get('icon')} ${category.get('name')}`,
                cls: 'category-btn',
                handler: function() {
                    this.filterByCategory(category.get('id'));
                },
                scope: this
            };
        }, this);

        return {
            xtype: 'panel',
            cls: 'categories-panel',
            height: 80,
            layout: {
                type: 'hbox',
                pack: 'center'
            },
            items: categoryButtons
        };
    },

    /**
     * Создание панели фильтров
     * @returns {Object} конфиг панели фильтров
     */
    createFilterPanel: function() {
        console.log('🔍 Создание панели фильтров');

        return {
            xtype: 'toolbar',
            cls: 'filter-panel',
            items: [
                {
                    xtype: 'textfield',
                    emptyText: '🔍 Поиск товаров...',
                    flex: 1,
                    listeners: {
                        change: this.onSearch,
                        buffer: 500,
                        scope: this
                    }
                },
                {
                    xtype: 'combo',
                    emptyText: 'Все категории',
                    store: 'Categories',
                    displayField: 'name',
                    valueField: 'id',
                    width: 200,
                    listeners: {
                        select: this.onCategorySelect,
                        scope: this
                    }
                },
                {
                    xtype: 'button',
                    text: 'Сбросить',
                    handler: this.resetFilters,
                    scope: this
                }
            ]
        };
    },

    /**
     * Создание представления товаров
     * @returns {Object} конфиг DataView
     */
    createProductsView: function() {
        console.log('🛍️ Создание представления товаров');

        return {
            xtype: 'dataview',
            flex: 1,
            cls: 'products-view',
            store: 'Products',
            itemSelector: '.product-card',
            listeners: {
                itemclick: this.onProductClick,
                scope: this
            },
            itemTpl: new Ext.XTemplate(
                '<div class="product-card {[values.inStock ? "" : "out-of-stock"]}">',
                '<div class="product-badge {[values.oldPrice ? "has-discount" : ""]}">',
                '{[values.oldPrice ? "Экономия " + (values.oldPrice - values.price) + "₽" : ""]}',
                '</div>',
                '<div class="product-image" style="background-image: url({image})">',
                '{[!values.inStock ? \'<div class="out-of-stock-label">Нет в наличии</div>\' : ""]}',
                '</div>',
                '<div class="product-brand">{brand}</div>',
                '<div class="product-title">{name}</div>',
                '<div class="product-description">{description}</div>',
                '<div class="product-price">',
                '{[values.oldPrice ? \'<span class="old-price">\' + values.oldPrice + \'₽</span>\' : ""]}',
                '<span class="current-price">{price}₽</span>',
                '</div>',
                '<div class="product-meta">',
                '<div class="product-rating">⭐ {rating} ({reviewsCount})</div>',
                '<div class="product-weight">{weight}</div>',
                '</div>',
                '<div class="product-actions">',
                '<button type="button" class="cart-btn {[values.inStock ? "" : "disabled"]}" ',
                'onclick="Marketplace.addToCart({id})">',
                '{[values.inStock ? "В корзину" : "Нет в наличии"]}',
                '</button>',
                '<button type="button" class="favorite-btn {[values.isFavorite ? "active" : ""]}" ',
                'onclick="Marketplace.toggleFavorite({id})">',
                '❤️',
                '</button>',
                '</div>',
                '</div>'
            )
        };
    },

    /**
     * Обработчик поиска
     * @param {Ext.form.field.Text} field - поле поиска
     * @param {String} value - значение поиска
     */
    onSearch: function(field, value) {
        console.log(`🔍 Поиск товаров: "${value}"`);

        const productsCtrl = Marketplace.app.getController('Products');
        productsCtrl.searchProducts(value);
    },

    /**
     * Обработчик выбора категории
     * @param {Ext.form.field.ComboBox} combo - комбобокс
     * @param {Ext.data.Model} record - выбранная категория
     */
    onCategorySelect: function(combo, record) {
        if (record) {
            console.log(`📁 Выбрана категория: ${record.get('name')}`);

            const productsCtrl = Marketplace.app.getController('Products');
            productsCtrl.filterByCategory(record.get('name'));
        } else {
            this.resetFilters();
        }
    },

    /**
     * Сброс фильтров
     */
    resetFilters: function() {
        console.log('🔄 Сброс фильтров');

        this.down('textfield').reset();
        this.down('combo').reset();

        const productsStore = Ext.getStore('Products');
        productsStore.clearFilter();
    },

    /**
     * Фильтрация по категории
     * @param {Number} categoryId - ID категории
     */
    filterByCategory: function(categoryId) {
        console.log(`📁 Фильтрация по категории ID: ${categoryId}`);

        const category = Ext.getStore('Categories').getById(categoryId);
        if (category) {
            this.down('combo').setValue(categoryId);
            this.onCategorySelect(this.down('combo'), category);
        }
    },

    /**
     * Обработчик клика по товару
     * @param {Ext.view.View} view - DataView
     * @param {Ext.data.Model} record - модель товара
     */
    onProductClick: function(view, record) {
        console.log(`🎯 Клик по товару: ${record.get('name')}`);
        // Можно добавить открытие детальной страницы товара
    }
});
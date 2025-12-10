/**
 * Панель новостей
 */
Ext.define('Marketplace.view.NewsPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.newspanel',

    title: '📰 Новости',
    iconCls: 'x-fa fa-newspaper-o',
    cls: 'news-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('📰 Инициализация панели новостей');

        this.layout = 'vbox';
        this.items = this.createNewsContent();

        this.callParent(arguments);
    },

    /**
     * Создание контента новостей
     * @returns {Array} массив компонентов
     */
    createNewsContent: function() {
        return [
            this.createNewsBanner(),
            this.createNewsList()
        ];
    },

    /**
     * Создание баннера новостей
     * @returns {Object} конфиг баннера
     */
    createNewsBanner: function() {
        return {
            xtype: 'panel',
            cls: 'news-banner',
            height: 180,
            width: '100%',
            margin: '0 0 10 0',

            html: [
                '<div class="banner-content">',
                '<div class="banner-icon">🔥</div>',
                '<h2>Загрузка баннера...</h2>',
                '<p>Секундочку, загружаем акции</p>',
                '<div class="banner-loading">',
                '<div class="loading-spinner"></div>',
                '</div>',
                '</div>'
            ].join('')
        };
    },

    /**
     * Создание списка новостей
     * @returns {Object} конфиг списка
     */
    createNewsList: function() {
        return {
            xtype: 'dataview',
            cls: 'news-list',
            flex: 1,
            width: '100%',
            store: this.createNewsStore(),
            itemSelector: '.news-item',

            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="news-item">',
                '<div class="news-icon">{isActive:this.getIcon}</div>',
                '<div class="news-content">',
                '<h3 class="news-title">{title}</h3>',
                '<p class="news-preview">{content:this.getPreview}</p>',
                '<div class="news-meta">',
                '<span class="news-author">👤 {author}</span>',
                '<span class="news-date">📅 {publishedAt:date("d.m.Y")}</span>',
                '</div>',
                '</div>',
                '<div class="news-actions">',
                '<button class="news-read-btn" onclick="Marketplace.readNews({id})">Читать</button>',
                '</div>',
                '</div>',
                '</tpl>',
                {
                    getIcon: function(isActive) {
                        return isActive ? '✅' : '⭕';
                    },
                    getPreview: function(content) {
                        return content.length > 150 ? content.substring(0, 150) + '...' : content;
                    }
                }
            ),

            listeners: {
                afterrender: function(view) {
                    console.log('📰 Список новостей отрисован, загружаем данные');
                    this.loadNews();
                },
                scope: this
            }
        };
    },

    /**
     * Создание хранилища новостей
     * @returns {Ext.data.Store} store новостей
     */
    createNewsStore: function() {
        return Ext.create('Ext.data.Store', {
            fields: [
                'id', 'title', 'content', 'image',
                'publishedAt', 'isActive', 'author'
            ],
            data: [] // Загрузится с сервера
        });
    },

    /**
     * Загрузка новостей с сервера
     */
    loadNews: function() {
        console.log('📥 Начинаем загрузку новостей...');

        // Загружаем баннер
        this.loadBanner();

        // Загружаем список новостей
        Marketplace.util.API.get('/news?page=1&pageSize=20')
            .then(function(response) {
                console.log('✅ Новости загружены:', response.data.items.length);

                var store = this.down('dataview').getStore();
                store.loadData(response.data.items);

                this.updateBanner(response.data.items[0]); // Обновляем баннер первой новостью
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка загрузки новостей:', error);
                this.showErrorState(error);
            }.bind(this));
    },

    /**
     * Загрузка баннера
     */
    loadBanner: function() {
        console.log('📢 Загрузка баннера...');

        Marketplace.util.API.get('/news/banner')
            .then(function(response) {
                console.log('✅ Баннер загружен');
                this.updateBanner(response.data);
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка загрузки баннера:', error);
                // Используем первую новость как баннер
            }.bind(this));
    },

    /**
     * Обновление баннера
     * @param {Object} newsData - данные новости
     */
    updateBanner: function(newsData) {
        if (!newsData) return;

        var banner = this.down('.news-banner');
        if (banner) {
            var html = [
                '<div class="banner-content">',
                '<div class="banner-icon">🔥</div>',
                `<h2>${Ext.util.Format.htmlEncode(newsData.title)}</h2>`,
                `<p>${Ext.util.Format.htmlEncode(newsData.content)}</p>`,
                '<div class="banner-meta">',
                `<span class="banner-author">👤 ${Ext.util.Format.htmlEncode(newsData.author)}</span>`,
                `<span class="banner-date">📅 ${Ext.Date.format(new Date(newsData.publishedAt), 'd.m.Y')}</span>`,
                '</div>',
                '</div>'
            ].join('');

            banner.update(html);
            console.log('✅ Баннер обновлен');
        }
    },

    /**
     * Показать состояние ошибки
     * @param {String} error - текст ошибки
     */
    showErrorState: function(error) {
        var dataview = this.down('dataview');
        if (dataview) {
            dataview.update([
                '<div class="news-error">',
                '<div class="error-icon">😕</div>',
                '<h3>Не удалось загрузить новости</h3>',
                '<p>' + Ext.util.Format.htmlEncode(error) + '</p>',
                '<button onclick="location.reload()">Обновить</button>',
                '</div>'
            ].join(''));
        }
    }
});
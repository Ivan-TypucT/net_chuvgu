/**
 * Контроллер управления навигацией и окнами
 */
Ext.define('Marketplace.controller.Navigation', {
    extend: 'Ext.app.Controller',

    /**
     * Инициализация контроллера
     */
    init: function() {
        console.log('🧭 Инициализация Navigation контроллера');

        this.control({
            'button[action=showLogin]': {
                click: this.showLoginWindow
            },
            'button[action=showRegister]': {
                click: this.showRegisterWindow
            },
            'button[action=showNews]': {
                click: this.showNewsTab
            },
            'mainpanel tabpanel': {
                tabchange: this.onTabChange
            }
        });
    },

    /**
     * Показать вкладку новостей
     */
    showNewsTab: function() {
        console.log('📰 Переход на вкладку новостей');

        var tabPanel = Ext.ComponentQuery.query('mainpanel tabpanel')[0];
        if (!tabPanel) {
            console.error('❌ TabPanel не найден');
            return;
        }

        // Ищем существующую вкладку новостей
        var newsTab = tabPanel.down('newspanel');

        if (!newsTab) {
            // Создаем новую вкладку
            newsTab = Ext.create('Marketplace.view.NewsPanel');
            tabPanel.add(newsTab);
        }

        // Активируем вкладку
        tabPanel.setActiveTab(newsTab);
    },

    /**
     * Обработчик смены вкладки
     */
    onTabChange: function(tabPanel, newCard) {
        console.log(`📑 Смена вкладки на: ${newCard.title}`);

        switch (newCard.xtype) {
            case 'cartpanel':
                this.updateCartTab(newCard);
                break;
            case 'favoritespanel':
                this.updateFavoritesTab(newCard);
                break;
            case 'profilepanel':
                this.updateProfileTab(newCard);
                break;
            case 'newspanel':
                this.updateNewsTab(newCard);
                break;
        }
    },

    /**
     * Обновление вкладки новостей
     */
    updateNewsTab: function(panel) {
        console.log('📰 Обновление вкладки новостей');

        if (panel && panel.updateNews) {
            panel.updateNews();
        }
    },

    /**
     * Показать окно входа
     */
    showLoginWindow: function() {
        console.log('🔐 Открытие окна входа');

        if (!this.loginWindow) {
            this.loginWindow = Ext.create('Marketplace.view.LoginWindow');
        }
        this.loginWindow.show();
    },

    /**
     * Показать окно регистрации
     */
    showRegisterWindow: function() {
        console.log('📝 Открытие окна регистрации');

        if (!this.registerWindow) {
            this.registerWindow = Ext.create('Marketplace.view.RegisterWindow');
        }
        this.registerWindow.show();
    },

    /**
     * Обработчик смены вкладки
     * @param {Ext.tab.Panel} tabPanel - панель вкладок
     * @param {Ext.Component} newCard - новая активная вкладка
     */
    onTabChange: function(tabPanel, newCard) {
        console.log(`📑 Смена вкладки на: ${newCard.title}`);

        switch (newCard.xtype) {
            case 'cartpanel':
                this.updateCartTab(newCard);
                break;
            case 'favoritespanel':
                this.updateFavoritesTab(newCard);
                break;
            case 'profilepanel':
                this.updateProfileTab(newCard);
                break;
        }
    },

    /**
     * Обновление вкладки корзины
     * @param {Marketplace.view.CartPanel} panel - панель корзины
     */
    updateCartTab: function(panel) {
        console.log('🛒 Обновление вкладки корзины');

        const cartStore = Ext.getStore('Cart');

        if (cartStore.getCount() === 0) {
            this.showEmptyState(panel, {
                icon: '🛒',
                title: 'Корзина пуста',
                message: 'Добавьте товары из каталога',
                buttonText: 'Перейти к покупкам',
                buttonAction: function() {
                    const tabPanel = Ext.ComponentQuery.query('tabpanel')[0];
                    tabPanel.setActiveTab(0);
                }
            });
        }
    },

    /**
     * Обновление вкладки избранного
     * @param {Marketplace.view.FavoritesPanel} panel - панель избранного
     */
    updateFavoritesTab: function(panel) {
        console.log('❤️ Обновление вкладки избранного');

        const favoritesStore = Ext.getStore('Favorites');

        if (favoritesStore.getCount() === 0) {
            this.showEmptyState(panel, {
                icon: '❤️',
                title: 'Нет избранных товаров',
                message: 'Добавляйте товары в избранное, чтобы не потерять'
            });
        }
    },

    /**
     * Обновление вкладки профиля
     * @param {Marketplace.view.ProfilePanel} panel - панель профиля
     */
    updateProfileTab: function(panel) {
        console.log('👤 Обновление вкладки профиля');
        // Автоматически обновляется через биндинг данных
    },

    /**
     * Показать состояние "пусто"
     * @param {Ext.panel.Panel} panel - панель
     * @param {Object} config - конфигурация
     */
    showEmptyState: function(panel, config) {
        panel.removeAll();

        panel.add({
            xtype: 'container',
            cls: 'empty-state',
            html: [
                '<div class="empty-content">',
                `<div class="empty-icon">${config.icon}</div>`,
                `<h3>${config.title}</h3>`,
                `<p>${config.message}</p>`,
                config.buttonText ?
                    `<button onclick="(${config.buttonAction})()">${config.buttonText}</button>` :
                    '',
                '</div>'
            ].join('')
        });

        console.log(`📭 Показано пустое состояние: ${config.title}`);
    }
});
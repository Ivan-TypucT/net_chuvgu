/**
 * Главная панель приложения - корневой компонент
 */
Ext.define('Marketplace.view.MainPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.mainpanel',

    layout: 'fit',
    cls: 'main-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('🏠 Инициализация главной панели');

        this.items = [this.createTabPanel()];
        this.dockedItems = [this.createHeader()];

        this.callParent(arguments);
    },

    /**
     * Создание заголовка приложения
     * @returns {Object} конфиг тулбара
     */
    createHeader: function() {
        console.log('🔧 Создание заголовка приложения');

        const userData = this.getUserData();
        const userText = userData ?
            `${userData.firstName} ${userData.lastName}` :
            'Войти';

        return {
            xtype: 'toolbar',
            dock: 'top',
            cls: 'main-header',
            items: [
                {
                    xtype: 'component',
                    cls: 'header-logo',
                    html: '<h1>🧼 Чистота+</h1>'
                },
                '->', // Spring для выравнивания
                {
                    xtype: 'button',
                    text: 'Акции',
                    cls: 'header-btn',
                    handler: this.onPromotionsClick,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: 'Доставка',
                    cls: 'header-btn',
                    handler: this.onDeliveryClick,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: 'Контакты',
                    cls: 'header-btn',
                    handler: this.onContactsClick,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: 'Корзина (0)',
                    itemId: 'cartButton',
                    cls: 'header-btn cart-btn',
                    handler: this.onCartClick,
                    scope: this
                },
                {
                    xtype: 'button',
                    text: userText,
                    cls: 'header-btn login-btn',
                    handler: userData ? this.onProfileClick : this.onLoginClick,
                    scope: this
                }
            ]
        };
    },

    /**
     * Создание панели вкладок
     * @returns {Object} конфиг таб-панели
     */
    createTabPanel: function() {
        console.log('📑 Создание панели вкладок');

        return {
            xtype: 'tabpanel',
            cls: 'main-tabpanel',
            items: [
                {
                    title: '🛍️ Каталог',
                    layout: 'fit',
                    items: [Ext.create('Marketplace.view.ProductsGrid')]
                },
                {
                    title: '🛒 Корзина',
                    xtype: 'cartpanel'
                },
                {
                    title: '❤️ Избранное',
                    xtype: 'favoritespanel'
                },
                {
                    title: '👤 Профиль',
                    xtype: 'profilepanel'
                }
            ],
            listeners: {
                tabchange: this.onTabChange,
                scope: this
            }
        };
    },

    /**
     * Получение данных пользователя из localStorage
     * @returns {Object|null} данные пользователя
     */
    getUserData: function() {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : null;
        } catch (e) {
            console.error('❌ Ошибка получения данных пользователя:', e);
            return null;
        }
    },

    /**
     * Обработчик клика по корзине
     */
    onCartClick: function() {
        console.log('🎯 Клик по кнопке корзины');
        this.down('tabpanel').setActiveTab(1);
    },

    /**
     * Обработчик клика по входу
     */
    onLoginClick: function() {
        console.log('🎯 Клик по кнопке входа');
        Marketplace.showLogin();
    },

    /**
     * Обработчик клика по профилю
     */
    onProfileClick: function() {
        console.log('🎯 Клик по кнопке профиля');
        this.down('tabpanel').setActiveTab(3);
    },

    /**
     * Обработчик клика по акциям
     */
    onPromotionsClick: function() {
        console.log('🎯 Клик по акциям');
        Ext.Msg.alert('Акции', 'Скоро здесь появятся специальные предложения!');
    },

    /**
     * Обработчик клика по доставке
     */
    onDeliveryClick: function() {
        console.log('🎯 Клик по доставке');
        Ext.Msg.alert('Доставка', 'Бесплатная доставка при заказе от 1500₽');
    },

    /**
     * Обработчик клика по контактам
     */
    onContactsClick: function() {
        console.log('🎯 Клик по контактам');
        Ext.Msg.alert('Контакты', 'Телефон: 8-800-123-45-67\nEmail: info@chistota-plus.ru');
    },

    /**
     * Обработчик смены вкладки
     */
    onTabChange: function(tabPanel, newCard) {
        console.log(`📋 Переключение на вкладку: ${newCard.title}`);
    }
});
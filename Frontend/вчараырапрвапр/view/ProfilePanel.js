/**
 * Панель профиля пользователя
 */
Ext.define('Marketplace.view.ProfilePanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.profilepanel',

    layout: 'fit',
    cls: 'profile-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('👤 Инициализация панели профиля');

        this.items = [this.createProfileContent()];

        this.callParent(arguments);
    },

    /**
     * Создание контента профиля
     * @returns {Object} конфиг контента
     */
    createProfileContent: function() {
        const userData = this.getUserData();

        if (userData) {
            return this.createAuthenticatedContent(userData);
        } else {
            return this.createUnauthenticatedContent();
        }
    },

    /**
     * Создание контента для авторизованного пользователя
     * @param {Object} userData - данные пользователя
     * @returns {Object} конфиг контента
     */
    createAuthenticatedContent: function(userData) {
        console.log('✅ Создание контента для авторизованного пользователя');

        return {
            xtype: 'panel',
            cls: 'profile-content',
            layout: 'vbox',
            items: [
                this.createProfileHeader(userData),
                this.createProfileInfo(userData),
                this.createProfileActions(),
                this.createOrderHistory()
            ]
        };
    },

    /**
     * Создание заголовка профиля
     * @param {Object} userData - данные пользователя
     * @returns {Object} конфиг заголовка
     */
    createProfileHeader: function(userData) {
        return {
            xtype: 'panel',
            cls: 'profile-header',
            html: [
                '<div class="profile-avatar">',
                userData.avatar ?
                    `<img src="${userData.avatar}" alt="Аватар">` :
                    '<div class="avatar-placeholder">👤</div>',
                '</div>',
                '<h2>Ваш профиль</h2>',
                `<p class="profile-welcome">Добро пожаловать, ${userData.firstName}!</p>`
            ].join('')
        };
    },

    /**
     * Создание информации профиля
     * @param {Object} userData - данные пользователя
     * @returns {Object} конфиг информации
     */
    createProfileInfo: function(userData) {
        return {
            xtype: 'panel',
            cls: 'profile-info',
            layout: 'table',
            defaults: {
                border: false
            },
            items: [
                {
                    xtype: 'component',
                    cls: 'info-row',
                    html: `<strong>Имя:</strong> ${userData.firstName} ${userData.lastName}`
                },
                {
                    xtype: 'component',
                    cls: 'info-row',
                    html: `<strong>Email:</strong> ${userData.email}`
                },
                {
                    xtype: 'component',
                    cls: 'info-row',
                    html: `<strong>Телефон:</strong> ${userData.phone || 'Не указан'}`
                },
                {
                    xtype: 'component',
                    cls: 'info-row',
                    html: `<strong>Дата регистрации:</strong> ${this.formatDate(userData.createdAt)}`
                }
            ]
        };
    },

    /**
     * Создание действий профиля
     * @returns {Object} конфиг действий
     */
    createProfileActions: function() {
        return {
            xtype: 'toolbar',
            cls: 'profile-actions',
            items: [
                {
                    xtype: 'button',
                    text: '✏️ Редактировать профиль',
                    handler: this.onEditProfile,
                    scope: this
                },
                '->',
                {
                    xtype: 'button',
                    text: '🚪 Выйти',
                    cls: 'logout-btn',
                    handler: this.onLogout,
                    scope: this
                }
            ]
        };
    },

    /**
     * Создание истории заказов
     * @returns {Object} конфиг истории заказов
     */
    createOrderHistory: function() {
        return {
            xtype: 'panel',
            cls: 'order-history',
            title: '📦 История заказов',
            flex: 1,
            items: [{
                xtype: 'dataview',
                store: this.createOrdersStore(),
                itemTpl: new Ext.XTemplate(
                    '<div class="order-item">',
                    '<div class="order-number"><strong>Заказ #{orderNumber}</strong></div>',
                    '<div class="order-date">{orderDate:date("d.m.Y")}</div>',
                    '<div class="order-status {status}">{status}</div>',
                    '<div class="order-total">{total}₽</div>',
                    '</div>'
                )
            }]
        };
    },

    /**
     * Создание контента для неавторизованного пользователя
     * @returns {Object} конфиг контента
     */
    createUnauthenticatedContent: function() {
        console.log('❌ Создание контента для неавторизованного пользователя');

        return {
            xtype: 'panel',
            cls: 'profile-unauth',
            html: [
                '<div class="unauth-content">',
                '<div class="unauth-icon">🔐</div>',
                '<h3>Требуется авторизация</h3>',
                '<p>Для доступа к профилю необходимо войти в систему</p>',
                '<div class="unauth-actions">',
                '<button onclick="Marketplace.showLogin()">Войти</button>',
                '<button onclick="Marketplace.showRegister()">Зарегистрироваться</button>',
                '</div>',
                '</div>'
            ].join('')
        };
    },

    /**
     * Получение данных пользователя
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
     * Форматирование даты
     * @param {String|Date} date - дата
     * @returns {String} отформатированная дата
     */
    formatDate: function(date) {
        if (!date) return 'Не указана';

        const dateObj = Ext.isDate(date) ? date : new Date(date);
        return Ext.Date.format(dateObj, 'd.m.Y');
    },

    /**
     * Создание store для заказов
     * @returns {Ext.data.Store} store заказов
     */
    createOrdersStore: function() {
        return Ext.create('Ext.data.Store', {
            fields: ['orderNumber', 'orderDate', 'status', 'total'],
            data: [] // Загружаются с сервера
        });
    },

    /**
     * Обработчик редактирования профиля
     */
    onEditProfile: function() {
        console.log('✏️ Редактирование профиля');
        Ext.Msg.alert('Редактирование', 'Функция редактирования профиля в разработке');
    },

    /**
     * Обработчик выхода из системы
     */
    onLogout: function() {
        console.log('🚪 Выход из системы из панели профиля');
        Marketplace.logout();
    }
});
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

        // Загружаем заказы если пользователь авторизован
        this.on('afterrender', this.loadUserData, this);
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
            xtype: 'tabpanel',
            cls: 'profile-tabpanel',
            items: [
                {
                    title: '👤 Информация',
                    layout: 'vbox',
                    items: [
                        this.createProfileHeader(userData),
                        this.createProfileInfo(userData),
                        this.createProfileActions()
                    ]
                },
                {
                    title: '📦 Мои заказы',
                    xtype: 'orderspanel',
                    reference: 'ordersPanel'
                }
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
            flex: 6,
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
            flex: 2,
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
            flex: 13,
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
     * Загрузка данных пользователя
     */
    loadUserData: function() {
        const userData = this.getUserData();
        if (userData) {
            this.loadOrders();
        }
    },

    /**
     * Загрузка заказов пользователя
     */
    loadOrders: function() {
        console.log('📦 Загрузка заказов пользователя');

        Marketplace.util.API.get('/orders')
            .then(function(response) {
                console.log('✅ Заказы загружены:', response.data);

                const ordersPanel = this.down('orderspanel');
                if (ordersPanel && ordersPanel.updateOrders) {
                    ordersPanel.updateOrders(response.data);
                }
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка загрузки заказов:', error);
                Marketplace.util.ErrorHandler.showError('Не удалось загрузить заказы');
            }.bind(this));
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

/**
 * Панель заказов пользователя
 */
Ext.define('Marketplace.view.OrdersPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.orderspanel',

    layout: 'fit',
    cls: 'orders-panel',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('📦 Инициализация панели заказов');

        this.items = [this.createOrdersGrid()];
        this.dockedItems = [this.createOrdersToolbar()];

        this.callParent(arguments);
    },

    /**
     * Создание сетки заказов
     * @returns {Object} конфиг сетки
     */
    createOrdersGrid: function() {
        return {
            xtype: 'grid',
            reference: 'ordersGrid',
            cls: 'orders-grid',
            store: this.createOrdersStore(),
            columns: [
                {
                    text: '№ Заказа',
                    dataIndex: 'orderNumber',
                    width: 120,
                    renderer: function(value) {
                        return `<strong>${value}</strong>`;
                    }
                },
                {
                    text: 'Дата',
                    dataIndex: 'orderDate',
                    width: 100,
                    renderer: function(value) {
                        return Ext.Date.format(new Date(value), 'd.m.Y');
                    }
                },
                {
                    text: 'Статус',
                    dataIndex: 'status',
                    width: 120,
                    renderer: function(value) {
                        const statusIcons = {
                            'Pending': '⏳',
                            'Processing': '⚙️',
                            'Shipped': '🚚',
                            'Delivered': '✅',
                            'Cancelled': '❌'
                        };
                        const icon = statusIcons[value] || '❓';
                        return `<span class="status-${value.toLowerCase()}">${icon} ${value}</span>`;
                    }
                },
                {
                    text: 'Сумма',
                    dataIndex: 'total',
                    width: 100,
                    renderer: function(value) {
                        return `<strong>${value}₽</strong>`;
                    }
                },
                {
                    text: 'Товаров',
                    dataIndex: 'itemsCount',
                    width: 80
                },
                {
                    text: 'Адрес доставки',
                    dataIndex: 'shippingAddress',
                    flex: 2,
                    renderer: function(value) {
                        return value || 'Не указан';
                    }
                },
                {
                    xtype: 'actioncolumn',
                    width: 150,
                    text: 'Действия',
                    items: [{
                        iconCls: 'x-fa fa-eye',
                        tooltip: 'Просмотр деталей',
                        handler: function(grid, rowIndex, colIndex, item, e, record) {
                            this.showOrderDetails(record);
                        },
                        scope: this
                    }, {
                        iconCls: 'x-fa fa-times',
                        tooltip: 'Отменить заказ',
                        getClass: function(value, metadata, record) {
                            // Показывать только для заказов, которые можно отменить
                            return record.get('status') === 'Pending' ||
                            record.get('status') === 'Processing' ?
                                'cancel-btn' : 'x-hidden';
                        },
                        handler: function(grid, rowIndex, colIndex, item, e, record) {
                            this.cancelOrder(record);
                        },
                        scope: this
                    }, {
                        iconCls: 'x-fa fa-trash',
                        tooltip: 'Удалить заказ',
                        getClass: function(value, metadata, record) {
                            // Показывать только для отмененных или доставленных заказов
                            return record.get('status') === 'Cancelled' ||
                            record.get('status') === 'Delivered' ?
                                'delete-btn' : 'x-hidden';
                        },
                        handler: function(grid, rowIndex, colIndex, item, e, record) {
                            this.deleteOrder(record);
                        },
                        scope: this
                    }]
                }
            ],
            listeners: {
                itemdblclick: function(grid, record) {
                    this.showOrderDetails(record);
                },
                scope: this
            }
        };
    },

    /**
     * Создание тулбара для заказов
     * @returns {Object} конфиг тулбара
     */
    createOrdersToolbar: function() {
        return {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    text: '🔄 Обновить',
                    iconCls: 'x-fa fa-refresh',
                    handler: this.refreshOrders,
                    scope: this
                },
                '->',
                {
                    xtype: 'component',
                    html: '<span class="orders-stats">Всего заказов: <span id="ordersCount">0</span></span>'
                }
            ]
        };
    },

    /**
     * Создание store для заказов
     * @returns {Ext.data.Store} store заказов
     */
    createOrdersStore: function() {
        return Ext.create('Ext.data.Store', {
            fields: [
                'id', 'orderNumber', 'orderDate', 'status',
                'total', 'itemsCount', 'shippingAddress', 'paymentMethod',
                {name: 'items', type: 'auto'}
            ],
            sorters: [{
                property: 'orderDate',
                direction: 'DESC'
            }]
        });
    },

    /**
     * Обновление заказов
     * @param {Array} ordersData - данные заказов
     */
    updateOrders: function(ordersData) {
        console.log('📦 Обновление списка заказов:', ordersData);

        const store = this.down('grid').getStore();
        store.loadData(ordersData || []);

        // Обновляем статистику
        this.updateOrdersStats(store.getCount());
    },

    /**
     * Обновление статистики заказов
     * @param {Number} count - количество заказов
     */
    updateOrdersStats: function(count) {
        const statsElement = document.getElementById('ordersCount');
        if (statsElement) {
            statsElement.textContent = count;
        }
    },

    /**
     * Обновление заказов
     */
    refreshOrders: function() {
        console.log('🔄 Обновление заказов');

        Marketplace.util.API.get('/orders')
            .then(function(response) {
                console.log('✅ Заказы обновлены');
                this.updateOrders(response.data);
                Marketplace.util.ErrorHandler.showInfo('Список заказов обновлен');
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка обновления заказов:', error);
                Marketplace.util.ErrorHandler.showError('Не удалось обновить заказы');
            }.bind(this));
    },

    /**
     * Показать детали заказа
     * @param {Ext.data.Model} record - модель заказа
     */
    showOrderDetails: function(record) {
        console.log('📖 Просмотр деталей заказа:', record.get('orderNumber'));

        const orderData = record.getData();
        const itemsHtml = this.createOrderItemsHtml(orderData.items || []);

        const html = [
            '<div class="order-details">',
            `<h2>📦 Заказ ${orderData.orderNumber}</h2>`,
            '<div class="order-details-info">',
            `<div class="detail-row"><strong>Дата:</strong> ${Ext.Date.format(new Date(orderData.orderDate), 'd.m.Y H:i')}</div>`,
            `<div class="detail-row"><strong>Статус:</strong> <span class="status-${orderData.status.toLowerCase()}">${orderData.status}</span></div>`,
            `<div class="detail-row"><strong>Сумма:</strong> <strong>${orderData.total}₽</strong></div>`,
            `<div class="detail-row"><strong>Товаров:</strong> ${orderData.itemsCount}</div>`,
            `<div class="detail-row"><strong>Адрес доставки:</strong> ${orderData.shippingAddress || 'Не указан'}</div>`,
            `<div class="detail-row"><strong>Способ оплаты:</strong> ${orderData.paymentMethod || 'Не указан'}</div>`,
            '</div>',
            itemsHtml,
            '</div>'
        ].join('');

        Ext.Msg.show({
            title: `Заказ ${orderData.orderNumber}`,
            msg: html,
            buttons: Ext.Msg.OK,
            width: 600,
            maxHeight: 500,
            scrollable: true
        });
    },

    /**
     * Создание HTML для товаров заказа
     * @param {Array} items - товары заказа
     * @returns {String} HTML строка
     */
    createOrderItemsHtml: function(items) {
        if (!items || items.length === 0) {
            return '<div class="no-items">Нет товаров в заказе</div>';
        }

        const itemsHtml = items.map(function(item) {
            return [
                '<div class="order-item-detail">',
                `<div class="item-name">${item.productName || 'Товар'}</div>`,
                `<div class="item-quantity">${item.quantity} × ${item.unitPrice}₽ = ${item.totalPrice}₽</div>`,
                '</div>'
            ].join('');
        }).join('');

        return [
            '<div class="order-items">',
            '<h3>📋 Состав заказа:</h3>',
            '<div class="items-list">',
            itemsHtml,
            '</div>',
            '</div>'
        ].join('');
    },

    /**
     * Отменить заказ
     * @param {Ext.data.Model} record - модель заказа
     */
    cancelOrder: function(record) {
        console.log('❌ Отмена заказа:', record.get('id'));

        Ext.Msg.confirm(
            'Отмена заказа',
            `Вы уверены, что хотите отменить заказ ${record.get('orderNumber')}?`,
            function(btn) {
                if (btn === 'yes') {
                    this.processCancelOrder(record);
                }
            },
            this
        );
    },

    /**
     * Обработка отмены заказа
     * @param {Ext.data.Model} record - модель заказа
     */
    processCancelOrder: function(record) {
        const orderId = record.get('id');

        Marketplace.util.API.post(`/orders/${orderId}/cancel`)
            .then(function(response) {
                console.log('✅ Заказ отменен:', response.data);

                // Обновляем статус в store
                record.set('status', 'Cancelled');

                // Обновляем сетку
                record.commit();

                Marketplace.util.ErrorHandler.showInfo('Заказ успешно отменен');

                // Обновляем список заказов
                this.refreshOrders();
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка отмены заказа:', error);
                Marketplace.util.ErrorHandler.showError('Не удалось отменить заказ');
            }.bind(this));
    },

    /**
     * Удалить заказ
     * @param {Ext.data.Model} record - модель заказа
     */
    deleteOrder: function(record) {
        console.log('🗑️ Удаление заказа:', record.get('id'));

        Ext.Msg.confirm(
            'Удаление заказа',
            `Вы уверены, что хотите удалить заказ ${record.get('orderNumber')}?<br><br>
             <span style="color: #666; font-size: 12px;">
             Внимание: это действие нельзя отменить. Заказ будет удален из истории.
             </span>`,
            function(btn) {
                if (btn === 'yes') {
                    this.processDeleteOrder(record);
                }
            },
            this
        );
    },

    /**
     * Обработка удаления заказа
     * @param {Ext.data.Model} record - модель заказа
     */
    processDeleteOrder: function(record) {
        // Здесь должна быть логика API для удаления заказа
        // Marketplace.util.API.delete(`/orders/${record.get('id')}`)

        // Показываем сообщение что функционал в разработке
        Marketplace.util.ErrorHandler.showInfo('Функция удаления заказов в разработке');

        // Для демо просто удаляем из store
        // const store = this.down('grid').getStore();
        // store.remove(record);
    }
});
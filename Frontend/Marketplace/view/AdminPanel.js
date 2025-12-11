/**
 * Панель администрирования
 */
Ext.define('Marketplace.view.AdminPanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.adminpanel',

    title: '👑 Админ-панель',
    cls: 'admin-panel',

    requires: [
        'Marketplace.store.AdminUsers',
        'Marketplace.store.AdminProducts',
        'Marketplace.store.AdminNews'
    ],

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('👑 Инициализация админ-панели');

        this.items = [
            this.createUsersTab(),
            this.createProductsTab(),
            this.createNewsTab(),
            this.createStatsTab()
        ];

        this.callParent(arguments);

        // Загружаем данные при открытии
        this.on('activate', function() {
            console.log('📥 Загрузка данных админ-панели');
            this.loadAdminData();
        }, this);
    },

    /**
     * Создание вкладки управления пользователями
     */
    createUsersTab: function() {
        return {
            title: '👥 Пользователи',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                reference: 'usersGrid',
                store: Ext.create('Marketplace.store.AdminUsers', {
                    storeId: 'AdminUsers'
                }),
                dockedItems: [this.createUsersToolbar()],
                columns: [{
                    text: 'ID',
                    dataIndex: 'id',
                    width: 60
                }, {
                    text: 'Имя',
                    dataIndex: 'firstName',
                    flex: 1
                }, {
                    text: 'Фамилия',
                    dataIndex: 'lastName',
                    flex: 1
                }, {
                    text: 'Email',
                    dataIndex: 'email',
                    flex: 2
                }, {
                    text: 'Телефон',
                    dataIndex: 'phone',
                    flex: 1
                }, {
                    text: 'Статус',
                    dataIndex: 'isBanned',
                    width: 100,
                    renderer: function(value) {
                        return value ?
                            '<span style="color: red">🚫 Заблокирован</span>' :
                            '<span style="color: green">✅ Активен</span>';
                    }
                }, {
                    text: 'Регистрация',
                    dataIndex: 'createdAt',
                    width: 120,
                    renderer: Ext.util.Format.dateRenderer('d.m.Y')
                }],
                listeners: {
                    itemdblclick: function(grid, record) {
                        this.showUserDetails(record);
                    },
                    scope: this
                }
            }]
        };
    },

    /**
     * Создание тулбара для управления пользователями
     */
    createUsersToolbar: function() {
        return {
            xtype: 'toolbar',
            dock: 'top',
            internalName: 'usersToolbar',
            items: [{
                text: '🔄 Обновить',
                action: 'refreshUsers',
                handler: function() {
                    const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                    adminCtrl.refreshUsers();
                }
            }, {
                text: '🚫 Заблокировать',
                action: 'banUser',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.banUser(selection[0].get('id'));
                    }
                }
            }, {
                text: '✅ Разблокировать',
                action: 'unbanUser',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.unbanUser(selection[0].get('id'));
                    }
                }
            }, {
                text: '🔑 Сбросить пароль',
                action: 'resetPassword',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.resetUserPassword(selection[0].get('id'));
                    }
                }
            }, '->', {
                xtype: 'textfield',
                emptyText: '🔍 Поиск пользователей...',
                width: 200,
                listeners: {
                    change: function(field, value) {
                        const grid = field.up('grid');
                        const store = grid.getStore();

                        if (value) {
                            store.filterBy(function(record) {
                                const search = value.toLowerCase();
                                return (
                                    (record.get('firstName') || '').toLowerCase().includes(search) ||
                                    (record.get('lastName') || '').toLowerCase().includes(search) ||
                                    (record.get('email') || '').toLowerCase().includes(search) ||
                                    (record.get('phone') || '').toLowerCase().includes(search)
                                );
                            });
                        } else {
                            store.clearFilter();
                        }
                    },
                    buffer: 500
                }
            }]
        };
    },

    /**
     * Создание вкладки управления товарами
     */
    createProductsTab: function() {
        return {
            title: '🛍️ Товары',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                reference: 'productsGrid',
                store: Ext.create('Marketplace.store.AdminProducts', {
                    storeId: 'AdminProducts'
                }),
                dockedItems: [this.createProductsToolbar()],
                columns: [{
                    text: 'ID',
                    dataIndex: 'id',
                    width: 60
                }, {
                    text: 'Название',
                    dataIndex: 'name',
                    flex: 2
                }, {
                    text: 'Бренд',
                    dataIndex: 'brand',
                    flex: 1
                }, {
                    text: 'Категория',
                    dataIndex: 'category',
                    flex: 1
                }, {
                    text: 'Цена',
                    dataIndex: 'price',
                    width: 100,
                    renderer: function(value) {
                        return value + '₽';
                    }
                }, {
                    text: 'Наличие',
                    dataIndex: 'inStock',
                    width: 100,
                    renderer: function(value) {
                        return value ?
                            '<span style="color: green">✅ В наличии</span>' :
                            '<span style="color: red">❌ Нет в наличии</span>';
                    }
                }, {
                    text: 'Кол-во',
                    dataIndex: 'stockQuantity',
                    width: 80
                }, {
                    text: 'Создан',
                    dataIndex: 'createdAt',
                    width: 120,
                    renderer: Ext.util.Format.dateRenderer('d.m.Y')
                }],
                listeners: {
                    itemdblclick: function(grid, record) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.showEditProductWindow(record.get('id'));
                    },
                    scope: this
                }
            }]
        };
    },

    /**
     * Создание тулбара для управления товарами
     */
    createProductsToolbar: function() {
        return {
            xtype: 'toolbar',
            dock: 'top',
            internalName: 'productsToolbar',
            items: [{
                text: '🔄 Обновить',
                action: 'refreshProducts',
                handler: function() {
                    const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                    adminCtrl.refreshProducts();
                }
            }, {
                text: '➕ Создать',
                action: 'createProduct',
                handler: function() {
                    const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                    adminCtrl.showCreateProductWindow();
                }
            }, {
                text: '✏️ Редактировать',
                action: 'editProduct',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.showEditProductWindow(selection[0].get('id'));
                    }
                }
            }, {
                text: '🗑️ Удалить',
                action: 'deleteProduct',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.deleteProduct(selection[0].get('id'));
                    }
                }
            }, '->', {
                xtype: 'textfield',
                emptyText: '🔍 Поиск товаров...',
                width: 200,
                listeners: {
                    change: function(field, value) {
                        const grid = field.up('grid');
                        const store = grid.getStore();

                        if (value) {
                            store.filterBy(function(record) {
                                const search = value.toLowerCase();
                                return (
                                    (record.get('name') || '').toLowerCase().includes(search) ||
                                    (record.get('brand') || '').toLowerCase().includes(search) ||
                                    (record.get('category') || '').toLowerCase().includes(search) ||
                                    (record.get('description') || '').toLowerCase().includes(search)
                                );
                            });
                        } else {
                            store.clearFilter();
                        }
                    },
                    buffer: 500
                }
            }]
        };
    },

    /**
     * Создание вкладки управления новостями
     */
    createNewsTab: function() {
        return {
            title: '📰 Новости',
            layout: 'fit',
            items: [{
                xtype: 'grid',
                reference: 'newsGrid',
                store: Ext.create('Marketplace.store.AdminNews', {
                    storeId: 'AdminNews'
                }),
                dockedItems: [this.createNewsToolbar()],
                columns: [{
                    text: 'ID',
                    dataIndex: 'id',
                    width: 60
                }, {
                    text: 'Заголовок',
                    dataIndex: 'title',
                    flex: 3
                }, {
                    text: 'Автор',
                    dataIndex: 'author',
                    width: 120
                }, {
                    text: 'Статус',
                    dataIndex: 'isActive',
                    width: 100,
                    renderer: function(value) {
                        return value ?
                            '<span style="color: green">✅ Активна</span>' :
                            '<span style="color: orange">⏸️ Неактивна</span>';
                    }
                }, {
                    text: 'Дата',
                    dataIndex: 'publishedAt',
                    width: 120,
                    renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')
                }, {
                    text: 'Изображение',
                    dataIndex: 'image',
                    width: 100,
                    renderer: function(value) {
                        return value ?
                            '<span class="x-fa fa-image" style="color: green"></span>' :
                            '<span class="x-fa fa-times" style="color: red"></span>';
                    }
                }],
                listeners: {
                    itemdblclick: function(grid, record) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.showEditNewsWindow(record.get('id'));
                    },
                    scope: this
                }
            }]
        };
    },

    /**
     * Создание тулбара для управления новостями
     */
    createNewsToolbar: function() {
        return {
            xtype: 'toolbar',
            dock: 'top',
            internalName: 'newsToolbar',
            items: [{
                text: '🔄 Обновить',
                action: 'refreshNews',
                handler: function() {
                    const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                    adminCtrl.refreshNews();
                }
            }, {
                text: '➕ Создать',
                action: 'createNews',
                handler: function() {
                    const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                    adminCtrl.showCreateNewsWindow();
                }
            }, {
                text: '✏️ Редактировать',
                action: 'editNews',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.showEditNewsWindow(selection[0].get('id'));
                    }
                }
            }, {
                text: '🗑️ Удалить',
                action: 'deleteNews',
                disabled: true,
                handler: function() {
                    const grid = this.up('grid');
                    const selection = grid.getSelection();
                    if (selection.length > 0) {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.deleteNews(selection[0].get('id'));
                    }
                }
            }]
        };
    },

    /**
     * Создание вкладки статистики
     */
    createStatsTab: function() {
        return {
            title: '📊 Статистика',
            layout: 'vbox',
            reference: 'statsPanel',
            items: [{
                xtype: 'panel',
                title: '📈 Общая статистика',
                bodyPadding: 20,
                items: [{
                    xtype: 'component',
                    reference: 'statsComponent',
                    tpl: new Ext.XTemplate(
                        '<div class="stats-container">',
                        '<div class="stat-item">',
                        '<div class="stat-icon">👥</div>',
                        '<div class="stat-value">{totalUsers}</div>',
                        '<div class="stat-label">Всего пользователей</div>',
                        '</div>',
                        '<div class="stat-item">',
                        '<div class="stat-icon">🚫</div>',
                        '<div class="stat-value">{bannedUsers}</div>',
                        '<div class="stat-label">Заблокировано</div>',
                        '</div>',
                        '<div class="stat-item">',
                        '<div class="stat-icon">✅</div>',
                        '<div class="stat-value">{activeUsers}</div>',
                        '<div class="stat-label">Активных (7 дней)</div>',
                        '</div>',
                        '</div>'
                    ),
                    data: {
                        totalUsers: '...',
                        bannedUsers: '...',
                        activeUsers: '...'
                    }
                }],
                buttons: [{
                    text: '🔄 Обновить статистику',
                    handler: function() {
                        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');
                        adminCtrl.getUserStats();
                    }
                }]
            }, {
                xtype: 'panel',
                title: '📦 Статистика товаров',
                flex: 1,
                margin: '10 0 0 0',
                bodyPadding: 20,
                items: [{
                    xtype: 'component',
                    html: '<div style="text-align: center; padding: 20px;">Статистика товаров будет доступна позже</div>'
                }]
            }],
            // Добавляем метод для обновления статистики
            updateStats: function(statsData) {
                console.log('📊 Обновление статистики:', statsData);

                const statsComponent = this.down('component[reference=statsComponent]');
                if (statsComponent) {
                    statsComponent.update(statsData);
                } else {
                    console.error('❌ Компонент статистики не найден');
                }
            }
        };
    },

    /**
     * Показать детали пользователя
     */
    showUserDetails: function(record) {
        console.log('👤 Просмотр деталей пользователя:', record.get('id'));

        const html = [
            '<div class="user-details">',
            '<h2>👤 Детали пользователя</h2>',
            '<div class="detail-row"><strong>ID:</strong> ' + record.get('id') + '</div>',
            '<div class="detail-row"><strong>Имя:</strong> ' + record.get('firstName') + '</div>',
            '<div class="detail-row"><strong>Фамилия:</strong> ' + record.get('lastName') + '</div>',
            '<div class="detail-row"><strong>Email:</strong> ' + record.get('email') + '</div>',
            '<div class="detail-row"><strong>Телефон:</strong> ' + (record.get('phone') || 'Не указан') + '</div>',
            '<div class="detail-row"><strong>Статус:</strong> ' + (record.get('isBanned') ? '🚫 Заблокирован' : '✅ Активен') + '</div>',
            '<div class="detail-row"><strong>Дата регистрации:</strong> ' + Ext.Date.format(new Date(record.get('createdAt')), 'd.m.Y H:i') + '</div>',
            '</div>'
        ].join('');

        Ext.Msg.show({
            title: 'Детали пользователя',
            msg: html,
            buttons: Ext.Msg.OK,
            width: 400
        });
    },

    /**
     * Загрузка данных админ-панели
     */
    loadAdminData: function() {
        console.log('📥 Загрузка данных для админ-панели');

        // Получаем контроллер админа
        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');

        if (!adminCtrl) {
            console.error('❌ Контроллер Admin не найден');
            return;
        }
        
        // Загружаем все данные
        adminCtrl.refreshUsers();
        adminCtrl.refreshProducts();
        adminCtrl.refreshNews();
        adminCtrl.getUserStats();
    }
});
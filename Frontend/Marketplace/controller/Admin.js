/**
 * Контроллер админ-панели
 */
Ext.define('Marketplace.controller.Admin', {
    extend: 'Ext.app.Controller',

    /**
     * Инициализация контроллера
     */
    init: function() {
        console.log('👑 Инициализация Admin контроллера');

        this.control({
            'adminpanel button[action=refreshUsers]': {
                click: this.refreshUsers
            },
            'adminpanel button[action=refreshProducts]': {
                click: this.refreshProducts
            },
            'adminpanel button[action=refreshNews]': {
                click: this.refreshNews
            },
            'adminpanel button[action=createProduct]': {
                click: this.showCreateProductWindow
            },
            'adminpanel button[action=createNews]': {
                click: this.showCreateNewsWindow
            },
            'adminpanel grid[reference=usersGrid]': {
                selectionchange: this.onUserSelectionChange
            },
            'adminpanel grid[reference=productsGrid]': {
                selectionchange: this.onProductSelectionChange
            },
            'adminpanel grid[reference=newsGrid]': {
                selectionchange: this.onNewsSelectionChange
            }
        });

        // Проверяем права админа при запуске
        this.checkAdminAccess();
    },

    /**
     * Проверка прав администратора
     */
    checkAdminAccess: function() {
        const userData = this.getCurrentUser();

        if (!userData) {
            console.log('⚠️ Пользователь не авторизован');
            return false;
        }

        // Проверяем уровень доступа через API
        return this.getAccessLevel().then(level => {
            const isAdmin = level > 0;
            console.log(`🔐 Уровень доступа: ${level}, Админ: ${isAdmin}`);

            if (isAdmin) {
                this.addAdminTab();
            }

            return isAdmin;
        }).catch(() => false);
    },

    /**
     * Получить уровень доступа текущего пользователя
     */
    getAccessLevel: function() {
        return new Promise((resolve, reject) => {
            Marketplace.util.API.get('/auth/me')
                .then(response => {
                    resolve(response.data.accessLevel || 0);
                })
                .catch(() => resolve(0));
        });
    },

    /**
     * Получить данные текущего пользователя
     */
    getCurrentUser: function() {
        try {
            return JSON.parse(localStorage.getItem('userData'));
        } catch (e) {
            return null;
        }
    },

    /**
     * Добавить вкладку админ-панели
     */
    addAdminTab: function() {
        console.log('➕ Добавление вкладки админ-панели');

        const mainTabPanel = Ext.ComponentQuery.query('mainpanel tabpanel')[0];
        if (!mainTabPanel) {
            console.error('❌ TabPanel не найден');
            return;
        }

        // Проверяем, не добавлена ли уже вкладка
        const existingTab = mainTabPanel.down('adminpanel');
        if (existingTab) {
            console.log('✅ Вкладка админ-панели уже существует');
            return;
        }

        // Создаем и добавляем админ-панель
        const adminPanel = Ext.create('Marketplace.view.AdminPanel', {
            title: '👑 Админ-панель',
            closable: false
        });

        mainTabPanel.add(adminPanel);
        console.log('✅ Вкладка админ-панели добавлена');
    },

    /**
     * Обновить список пользователей (прямой AJAX вызов)
     */
    refreshUsers: function() {
        console.log('🔄 Обновление списка пользователей');

        const usersGrid = Ext.ComponentQuery.query('adminpanel grid[reference=usersGrid]')[0];
        if (!usersGrid) {
            console.error('❌ Grid пользователей не найден');
            return;
        }

        // Используем Marketplace.util.API
        Marketplace.util.API.get('/admin/users?page=1&pageSize=50')
            .then(response => {
                const usersData = response.data?.items || [];
                console.log(`✅ Пользователи загружены: ${usersData.length}`);

                // Очищаем store
                const store = usersGrid.getStore();
                store.removeAll();

                // Добавляем данные
                if (usersData.length > 0) {
                    usersData.forEach(user => {
                        store.add(user);
                    });
                }

                usersGrid.fireEvent('load', store, usersData, true);
            })
            .catch(error => {
                console.error('❌ Ошибка загрузки пользователей:', error);
                Marketplace.util.ErrorHandler.showError(error, 'Ошибка загрузки');
            });
    },

    /**
     * Обновить список товаров (прямой AJAX вызов)
     */
    refreshProducts: function() {
        console.log('🔄 Обновление списка товаров');

        const productsGrid = Ext.ComponentQuery.query('adminpanel grid[reference=productsGrid]')[0];
        if (!productsGrid) {
            console.error('❌ Grid товаров не найден');
            return;
        }

        // Используем Marketplace.util.API
        Marketplace.util.API.get('/products?page=1&pageSize=100')
            .then(response => {
                const productsData = response.data?.products || [];
                console.log(`✅ Товары загружены: ${productsData.length}`);

                // Очищаем store
                const store = productsGrid.getStore();
                store.removeAll();

                // Добавляем данные
                if (productsData.length > 0) {
                    productsData.forEach(product => {
                        store.add(product);
                    });
                }

                productsGrid.fireEvent('load', store, productsData, true);
            })
            .catch(error => {
                console.error('❌ Ошибка загрузки товаров:', error);
            });
    },

    /**
     * Обновить список новостей (прямой AJAX вызов)
     */
    refreshNews: function() {
        console.log('🔄 Обновление списка новостей');

        const newsGrid = Ext.ComponentQuery.query('adminpanel grid[reference=newsGrid]')[0];
        if (!newsGrid) {
            console.error('❌ Grid новостей не найден');
            return;
        }

        // Используем Marketplace.util.API
        Marketplace.util.API.get('/news/newsAll?page=1&pageSize=50')
            .then(response => {
                const newsData = response.data?.items || [];
                console.log(`✅ Новости загружены: ${newsData.length}`);

                // Очищаем store
                const store = newsGrid.getStore();
                store.removeAll();

                // Добавляем данные
                if (newsData.length > 0) {
                    newsData.forEach(news => {
                        store.add(news);
                    });
                }

                newsGrid.fireEvent('load', store, newsData, true);
            })
            .catch(error => {
                console.error('❌ Ошибка загрузки новостей:', error);
            });
    },

    /**
     * Загрузить данные админ-панели при активации
     */
    loadAdminData: function() {
        console.log('📥 Загрузка данных админ-панели');

        // Загружаем все данные последовательно
        this.refreshUsers();
        this.refreshProducts();
        this.refreshNews();

        // Загружаем статистику
        this.getUserStats();
    },

    /**
     * Обработчик выбора пользователя
     */
    onUserSelectionChange: function(selModel, selected) {
        console.log('👤 onUserSelectionChange вызван');
        console.log('📊 selModel:', selModel);
        console.log('✅ selected:', selected);

        // Получаем grid из selection model
        const grid = selModel.view ? selModel.view.up('grid') : null;
        if (!grid) {
            console.error('❌ Grid не найден');
            return;
        }

        // Получаем adminpanel и toolbar
        const adminPanel = grid.up('adminpanel');
        if (!adminPanel) {
            console.error('❌ AdminPanel не найден');
            return;
        }

        const toolbar = adminPanel.down('toolbar[internalName=usersToolbar]');
        if (!toolbar) {
            console.error('❌ Toolbar не найден');
            return;
        }

        const hasSelection = selected && selected.length > 0;
        const selectedUser = hasSelection ? selected[0] : null;

        console.log(`🔍 Состояние: hasSelection=${hasSelection}, selectedUser=${selectedUser ? selectedUser.get('id') : 'none'}`);

        const banBtn = toolbar.down('button[action=banUser]');
        const unbanBtn = toolbar.down('button[action=unbanUser]');
        const resetPassBtn = toolbar.down('button[action=resetPassword]');

        if (banBtn) {
            const isBanned = selectedUser ? selectedUser.get('isBanned') : false;
            banBtn.setDisabled(!hasSelection || isBanned);
            console.log(`🚫 Ban button: disabled=${!hasSelection || isBanned}`);
        }

        if (unbanBtn) {
            const isBanned = selectedUser ? selectedUser.get('isBanned') : false;
            unbanBtn.setDisabled(!hasSelection || !isBanned);
            console.log(`✅ Unban button: disabled=${!hasSelection || !isBanned}`);
        }

        if (resetPassBtn) {
            resetPassBtn.setDisabled(!hasSelection);
            console.log(`🔑 Reset password button: disabled=${!hasSelection}`);
        }
    },

    /**
     * Обработчик выбора товара
     */
    onProductSelectionChange: function(selModel, selected) {
        console.log('🛍️ onProductSelectionChange вызван');

        const grid = selModel.view ? selModel.view.up('grid') : null;
        if (!grid) return;

        const adminPanel = grid.up('adminpanel');
        if (!adminPanel) return;

        const toolbar = adminPanel.down('toolbar[internalName=productsToolbar]');
        if (!toolbar) return;

        const hasSelection = selected && selected.length > 0;

        const editBtn = toolbar.down('button[action=editProduct]');
        const deleteBtn = toolbar.down('button[action=deleteProduct]');

        if (editBtn) {
            editBtn.setDisabled(!hasSelection);
            console.log(`✏️ Edit product button: disabled=${!hasSelection}`);
        }

        if (deleteBtn) {
            deleteBtn.setDisabled(!hasSelection);
            console.log(`🗑️ Delete product button: disabled=${!hasSelection}`);
        }
    },

    /**
     * Обработчик выбора новости
     */
    onNewsSelectionChange: function(selModel, selected) {
        console.log('📰 onNewsSelectionChange вызван');

        const grid = selModel.view ? selModel.view.up('grid') : null;
        if (!grid) return;

        const adminPanel = grid.up('adminpanel');
        if (!adminPanel) return;

        const toolbar = adminPanel.down('toolbar[internalName=newsToolbar]');
        if (!toolbar) return;

        const hasSelection = selected && selected.length > 0;

        const editBtn = toolbar.down('button[action=editNews]');
        const deleteBtn = toolbar.down('button[action=deleteNews]');

        if (editBtn) {
            editBtn.setDisabled(!hasSelection);
            console.log(`✏️ Edit news button: disabled=${!hasSelection}`);
        }

        if (deleteBtn) {
            deleteBtn.setDisabled(!hasSelection);
            console.log(`🗑️ Delete news button: disabled=${!hasSelection}`);
        }
    },
    /**
     * Заблокировать пользователя
     */
    banUser: function(userId) {
        console.log(`🚫 Блокировка пользователя ID: ${userId}`);

        Marketplace.util.API.post(`/admin/users/${userId}/ban`, {})
            .then(response => {
                console.log('✅ Пользователь заблокирован');
                this.refreshUsers();
                Marketplace.util.ErrorHandler.showInfo('Пользователь заблокирован');
            })
            .catch(error => {
                console.error('❌ Ошибка блокировки:', error);
                Marketplace.util.ErrorHandler.showError('Ошибка блокировки пользователя');
            });
    },

    /**
     * Разблокировать пользователя
     */
    unbanUser: function(userId) {
        console.log(`✅ Разблокировка пользователя ID: ${userId}`);

        Marketplace.util.API.post(`/admin/users/${userId}/unban`, {})
            .then(response => {
                console.log('✅ Пользователь разблокирован');
                this.refreshUsers();
                Marketplace.util.ErrorHandler.showInfo('Пользователь разблокирован');
            })
            .catch(error => {
                console.error('❌ Ошибка разблокировки:', error);
                Marketplace.util.ErrorHandler.showError('Ошибка разблокировки пользователя');
            });
    },

    /**
     * Сбросить пароль пользователя
     */
    resetUserPassword: function(userId) {
        console.log(`🔑 Сброс пароля пользователя ID: ${userId}`);

        Ext.Msg.prompt('Сброс пароля', 'Введите новый пароль:', (btn, text) => {
            if (btn === 'ok' && text) {
                if (text.length < 6) {
                    Marketplace.util.ErrorHandler.showWarning('Пароль должен быть не менее 6 символов');
                    return;
                }

                Marketplace.util.API.post(`/admin/users/${userId}/reset-password`, {
                    newPassword: text
                })
                    .then(response => {
                        console.log('✅ Пароль сброшен');
                        Marketplace.util.ErrorHandler.showInfo('Пароль успешно изменен');
                    })
                    .catch(error => {
                        console.error('❌ Ошибка сброса пароля:', error);
                        Marketplace.util.ErrorHandler.showError('Ошибка сброса пароля');
                    });
            }
        }, this, false, '', {
            inputType: 'password'
        });
    },

    /**
     * Показать окно создания товара
     */
    showCreateProductWindow: function() {
        console.log('➕ Открытие окна создания товара');

        const window = Ext.create('Marketplace.view.ProductEditWindow', {
            title: 'Создание товара',
            mode: 'create'
        });

        window.show();
    },

    /**
     * Показать окно редактирования товара
     */
    showEditProductWindow: function(productId) {
        console.log(`✏️ Редактирование товара ID: ${productId}`);

        const productsGrid = Ext.ComponentQuery.query('adminpanel grid[reference=productsGrid]')[0];
        if (!productsGrid) return;

        const product = productsGrid.getStore().getById(productId);
        if (!product) return;

        const window = Ext.create('Marketplace.view.ProductEditWindow', {
            title: 'Редактирование товара',
            mode: 'edit',
            productId: productId,
            productData: product.getData()
        });

        window.show();
    },

    /**
     * Удалить товар
     */
    deleteProduct: function(productId) {
        console.log(`🗑️ Удаление товара ID: ${productId}`);

        Ext.Msg.confirm('Удаление', 'Вы уверены, что хотите удалить этот товар?', (btn) => {
            if (btn === 'yes') {
                Marketplace.util.API.delete(`/products/${productId}`)
                    .then(response => {
                        console.log('✅ Товар удален');
                        this.refreshProducts();
                        Marketplace.util.ErrorHandler.showInfo('Товар успешно удален');
                    })
                    .catch(error => {
                        console.error('❌ Ошибка удаления:', error);
                        Marketplace.util.ErrorHandler.showError('Ошибка удаления товара');
                    });
            }
        }, this);
    },

    /**
     * Показать окно создания новости
     */
    showCreateNewsWindow: function() {
        console.log('➕ Открытие окна создания новости');

        const window = Ext.create('Marketplace.view.NewsEditWindow', {
            title: 'Создание новости',
            mode: 'create'
        });

        window.show();
    },

    /**
     * Показать окно редактирования новости
     */
    showEditNewsWindow: function(newsId) {
        console.log(`✏️ Редактирование новости ID: ${newsId}`);

        const newsGrid = Ext.ComponentQuery.query('adminpanel grid[reference=newsGrid]')[0];
        if (!newsGrid) return;

        const news = newsGrid.getStore().getById(newsId);
        if (!news) return;

        const window = Ext.create('Marketplace.view.NewsEditWindow', {
            title: 'Редактирование новости',
            mode: 'edit',
            newsId: newsId,
            newsData: news.getData()
        });

        window.show();
    },

    /**
     * Удалить новость
     */
    deleteNews: function(newsId) {
        console.log(`🗑️ Удаление новости ID: ${newsId}`);

        Ext.Msg.confirm('Удаление', 'Вы уверены, что хотите удалить эту новость?', (btn) => {
            if (btn === 'yes') {
                Marketplace.util.API.delete(`/news/${newsId}`)
                    .then(response => {
                        console.log('✅ Новость удалена');
                        this.refreshNews();
                        Marketplace.util.ErrorHandler.showInfo('Новость успешно удалена');
                    })
                    .catch(error => {
                        console.error('❌ Ошибка удаления:', error);
                        Marketplace.util.ErrorHandler.showError('Ошибка удаления новости');
                    });
            }
        }, this);
    },

    /**
     * Получить статистику пользователей (прямой AJAX вызов)
     */
    getUserStats: function() {
        console.log('📊 Получение статистики пользователей');

        Marketplace.util.API.get('/admin/users/stats')
            .then(response => {
                const stats = response.data || {};
                console.log('📈 Статистика:', stats);

                // Обновляем панель статистики если есть
                const statsPanel = Ext.ComponentQuery.query('adminpanel panel[reference=statsPanel]')[0];
                if (statsPanel) {
                    statsPanel.updateStats({
                        totalUsers: stats.total || 0,
                        bannedUsers: stats.banned || 0,
                        activeUsers: stats.active7d || 0
                    });
                }
            })
            .catch(error => {
                console.warn('⚠️ Ошибка получения статистики:', error);
            });
    }
});
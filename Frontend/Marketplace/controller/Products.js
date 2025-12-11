/**
 * Контроллер управления товарами и корзиной
 */
Ext.define('Marketplace.controller.Products', {
    extend: 'Ext.app.Controller',

    init: function() {
        console.log('🛍️ Инициализация Products контроллера');

        // Подписываемся на события загрузки товаров
        this.listen({
            store: {
                '#Products': {
                    load: this.onProductsLoad,
                    datachanged: this.onProductsDataChanged
                },
                '#Favorites': {
                    load: this.onFavoritesLoad,
                    add: this.onFavoritesChange,
                    remove: this.onFavoritesChange,
                    datachanged: this.onFavoritesChange
                },
                '#Cart': {
                    add: this.onCartChange,
                    remove: this.onCartChange,
                    update: this.onCartChange,
                    datachanged: this.onCartChange
                }
            }
        });

        // Инициализируем избранное при запуске
        this.initFavorites();
        // Инициализируем корзину при запуске
        this.initCart();
    },

    /**
     * Проверить авторизацию
     * @returns {Boolean}
     */
    isAuthenticated: function() {
        const token = localStorage.getItem('authToken');
        return !!token && token !== 'null' && token !== 'undefined';
    },

    /**
     * Инициализация избранного
     */
    initFavorites: function() {
        const favoritesStore = Ext.getStore('Favorites');
        if (favoritesStore) {
            console.log('🔄 Инициализация избранного...');

            // Загружаем избранное с сервера (если пользователь авторизован)
            favoritesStore.syncWithServer().then(() => {
                console.log('✅ Избранное инициализировано');
                // После загрузки избранного обновляем статусы товаров
                this.updateProductsFavoritesStatus();
            }).catch(error => {
                console.warn('⚠️ Ошибка инициализации избранного:', error);
                // Все равно обновляем статусы (возможно, избранное пустое)
                this.updateProductsFavoritesStatus();
            });
        }
    },

    /**
     * Инициализация корзины
     */
    initCart: function() {
        const cartStore = Ext.getStore('Cart');
        if (cartStore) {
            console.log('🛒 Инициализация корзины...');

            if (this.isAuthenticated()) {
                // Загружаем корзину с сервера если пользователь авторизован
                cartStore.load().then(() => {
                    console.log('✅ Корзина загружена с сервера');
                    this.updateCartCounter();
                }).catch(error => {
                    console.warn('⚠️ Ошибка загрузки корзины:', error);
                    // Работаем с локальной корзиной
                });
            } else {
                console.log('ℹ️ Пользователь не авторизован, работаем с локальной корзиной');
                // Локальная корзина (в localStorage или sessionStorage)
                this.loadLocalCart();
            }
        }
    },

    /**
     * Загрузить локальную корзину (для неавторизованных пользователей)
     */
    loadLocalCart: function() {
        try {
            const localCart = localStorage.getItem('localCart');
            if (localCart) {
                const cartData = JSON.parse(localCart);
                const cartStore = Ext.getStore('Cart');

                cartData.forEach(item => {
                    cartStore.add(item);
                });

                console.log(`🛒 Локальная корзина загружена: ${cartData.length} товаров`);
                this.updateCartCounter();
            }
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки локальной корзины:', error);
        }
    },

    /**
     * Сохранить локальную корзину
     */
    saveLocalCart: function() {
        const cartStore = Ext.getStore('Cart');
        const cartData = cartStore.getRange().map(item => item.getData());

        try {
            localStorage.setItem('localCart', JSON.stringify(cartData));
            console.log('💾 Локальная корзина сохранена');
        } catch (error) {
            console.warn('⚠️ Ошибка сохранения локальной корзины:', error);
        }
    },

    /**
     * Обработчик изменений корзины
     */
    onCartChange: function() {
        console.log('🔄 Корзина изменена');
        this.updateCartCounter();

        // Сохраняем локальную корзину если пользователь не авторизован
        if (!this.isAuthenticated()) {
            this.saveLocalCart();
        }
    },

    /**
     * Обработчик загрузки товаров
     */
    onProductsLoad: function(store, records, successful) {
        if (successful) {
            console.log(`📥 Товары загружены: ${records.length} записей`);
            // Обновляем статусы избранного после загрузки товаров
            this.updateProductsFavoritesStatus();
        }
    },

    /**
     * Обработчик изменения данных товаров
     */
    onProductsDataChanged: function() {
        // Обновляем статусы избранного при изменении данных товаров
        this.updateProductsFavoritesStatus();
    },

    /**
     * Обработчик загрузки избранного
     */
    onFavoritesLoad: function(store, records, successful) {
        if (successful) {
            console.log(`📥 Избранное загружено: ${records.length} записей`);
            // Обновляем статусы товаров после загрузки избранного
            this.updateProductsFavoritesStatus();
        }
    },

    /**
     * Обработчик изменения избранного
     */
    onFavoritesChange: function() {
        // Обновляем статусы товаров при изменении избранного
        this.updateProductsFavoritesStatus();
    },

    /**
     * Обновить статусы избранного для всех товаров
     */
    updateProductsFavoritesStatus: function() {
        const productsStore = Ext.getStore('Products');
        const favoritesStore = Ext.getStore('Favorites');

        if (!productsStore || !favoritesStore) {
            console.log('⚠️ Stores не найдены для обновления статусов');
            return;
        }

        const favoriteIds = new Set();

        // Собираем ID избранных товаров
        favoritesStore.each(function(favorite) {
            favoriteIds.add(favorite.get('id'));
        });

        console.log(`🔄 Обновление статусов избранного: ${favoriteIds.size} избранных товаров`);

        // Обновляем статусы всех товаров
        productsStore.each(function(product) {
            const productId = product.get('id');
            const isFavorite = favoriteIds.has(productId);

            // Обновляем только если статус изменился
            if (product.get('isFavorite') !== isFavorite) {
                product.set('isFavorite', isFavorite);
            }
        });

        console.log('✅ Статусы избранного обновлены');
    },

    /**
     * API для обновления статуса избранного из других контроллеров
     * @param {Number} productId - ID товара
     * @param {Boolean} isFavorite - статус избранного
     */
    updateProductFavoriteStatus: function(productId, isFavorite) {
        console.log(`🔄 API: Обновление статуса избранного для товара ${productId}: ${isFavorite ? '❤️' : '🤍'}`);

        const product = Ext.getStore('Products').getById(productId);
        if (product) {
            product.set('isFavorite', isFavorite);

            // Обновляем кнопку на странице
            this.updateFavoriteButton(productId, isFavorite);

            // Обновляем локальный store избранного если нужно
            const favoritesStore = Ext.getStore('Favorites');
            if (favoritesStore) {
                if (isFavorite) {
                    // Добавляем в локальный store если еще нет
                    if (!favoritesStore.findRecord('id', productId)) {
                        const favoriteProduct = product.copy();
                        favoriteProduct.set('AddedAt', new Date());
                        favoritesStore.add(favoriteProduct);
                    }
                } else {
                    // Удаляем из локального store
                    const favoriteItem = favoritesStore.findRecord('id', productId);
                    if (favoriteItem) {
                        favoritesStore.remove(favoriteItem);
                    }
                }
            }

            return true;
        }

        console.warn(`⚠️ API: Товар ${productId} не найден`);
        return false;
    },

    /**
     * Переключение статуса избранного
     * @param {Number} productId - ID товара
     */
    toggleFavorite: function(productId) {
        console.log(`❤️ Переключение избранного для товара ${productId}`);

        const product = Ext.getStore('Products').getById(productId);
        if (!product) {
            console.error('❌ Товар не найден:', productId);
            Marketplace.util.ErrorHandler.showError('Товар не найден');
            return;
        }

        const favoritesStore = Ext.getStore('Favorites');
        if (!favoritesStore) {
            console.error('❌ Store Favorites не найден');
            Marketplace.util.ErrorHandler.showError('Ошибка работы с избранным');
            return;
        }

        const isCurrentlyFavorite = product.get('isFavorite');

        if (isCurrentlyFavorite) {
            // Удаляем из избранного
            favoritesStore.removeFromFavorites(productId)
                .then(() => {
                    console.log('✅ Товар удален из избранного');
                    product.set('isFavorite', false);

                    // Обновляем кнопку на странице
                    this.updateFavoriteButton(productId, false);

                    this.showToast('Удалено из избранного');
                })
                .catch(error => {
                    console.error('❌ Ошибка при удалении из избранного:', error);
                });
        } else {
            // Добавляем в избранное
            favoritesStore.addToFavorites(product)
                .then(() => {
                    console.log('✅ Товар добавлен в избранное');
                    product.set('isFavorite', true);

                    // Обновляем кнопку на странице
                    this.updateFavoriteButton(productId, true);

                    this.showToast('Добавлено в избранное');
                })
                .catch(error => {
                    console.error('❌ Ошибка при добавлении в избранное:', error);
                });
        }
    },

    /**
     * Обновление кнопки избранного на странице
     * @param {Number} productId - ID товара
     * @param {Boolean} isFavorite - статус избранного
     */
    updateFavoriteButton: function(productId, isFavorite) {
        // Находим кнопку по ID товара
        const buttonSelector = `button[onclick*="toggleFavorite(${productId})"]`;
        const buttons = document.querySelectorAll(buttonSelector);

        buttons.forEach(button => {
            button.innerHTML = isFavorite ? '❤️' : '🤍';
            if (isFavorite) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    },

    /**
     * Добавление товара в корзину
     * @param {Number} productId - ID товара
     */
    addToCart: function(productId) {
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
        if (!cartStore) {
            console.error('❌ Store Cart не найден');
            Marketplace.util.ErrorHandler.showError('Ошибка работы с корзиной');
            return;
        }

        // Проверяем авторизацию
        if (this.isAuthenticated()) {
            // Авторизованный пользователь - добавляем на сервер
            Marketplace.util.API.request({
                url: '/cart/add',
                method: 'POST',
                jsonData: {
                    productId: productId,
                    quantity: 1
                }
            }).then(() => {
                // После успешного добавления на сервер обновляем локальную корзину
                cartStore.addToCart(productId, 1);
                this.showToast(`Товар "${product.get('name')}" добавлен в корзину`);
                this.updateCartCounter();
            }).catch(error => {
                console.error('❌ Ошибка добавления в корзину:', error);
                Marketplace.util.ErrorHandler.showError('Ошибка добавления в корзину');
            });
        } else {
            // Неавторизованный пользователь - добавляем локально
            cartStore.addToCart(productId, 1);
            this.showToast(`Товар "${product.get('name')}" добавлен в корзину`);
            this.updateCartCounter();
        }
    },

    /**
     * Обновить количество товара в корзине
     * @param {Number} productId - ID товара
     * @param {Number} quantity - новое количество
     */
    updateCartQuantity: function(productId, quantity) {
        console.log(`📦 Обновление количества: productId=${productId}, quantity=${quantity}`);

        const cartStore = Ext.getStore('Cart');
        if (!cartStore) return;

        // Проверяем авторизацию
        if (this.isAuthenticated()) {
            // Для авторизованных пользователей обновляем на сервере
            if (quantity <= 0) {
                // Удаляем товар
                Marketplace.util.API.request({
                    url: `/cart/remove/${productId}`,
                    method: 'DELETE'
                }).then(() => {
                    cartStore.updateQuantity(productId, quantity);
                }).catch(error => {
                    console.error('❌ Ошибка удаления из корзины:', error);
                });
            } else {
                // TODO: Добавить метод update на сервере или удалить/добавить заново
                cartStore.updateQuantity(productId, quantity);
            }
        } else {
            // Для неавторизованных пользователей обновляем локально
            cartStore.updateQuantity(productId, quantity);
        }
    },

    /**
     * Удалить товар из корзины
     * @param {Number} productId - ID товара
     */
    removeFromCart: function(productId) {
        console.log(`🗑️ Удаление из корзины: productId=${productId}`);

        const cartStore = Ext.getStore('Cart');
        if (!cartStore) return;

        // Проверяем авторизацию
        if (this.isAuthenticated()) {
            // Для авторизованных пользователей удаляем с сервера
            Marketplace.util.API.request({
                url: `/cart/remove/${productId}`,
                method: 'DELETE'
            }).then(() => {
                cartStore.removeFromCart(productId);
                this.showToast('Товар удален из корзины');
            }).catch(error => {
                console.error('❌ Ошибка удаления из корзины:', error);
                Marketplace.util.ErrorHandler.showError('Ошибка удаления из корзины');
            });
        } else {
            // Для неавторизованных пользователей удаляем локально
            cartStore.removeFromCart(productId);
            this.showToast('Товар удален из корзины');
        }
    },

    /**
     * Синхронизировать локальную корзину с сервером (после авторизации)
     */
    syncCartAfterLogin: function() {
        console.log('🔄 Синхронизация корзины после входа...');

        const cartStore = Ext.getStore('Cart');
        if (!cartStore) return;

        // Получаем локальные товары
        const localItems = cartStore.getRange();

        if (localItems.length === 0) {
            console.log('ℹ️ Локальная корзина пуста, загружаем с сервера');
            cartStore.load().then(() => {
                console.log('✅ Корзина загружена с сервера');
                this.updateCartCounter();
            });
            return;
        }

        // Отправляем каждый товар на сервер
        const promises = localItems.map(item => {
            return Marketplace.util.API.request({
                url: '/cart/add',
                method: 'POST',
                jsonData: {
                    productId: item.get('productId'),
                    quantity: item.get('quantity')
                }
            });
        });

        Promise.all(promises).then(() => {
            console.log('✅ Корзина синхронизирована с сервером');
            // Очищаем локальную корзину после успешной синхронизации
            localStorage.removeItem('localCart');
            // Загружаем актуальную корзину с сервера
            cartStore.load().then(() => {
                this.updateCartCounter();
            });
        }).catch(error => {
            console.warn('⚠️ Ошибка синхронизации корзины:', error);
            // Пробуем загрузить корзину с сервера
            cartStore.load().catch(() => {
                // Если не удалось загрузить с сервера, продолжаем с локальной
            });
        });
    },

    /**
     * Обновление счетчика корзины в заголовке
     */
    updateCartCounter: function() {
        const cartStore = Ext.getStore('Cart');
        const cartButton = Ext.ComponentQuery.query('#cartButton')[0];

        if (cartButton && cartStore) {
            const totalItems = cartStore.getTotalItems ? cartStore.getTotalItems() : 0;
            cartButton.setText(`Корзина (${totalItems})`);
            console.log(`🔢 Обновление счетчика корзины: ${totalItems} товаров`);
        }
    },



    /**
     * Поиск товаров (прямой API вызов с фильтрами)
     * @param {String} searchText - текст для поиска
     */
    searchProducts: function(searchText) {
        console.log(`🔍 Поиск товаров: "${searchText}"`);

        const productsStore = Ext.getStore('Products');
        if (!productsStore) {
            console.error('❌ Store Products не найден');
            return;
        }

        // Прямой вызов API с параметром Search
        Marketplace.util.API.post('/products/Products', {
            Search: searchText || ''
        })
            .then(response => {
                console.log(`✅ API вернул: ${response.data?.products?.length || 0} товаров`);

                // Принудительно обновляем store
                productsStore.removeAll();
                productsStore.loadData(response.data?.products || []);

                console.log(`🔄 Store обновлен: ${productsStore.getCount()} товаров`);
            })
            .catch(error => {
                console.error('❌ Ошибка поиска:', error);
            });
    },

    /**
     * Фильтрация по категории (прямой API вызов)
     * @param {String} categoryName - название категории
     */
    filterByCategory: function(categoryName) {
        console.log(`📁 Фильтрация по категории: "${categoryName}"`);

        const productsStore = Ext.getStore('Products');
        if (!productsStore) {
            console.error('❌ Store Products не найден');
            return;
        }

        // Если "Все категории" или пусто - сбрасываем фильтр
        if (!categoryName || categoryName === 'Все категории') {
            this.resetFilters();
            return;
        }

        // Прямой вызов API с параметром Category
        Marketplace.util.API.get('/products', {
            Category: categoryName,  // именно Category с большой буквы
            Page: 1,
            PageSize: 100
        })
            .then(response => {
                console.log(`✅ API вернул: ${response.data?.products?.length || 0} товаров категории "${categoryName}"`);

                // Принудительно обновляем store
                productsStore.removeAll();
                productsStore.loadData(response.data?.products || []);

                console.log(`🔄 Store обновлен: ${productsStore.getCount()} товаров`);
            })
            .catch(error => {
                console.error('❌ Ошибка фильтрации:', error);
            });
    },

    /**
     * Сбросить все фильтры (загрузить все товары)
     */
    resetFilters: function() {
        console.log('🔄 Сброс фильтров');

        const productsStore = Ext.getStore('Products');
        if (!productsStore) return;

        // Прямой вызов API без фильтров
        Marketplace.util.API.get('/products', {
            Page: 1,
            PageSize: 100
        })
            .then(response => {
                console.log(`✅ API вернул все товары: ${response.data?.products?.length || 0}`);

                // Принудительно обновляем store
                productsStore.removeAll();
                productsStore.loadData(response.data?.products || []);

                console.log(`🔄 Store обновлен: ${productsStore.getCount()} товаров`);
            })
            .catch(error => {
                console.error('❌ Ошибка загрузки:', error);
            });
    },

    /**
     * Загрузить все товары при старте
     */
    loadAllProducts: function() {
        this.resetFilters(); // просто используем тот же метод
    },

    /**
     * Обновить количество товара в корзине (с сохранением на сервере)
     * @param {Number} productId - ID товара
     * @param {Number} quantity - новое количество
     */
    updateCartQuantity: function(productId, quantity) {
        console.log(`📦 Обновление количества: productId=${productId}, quantity=${quantity}`);

        const cartStore = Ext.getStore('Cart');
        if (!cartStore) return;

        const item = cartStore.findRecord('productId', productId);
        if (!item) {
            console.warn(`⚠️ Товар ${productId} не найден в корзине`);
            return;
        }

        const oldQuantity = item.get('quantity');

        if (quantity <= 0) {
            // Удаляем товар если количество 0 или меньше
            this.removeFromCart(productId);
            return;
        }

        // Обновляем локально сразу для быстрого отклика
        item.set('quantity', quantity);
        cartStore.fireEvent('update', cartStore, item, Ext.data.Model.EDIT);
        cartStore.fireEvent('datachanged', cartStore);

        this.updateCartCounter();

        // Проверяем авторизацию и обновляем на сервере
        if (this.isAuthenticated()) {
            // Для авторизованных пользователей обновляем на сервере
            // Сначала удаляем старую запись
            Marketplace.util.API.request({
                url: `/cart/remove/${productId}`,
                method: 'DELETE'
            }).then(() => {
                // Затем добавляем с новым количеством
                return Marketplace.util.API.request({
                    url: '/cart/add',
                    method: 'POST',
                    jsonData: {
                        productId: productId,
                        quantity: quantity
                    }
                });
            }).then(() => {
                console.log(`✅ Количество обновлено на сервере: ${productId} → ${quantity}`);
            }).catch(error => {
                console.error('❌ Ошибка обновления количества на сервере:', error);
                // Откатываем локальные изменения если ошибка
                item.set('quantity', oldQuantity);
                cartStore.fireEvent('update', cartStore, item, Ext.data.Model.EDIT);
                cartStore.fireEvent('datachanged', cartStore);
                this.updateCartCounter();
                Marketplace.util.ErrorHandler.showError('Ошибка обновления корзины');
            });
        } else {
            // Для неавторизованных пользователей сохраняем локально
            this.saveLocalCart();
            console.log(`✅ Количество обновлено локально: ${productId} → ${quantity}`);
        }
    },

    /**
     * Удалить товар из корзины
     * @param {Number} productId - ID товара
     */
    removeFromCart: function(productId) {
        console.log(`🗑️ Удаление из корзины: productId=${productId}`);

        const cartStore = Ext.getStore('Cart');
        if (!cartStore) return;

        // Проверяем авторизацию
        if (this.isAuthenticated()) {
            // Для авторизованных пользователей удаляем с сервера
            Marketplace.util.API.request({
                url: `/cart/remove/${productId}`,
                method: 'DELETE'
            }).then(() => {
                // Удаляем локально после успеха на сервере
                cartStore.removeFromCart(productId);
                this.showToast('Товар удален из корзины');
                console.log(`✅ Товар удален с сервера и локально: ${productId}`);
            }).catch(error => {
                console.error('❌ Ошибка удаления из корзины:', error);
                Marketplace.util.ErrorHandler.showError('Ошибка удаления из корзины');
            });
        } else {
            // Для неавторизованных пользователей удаляем локально
            cartStore.removeFromCart(productId);
            this.saveLocalCart();
            this.showToast('Товар удален из корзины');
            console.log(`✅ Товар удален локально: ${productId}`);
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
     * Получить текущий контроллер для использования в других контроллерах
     * @returns {Marketplace.controller.Products}
     */
    getController: function() {
        return this;
    }
});
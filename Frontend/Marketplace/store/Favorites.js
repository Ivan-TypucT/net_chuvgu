/**
 * Хранилище избранных товаров (только на AJAX без autoLoad)
 */
Ext.define('Marketplace.store.Favorites', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Product',
    storeId: 'Favorites',

    // ВАЖНО: Используем memory proxy чтобы store не пытался ничего загружать
    proxy: {
        type: 'memory',
        data: [] // Начинаем с пустого массива
    },

    /**
     * Проверить, авторизован ли пользователь
     * @returns {Boolean}
     */
    isUserAuthenticated: function() {
        const token = localStorage.getItem('authToken');
        return !!token && token !== 'null' && token !== 'undefined';
    },

    /**
     * Загрузить избранное с сервера (только для авторизованных пользователей)
     */
    loadFavorites: function() {
        console.log('🔄 Проверка авторизации для загрузки избранного...');

        // Проверяем авторизацию
        if (!this.isUserAuthenticated()) {
            console.log('⚠️ Пользователь не авторизован, пропускаем загрузку избранного');
            return Promise.resolve([]);
        }

        console.log('✅ Пользователь авторизован, загружаем избранное...');

        return new Promise((resolve, reject) => {
            // ЧИСТЫЙ AJAX ЗАПРОС БЕЗ STORE.LOAD()
            Ext.Ajax.request({
                url: '/api/favorites',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                    'Content-Type': 'application/json'
                },
                success: (response) => {
                    try {
                        const result = Ext.decode(response.responseText);

                        if (result.success) {
                            const favoritesData = result.data || [];
                            console.log(`✅ Избранное загружено: ${favoritesData.length} товаров`);

                            // Очищаем store
                            this.removeAll();

                            // Добавляем данные вручную
                            if (favoritesData.length > 0) {
                                favoritesData.forEach(item => {
                                    // Добавляем флаг isFavorite
                                    item.isFavorite = true;
                                    this.add(item);
                                });
                            }

                            // Оповещаем о загрузке
                            this.fireEvent('load', this, favoritesData, true);

                            resolve(favoritesData);
                        } else {
                            console.warn('⚠️ Сервер вернул ошибку:', result.message);
                            this.fireEvent('load', this, [], false);
                            resolve([]);
                        }
                    } catch (e) {
                        console.error('❌ Ошибка обработки ответа:', e);
                        this.fireEvent('load', this, [], false);
                        resolve([]);
                    }
                },
                failure: (response) => {
                    console.warn('⚠️ Ошибка загрузки избранного:', response.status);

                    if (response.status === 401) {
                        console.log('ℹ️ Пользователь не авторизован для просмотра избранного');
                        this.fireEvent('load', this, [], false);
                        resolve([]);
                    } else {
                        this.fireEvent('load', this, [], false);
                        reject('Ошибка загрузки избранного: ' + response.status);
                    }
                }
            });
        });
    },

    /**
     * Добавить товар в избранное
     * @param {Marketplace.model.Product} product - товар
     */
    addToFavorites: function(product) {
        console.log(`❤️ Добавление в избранное: ${product.get('name')} (ID: ${product.get('id')})`);

        // Проверяем авторизацию
        if (!this.isUserAuthenticated()) {
            console.log('❌ Пользователь не авторизован для добавления в избранное');
            Marketplace.util.ErrorHandler.showError('Для добавления в избранное необходимо войти в систему');
            return Promise.reject('Пользователь не авторизован');
        }

        // Сначала проверяем, не добавлен ли уже локально
        if (this.findRecord('id', product.get('id'))) {
            console.log('⚠️ Товар уже в избранном');
            return Promise.resolve({ message: 'Товар уже в избранном' });
        }

        // AJAX запрос на сервер
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: '/api/favorites/' + product.get('id'),
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                    'Content-Type': 'application/json'
                },
                jsonData: {},
                success: (response) => {
                    try {
                        const result = Ext.decode(response.responseText);

                        if (result.success) {
                            console.log('✅ Товар добавлен в избранное на сервере');

                            // Создаем копию товара для локального store
                            const favoriteProduct = product.copy();
                            favoriteProduct.set('isFavorite', true);
                            favoriteProduct.set('AddedAt', new Date());

                            // Добавляем в store и оповещаем
                            this.add(favoriteProduct);
                            this.fireEvent('add', this, [favoriteProduct], 0);

                            resolve(result);
                        } else {
                            console.error('❌ Сервер вернул ошибку:', result.message);
                            reject(result.message || 'Ошибка добавления в избранное');
                        }
                    } catch (e) {
                        console.error('❌ Ошибка обработки ответа:', e);
                        reject('Ошибка обработки ответа сервера');
                    }
                },
                failure: (response) => {
                    console.error('❌ Ошибка при добавлении в избранное:', response.status);

                    if (response.status === 401) {
                        Marketplace.util.ErrorHandler.showError('Для добавления в избранное необходимо войти в систему');
                        reject('Пользователь не авторизован');
                    } else {
                        Marketplace.util.ErrorHandler.showError('Ошибка при добавлении в избранное');
                        reject('Ошибка сети: ' + response.status);
                    }
                }
            });
        });
    },

    /**
     * Удалить товар из избранного
     * @param {Number} productId - ID товара
     */
    removeFromFavorites: function(productId) {
        console.log(`💔 Удаление из избранного: productId=${productId}`);

        // Проверяем авторизацию
        if (!this.isUserAuthenticated()) {
            console.log('❌ Пользователь не авторизован для удаления из избранного');
            Marketplace.util.ErrorHandler.showError('Для работы с избранным необходимо войти в систему');
            return Promise.reject('Пользователь не авторизован');
        }

        // Проверяем, есть ли товар локально
        const item = this.findRecord('id', productId);
        if (!item) {
            console.log('⚠️ Товар не найден в избранном');
            return Promise.resolve({ message: 'Товар не найден в избранном' });
        }

        // AJAX запрос на сервер
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: '/api/favorites/' + productId,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                    'Content-Type': 'application/json'
                },
                success: (response) => {
                    try {
                        const result = Ext.decode(response.responseText);

                        if (result.success) {
                            console.log('✅ Товар удален из избранного на сервере');

                            // Удаляем из локального store и оповещаем
                            this.remove(item);
                            this.fireEvent('remove', this, [item], 0);

                            resolve(result);
                        } else {
                            console.error('❌ Сервер вернул ошибку:', result.message);
                            reject(result.message || 'Ошибка удаления из избранного');
                        }
                    } catch (e) {
                        console.error('❌ Ошибка обработки ответа:', e);
                        reject('Ошибка обработки ответа сервера');
                    }
                },
                failure: (response) => {
                    console.error('❌ Ошибка при удалении из избранного:', response.status);

                    if (response.status === 401) {
                        Marketplace.util.ErrorHandler.showError('Для работы с избранным необходимо войти в систему');
                        reject('Пользователь не авторизован');
                    } else {
                        Marketplace.util.ErrorHandler.showError('Ошибка при удалении из избранного');
                        reject('Ошибка сети: ' + response.status);
                    }
                }
            });
        });
    },

    /**
     * Синхронизировать избранное с сервером (при загрузке приложения)
     */
    syncWithServer: function() {
        console.log('🔄 Синхронизация избранного с сервером...');

        // Проверяем авторизацию
        if (!this.isUserAuthenticated()) {
            console.log('ℹ️ Пользователь не авторизован, пропускаем синхронизацию избранного');
            return Promise.resolve([]);
        }

        return this.loadFavorites().then(records => {
            console.log(`✅ Синхронизация завершена: ${records.length} товаров`);
            return records;
        }).catch(error => {
            console.warn('⚠️ Не удалось синхронизировать избранное:', error);
            return [];
        });
    },

    /**
     * Проверить, есть ли товар в избранном
     * @param {Number} productId - ID товара
     * @returns {Boolean}
     */
    isFavorite: function(productId) {
        return !!this.findRecord('id', productId);
    },

    /**
     * Получить количество избранных товаров
     * @returns {Promise}
     */
    getFavoritesCount: function() {
        // Проверяем авторизацию
        if (!this.isUserAuthenticated()) {
            return Promise.resolve({ count: 0 });
        }

        // AJAX запрос без store.load()
        return new Promise((resolve, reject) => {
            Ext.Ajax.request({
                url: '/api/favorites/count',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                    'Content-Type': 'application/json'
                },
                success: (response) => {
                    try {
                        const result = Ext.decode(response.responseText);
                        if (result.success) {
                            resolve({ count: result.data || 0 });
                        } else {
                            resolve({ count: 0 });
                        }
                    } catch (e) {
                        console.error('❌ Ошибка обработки ответа:', e);
                        resolve({ count: 0 });
                    }
                },
                failure: (response) => {
                    console.warn('⚠️ Ошибка получения количества:', response.status);
                    resolve({ count: 0 });
                }
            });
        });
    }
});
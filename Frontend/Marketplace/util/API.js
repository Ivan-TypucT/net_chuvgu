/**
 * Утилиты для работы с API сервером
 */
Ext.define('Marketplace.util.API', {
    singleton: true,

    config: {
        baseUrl: '/api',
        timeout: 30000
    },

    /**
     * Выполнение запроса к API
     * @param {Object} config - конфигурация запроса
     * @returns {Promise}
     */
    request: function(config) {
        console.log(`🌐 API запрос: ${config.method || 'GET'} ${config.url}`);

        return new Promise(function(resolve, reject) {
            const token = localStorage.getItem('authToken');

            Ext.Ajax.request(Ext.apply(config, {
                url: this.config.baseUrl + config.url,
                timeout: this.getTimeout(),
                headers: {
                    'Authorization': token ? 'Bearer ' + token : '',
                    'Content-Type': 'application/json'
                },
                success: function(response) {
                    console.log(`✅ API ответ: ${config.url}`);

                    try {
                        const result = Ext.decode(response.responseText);
                        if (result.success) {
                            resolve(result);
                        } else {
                            console.error(`❌ API ошибка: ${result.message}`);
                            reject(result.message || 'Произошла ошибка');
                        }
                    } catch (e) {
                        console.error('❌ Ошибка парсинга ответа:', e);
                        reject('Ошибка обработки ответа сервера: ' + e.message);
                    }
                },
                failure: function(response) {
                    let errorMsg = 'Ошибка сети';

                    if (response.status === 0) {
                        errorMsg = 'Нет соединения с сервером';
                    } else if (response.status === 401) {
                        errorMsg = 'Требуется авторизация';
                        localStorage.removeItem('authToken');
                    } else if (response.status === 403) {
                        errorMsg = 'Доступ запрещен';
                    } else if (response.status === 404) {
                        errorMsg = 'Ресурс не найден';
                    } else if (response.status === 500) {
                        errorMsg = 'Ошибка сервера';
                    } else {
                        errorMsg = 'Ошибка ' + response.status;
                    }

                    console.error(`❌ Сетевая ошибка ${response.status}: ${errorMsg}`);
                    reject(errorMsg);
                }
            }));
        }.bind(this));
    },

    /**
     * GET запрос
     * @param {String} url - endpoint
     * @returns {Promise}
     */
    get: function(url) {
        return this.request({ url: url, method: 'GET' });
    },

    /**
     * POST запрос
     * @param {String} url - endpoint
     * @param {Object} data - данные
     * @returns {Promise}
     */
    post: function(url, data) {
        return this.request({
            url: url,
            method: 'POST',
            jsonData: data
        });
    },

    /**
     * PUT запрос
     * @param {String} url - endpoint
     * @param {Object} data - данные
     * @returns {Promise}
     */
    put: function(url, data) {
        return this.request({
            url: url,
            method: 'PUT',
            jsonData: data
        });
    },

    /**
     * DELETE запрос
     * @param {String} url - endpoint
     * @returns {Promise}
     */
    delete: function(url) {
        return this.request({ url: url, method: 'DELETE' });
    }
});
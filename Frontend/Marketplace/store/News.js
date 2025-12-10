/**
 * Хранилище новостей и промо-баннеров
 */
Ext.define('Marketplace.store.News', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.News',
    storeId: 'News',

    proxy: {
        type: 'ajax',
        url: '/api/news',
        reader: {
            type: 'json',
            rootProperty: 'data.items',
            totalProperty: 'data.totalCount'
        },
        extraParams: {
            page: 1,
            pageSize: 10
        }
    },

    autoLoad: true,
    pageSize: 10,

    listeners: {
        load: function(store, records) {
            console.log('📰 Загружено новостей:', records.length);
        },

        beforeload: function(store) {
            console.log('📥 Загрузка новостей...');
        }
    },

    /**
     * Загрузить баннер для главной страницы
     */
    loadBanner: function() {
        console.log('📥 Загрузка баннера...');

        return new Promise(function(resolve, reject) {
            Ext.Ajax.request({
                url: '/api/news/banner',
                method: 'GET',
                success: function(response) {
                    try {
                        const result = Ext.decode(response.responseText);
                        if (result.success) {
                            console.log('✅ Баннер загружен');
                            resolve(result.data);
                        } else {
                            reject(result.message);
                        }
                    } catch (e) {
                        reject('Ошибка обработки баннера');
                    }
                },
                failure: function(response) {
                    reject('Ошибка загрузки баннера');
                }
            });
        });
    },

    /**
     * Загрузить конкретную новость по ID
     */
    loadNewsItem: function(id) {
        console.log('📰 Загрузка новости с ID:', id);

        return Marketplace.util.API.get('/news/' + id);
    }
});
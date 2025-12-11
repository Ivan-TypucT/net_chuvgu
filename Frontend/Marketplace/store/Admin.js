/**
 * Хранилище пользователей для админ-панели
 */
Ext.define('Marketplace.store.AdminUsers', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.User',
    storeId: 'AdminUsers',

    proxy: {
        type: 'ajax',
        url: '/api/admin/users',
        reader: {
            type: 'json',
            rootProperty: 'data.items',
            totalProperty: 'data.total'
        },
        extraParams: {
            page: 1,
            pageSize: 50
        }
    },

    autoLoad: false,

    listeners: {
        beforeload: function(store) {
            console.log('📥 Загрузка списка пользователей...');
        },
        load: function(store, records) {
            console.log('✅ Пользователи загружены:', records.length);
        }
    }
});

/**
 * Хранилище товаров для админ-панели
 */
Ext.define('Marketplace.store.AdminProducts', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Product',
    storeId: 'AdminProducts',

    proxy: {
        type: 'ajax',
        url: '/api/products',
        reader: {
            type: 'json',
            rootProperty: 'data.products',
            totalProperty: 'data.totalCount'
        },
        extraParams: {
            page: 1,
            pageSize: 100
        }
    },

    autoLoad: false,

    listeners: {
        beforeload: function(store) {
            console.log('📥 Загрузка списка товаров...');
        },
        load: function(store, records) {
            console.log('✅ Товары загружены:', records.length);
        }
    }
});

/**
 * Хранилище новостей для админ-панели
 */
Ext.define('Marketplace.store.AdminNews', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.News',
    storeId: 'AdminNews',

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
            pageSize: 50
        }
    },

    autoLoad: false,

    listeners: {
        beforeload: function(store) {
            console.log('📥 Загрузка списка новостей...');
        },
        load: function(store, records) {
            console.log('✅ Новости загружены:', records.length);
        }
    }
});
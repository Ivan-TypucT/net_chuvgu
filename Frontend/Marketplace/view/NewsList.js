/**
 * Список новостей
 */
Ext.define('Marketplace.view.NewsList', {
    extend: 'Ext.grid.Panel',
    xtype: 'widget.newslist',

    cls: 'news-grid',

    columns: [{
        text: 'ID',
        dataIndex: 'id',
        width: 60,
        hidden: true
    }, {
        text: '📰 Заголовок',
        dataIndex: 'title',
        flex: 2,
        renderer: function(value, meta, record) {
            var icon = record.get('isActive') ? '✅ ' : '⭕ ';
            return icon + Ext.util.Format.htmlEncode(value);
        }
    }, {
        text: '📝 Краткое описание',
        dataIndex: 'content',
        flex: 3,
        renderer: function(value) {
            return value.length > 100 ?
                Ext.util.Format.htmlEncode(value.substring(0, 100)) + '...' :
                Ext.util.Format.htmlEncode(value);
        }
    }, {
        text: '👤 Автор',
        dataIndex: 'author',
        width: 120
    }, {
        text: '📅 Дата',
        dataIndex: 'publishedAt',
        width: 100,
        renderer: Ext.util.Format.dateRenderer('d.m.Y')
    }, {
        text: '🔗 Изображение',
        dataIndex: 'image',
        width: 100,
        renderer: function(value) {
            return value ?
                '<span class="x-fa fa-image" style="color: #3498db"></span> Есть' :
                '<span class="x-fa fa-times" style="color: #e74c3c"></span> Нет';
        }
    }],

    store: {
        type: 'news',
        autoLoad: true,
        pageSize: 10,

        listeners: {
            beforeload: function(store) {
                console.log('📥 Загрузка новостей с сервера...');
            },
            load: function(store, records) {
                console.log('✅ Загружено новостей:', records.length);
            }
        }
    },

    bbar: {
        xtype: 'pagingtoolbar',
        displayInfo: true,
        displayMsg: 'Новости {0} - {1} из {2}',
        emptyMsg: 'Нет новостей для отображения'
    },

    listeners: {
        itemclick: function(grid, record) {
            console.log('📰 Выбрана новость:', record.get('title'));
            this.showNewsDetail(record);
        },

        selectionchange: function(grid, selected) {
            var hasSelection = selected.length > 0;
            var toolbar = grid.down('toolbar[dock=top]');

            if (toolbar) {
                toolbar.down('button[action=edit]').setDisabled(!hasSelection);
                toolbar.down('button[action=delete]').setDisabled(!hasSelection);
            }
        }
    },

    /**
     * Показать детали новости
     */
    showNewsDetail: function(record) {
        console.log('📖 Открытие деталей новости');

        var detailWindow = Ext.create('Marketplace.view.NewsDetail', {
            record: record
        });

        detailWindow.show();
    }
});
/**
 * Окно деталей новости
 */
Ext.define('Marketplace.view.NewsDetail', {
    extend: 'Ext.window.Window',

    title: '📰 Просмотр новости',
    width: 600,
    height: 500,
    modal: true,
    closable: true,
    maximizable: true,
    layout: 'fit',

    items: [{
        xtype: 'panel',
        bodyPadding: 20,
        autoScroll: true,

        tpl: new Ext.XTemplate(
            '<div class="news-detail">',
            '<h1 class="news-title">{title}</h1>',
            '<div class="news-meta">',
            '<span class="author">👤 Автор: {author}</span>',
            '<span class="date">📅 Опубликовано: {publishedAt:date("d.m.Y H:i")}</span>',
            '<span class="status">{isActive:this.formatStatus}</span>',
            '</div>',
            '{image:this.formatImage}',
            '<div class="news-content">{content}</div>',
            '</div>',
            {
                formatStatus: function(isActive) {
                    return isActive ?
                        '<span style="color: #27ae60">✅ Активная</span>' :
                        '<span style="color: #e74c3c">⭕ Неактивная</span>';
                },

                formatImage: function(image) {
                    if (!image) return '';

                    return '<div class="news-image">' +
                        '<img src="' + image + '" alt="Изображение новости" style="max-width: 100%; border-radius: 8px; margin: 10px 0;">' +
                        '</div>';
                }
            }
        )
    }],

    buttons: [{
        text: 'Закрыть',
        iconCls: 'x-fa fa-times',
        handler: function() {
            this.up('window').close();
        }
    }],

    /**
     * Инициализация данных
     */
    initComponent: function() {
        console.log('📖 Инициализация окна деталей новости');

        this.callParent();

        if (this.record) {
            var panel = this.down('panel');
            panel.update(this.record.getData());
        }
    }
});
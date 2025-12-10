/**
 * Централизованный обработчик ошибок приложения
 */
Ext.define('Marketplace.util.ErrorHandler', {
    singleton: true,

    /**
     * Показать ошибку пользователю
     * @param {String} message - сообщение об ошибке
     * @param {String} title - заголовок окна
     */
    showError: function(message, title) {
        console.error(`🚨 Ошибка: ${title || 'Ошибка'} - ${message}`);

        Ext.Msg.show({
            title: title || 'Ошибка',
            message: message,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.ERROR,
            minWidth: 400
        });
    },

    /**
     * Показать предупреждение
     * @param {String} message - сообщение
     * @param {String} title - заголовок
     */
    showWarning: function(message, title) {
        console.warn(`⚠️ Предупреждение: ${title || 'Предупреждение'} - ${message}`);

        Ext.Msg.show({
            title: title || 'Предупреждение',
            message: message,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.WARNING
        });
    },

    /**
     * Показать информационное сообщение
     * @param {String} message - сообщение
     * @param {String} title - заголовок
     */
    showInfo: function(message, title) {
        console.log(`ℹ️ Информация: ${title || 'Информация'} - ${message}`);

        Ext.Msg.show({
            title: title || 'Информация',
            message: message,
            buttons: Ext.Msg.OK,
            icon: Ext.Msg.INFO
        });
    }
});
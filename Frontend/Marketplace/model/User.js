/**
 * Модель пользователя системы
 */
Ext.define('Marketplace.model.User', {
    extend: 'Ext.data.Model',

    fields: [
        { name: 'id', type: 'int' },
        { name: 'firstName', type: 'string' },
        { name: 'lastName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'avatar', type: 'string' },
        { name: 'createdAt', type: 'date' },
        { name: 'isAdmin', type: 'boolean' }
    ],

    validators: {
        firstName: { type: 'presence', message: 'Имя обязательно' },
        lastName: { type: 'presence', message: 'Фамилия обязательна' },
        email: [
            { type: 'presence', message: 'Email обязателен' },
            { type: 'email', message: 'Некорректный формат email' }
        ]
    },

    /**
     * Полное имя пользователя
     * @returns {String}
     */
    getFullName: function() {
        return this.get('firstName') + ' ' + this.get('lastName');
    }
});
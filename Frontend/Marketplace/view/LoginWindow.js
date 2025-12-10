/**
 * Окно входа в систему
 */
Ext.define('Marketplace.view.LoginWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.loginwindow',

    title: '🔐 Вход в аккаунт',
    width: 400,
    height: 300,
    modal: true,
    closable: true,
    cls: 'login-window',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('🔐 Инициализация окна входа');

        this.items = [this.createLoginForm()];

        this.callParent(arguments);
    },

    /**
     * Создание формы входа
     * @returns {Object} конфиг формы
     */
    createLoginForm: function() {
        return {
            xtype: 'form',
            cls: 'login-form',
            bodyPadding: 20,
            defaults: {
                xtype: 'textfield',
                width: '100%',
                margin: '0 0 15 0',
                allowBlank: false
            },
            items: [
                {
                    fieldLabel: '📧 Email',
                    name: 'email',
                    vtype: 'email',
                    emptyText: 'Введите ваш email'
                },
                {
                    fieldLabel: '🔑 Пароль',
                    name: 'password',
                    inputType: 'password',
                    emptyText: 'Введите ваш пароль'
                },
                {
                    xtype: 'checkbox',
                    boxLabel: 'Запомнить меня',
                    name: 'rememberMe',
                    margin: '0 0 20 0'
                }
            ],
            buttons: [
                {
                    text: 'Войти',
                    action: 'login',
                    formBind: true,
                    cls: 'login-btn',
                    handler: this.onLogin,
                    scope: this
                },
                {
                    text: 'Регистрация',
                    cls: 'register-link-btn',
                    handler: this.onShowRegister,
                    scope: this
                }
            ]
        };
    },

    /**
     * Обработчик входа
     */
    onLogin: function() {
        console.log('🎯 Обработка входа из окна');

        const form = this.down('form');
        const btn = this.down('button[action=login]');

        if (form.isValid()) {
            const authCtrl = Marketplace.app.getController('Auth');
            authCtrl.onLogin(btn);
        }
    },

    /**
     * Обработчик показа окна регистрации
     */
    onShowRegister: function() {
        console.log('🔄 Переход к регистрации');
        this.close();
        Marketplace.showRegister();
    }
});
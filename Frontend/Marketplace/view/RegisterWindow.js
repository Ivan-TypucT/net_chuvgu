/**
 * Окно регистрации нового пользователя
 */
Ext.define('Marketplace.view.RegisterWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.registerwindow',

    title: '📝 Регистрация',
    width: 400,
    height: 450,
    modal: true,
    closable: true,
    cls: 'register-window',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('📝 Инициализация окна регистрации');

        this.items = [this.createRegisterForm()];

        this.callParent(arguments);
    },

    /**
     * Создание формы регистрации
     * @returns {Object} конфиг формы
     */
    createRegisterForm: function() {
        return {
            xtype: 'form',
            cls: 'register-form',
            bodyPadding: 20,
            defaults: {
                xtype: 'textfield',
                width: '100%',
                margin: '0 0 15 0',
                allowBlank: false
            },
            items: [
                {
                    fieldLabel: '👤 Имя',
                    name: 'firstName',
                    emptyText: 'Введите ваше имя'
                },
                {
                    fieldLabel: '👥 Фамилия',
                    name: 'lastName',
                    emptyText: 'Введите вашу фамилию'
                },
                {
                    fieldLabel: '📧 Email',
                    name: 'email',
                    vtype: 'email',
                    emptyText: 'Введите ваш email'
                },
                {
                    fieldLabel: '📞 Телефон',
                    name: 'phone',
                    emptyText: 'Введите ваш телефон'
                },
                {
                    fieldLabel: '🔑 Пароль',
                    name: 'password',
                    inputType: 'password',
                    emptyText: 'Придумайте пароль'
                },
                {
                    fieldLabel: '✅ Подтверждение пароля',
                    name: 'confirmPassword',
                    inputType: 'password',
                    emptyText: 'Повторите пароль'
                }
            ],
            buttons: [
                {
                    text: 'Зарегистрироваться',
                    action: 'register',
                    formBind: true,
                    cls: 'register-btn',
                    handler: this.onRegister,
                    scope: this
                },
                {
                    text: 'Назад',
                    cls: 'back-btn',
                    handler: this.onBackToLogin,
                    scope: this
                }
            ]
        };
    },

    /**
     * Обработчик регистрации
     */
    onRegister: function() {
        console.log('🎯 Обработка регистрации из окна');

        const form = this.down('form');
        const btn = this.down('button[action=register]');

        if (form.isValid()) {
            const authCtrl = Marketplace.app.getController('Auth');
            authCtrl.onRegister(btn);
        }
    },

    /**
     * Обработчик возврата к окну входа
     */
    onBackToLogin: function() {
        console.log('🔄 Возврат к окну входа');
        this.close();
        Marketplace.showLogin();
    }
});

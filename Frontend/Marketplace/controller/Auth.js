/**
 * Контроллер управления авторизацией и пользователями
 */
Ext.define('Marketplace.controller.Auth', {
    extend: 'Ext.app.Controller',


    config: {
        baseUrl: 'api/',  // ЯВНО укажи базовый URL
        timeout: 30000
    },
    
    /**
     * Инициализация контроллера
     */
    init: function() {
        console.log('🔐 Инициализация Auth контроллера');

        this.control({
            'button[action=register]': {
                click: this.onRegister
            },
            'button[action=logout]': {
                click: this.onLogout
            }
        });
    },

    /**
     * Обработчик входа в систему
     * @param {Ext.button.Button} btn - кнопка входа
     */
    onLogin: function(btn) {
        console.log('👤 Обработка входа в систему');

        const form = btn.up('form');
        if (!form) {
            console.error('❌ Форма входа не найдена');
            return;
        }

        if (!form.isValid()) {
            Marketplace.util.ErrorHandler.showWarning('Заполните все обязательные поля');
            return;
        }

        const values = form.getValues();
        console.log('📧 Данные для входа:', { email: values.email });

        // Имитация API запроса
        Marketplace.util.API.post('/auth/login', values)
            .then(function(response) {
                console.log('✅ Успешный вход в систему');

                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userData', JSON.stringify(response.user));

                Marketplace.util.ErrorHandler.showInfo('Добро пожаловать!', 'Успешный вход');

                if (form.up('window')) {
                    form.up('window').close();
                }

                this.application.updateUserInterface();
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка входа:', error);
                Marketplace.util.ErrorHandler.showError(error, 'Ошибка входа');
            });
    },

    /**
     * Обработчик регистрации
     * @param {Ext.button.Button} btn - кнопка регистрации
     */
    onRegister: function(btn) {
        console.log('📝 Обработка регистрации');

        const form = btn.up('form');
        if (!form) {
            console.error('❌ Форма регистрации не найдена');
            return;
        }

        if (!form.isValid()) {
            Marketplace.util.ErrorHandler.showWarning('Заполните все обязательные поля');
            return;
        }

        const values = form.getValues();

        if (values.password !== values.confirmPassword) {
            Marketplace.util.ErrorHandler.showError('Пароли не совпадают');
            return;
        }

        console.log('👥 Данные для регистрации:', {
            name: values.firstName + ' ' + values.lastName,
            email: values.email
        });

        // Имитация API запроса
        Marketplace.util.API.post('/auth/register', values)
            .then(function(response) {
                console.log('✅ Успешная регистрация');

                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userData', JSON.stringify(response.user));

                Marketplace.util.ErrorHandler.showInfo('Регистрация завершена!', 'Успех');

                if (form.up('window')) {
                    form.up('window').close();
                }

                this.application.updateUserInterface();
            }.bind(this))
            .catch(function(error) {
                console.error('❌ Ошибка регистрации:', error);
                Marketplace.util.ErrorHandler.showError(error, 'Ошибка регистрации');
            });
    },

    /**
     * Обработчик выхода из системы
     */
    onLogout: function() {
        console.log('🚪 Выход из системы');

        Marketplace.util.API.post('/auth/logout', {})
            .then(function() {
                console.log('✅ Успешный выход из системы');
                this.clearAuthData();
            }.bind(this))
            .catch(function(error) {
                console.warn('⚠️ Ошибка при выходе:', error);
                this.clearAuthData();
            }.bind(this));
    },

    /**
     * Очистка данных авторизации
     */
    clearAuthData: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.reload();
    },

    /**
     * Получить данные текущего пользователя
     * @returns {Object|null}
     */
    getCurrentUser: function() {
        try {
            return JSON.parse(localStorage.getItem('userData'));
        } catch (e) {
            console.error('❌ Ошибка парсинга данных пользователя:', e);
            return null;
        }
    },

    /**
     * Проверить авторизацию пользователя
     * @returns {Boolean}
     */
    isAuthenticated: function() {
        return !!localStorage.getItem('authToken');
    }
});
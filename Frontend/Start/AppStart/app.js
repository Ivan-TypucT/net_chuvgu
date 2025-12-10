/**
 * Главный файл приложения Marketplace
 * Инициализация приложения
 */
Ext.onReady(function() {
    console.log('🚀 Инициализация приложения Marketplace...');

    // Отключаем динамическую загрузку
    Ext.Loader.setConfig({
        enabled: false
    });

    // Создаем stores вручную
    console.log('🗄️ Создание stores...');


    if (!Ext.getStore('News')) {
        Ext.create('Marketplace.store.News', {
            storeId: 'News'
        });
        console.log('✅ Store News создан');
    } 
    
    if (!Ext.getStore('Categories')) {
        Ext.create('Marketplace.store.Categories', {
            storeId: 'Categories'
        });
        console.log('✅ Store Categories создан');
    }

    if (!Ext.getStore('Products')) {
        Ext.create('Marketplace.store.Products', {
            storeId: 'Products'
        });
        console.log('✅ Store Products создан');
    }

    if (!Ext.getStore('Cart')) {
        Ext.create('Marketplace.store.Cart', {
            storeId: 'Cart'
        });
        console.log('✅ Store Cart создан');
    }

    if (!Ext.getStore('Favorites')) {
        Ext.create('Marketplace.store.Favorites', {
            storeId: 'Favorites'
        });
        console.log('✅ Store Favorites создан');
    }
    

    // Создаем приложение
    Ext.application({
        name: 'Marketplace',

        // Контроллеры (они уже загружены через script tags)
        controllers: [
            'Marketplace.controller.Auth',
            'Marketplace.controller.Products',
            'Marketplace.controller.Navigation'
        ],

        launch: function() {
            console.log('✅ Приложение Marketplace запущено');

            try {
                // Создаем главную панель
                this.mainPanel = Ext.create('Marketplace.view.MainPanel', {
                    renderTo: Ext.getBody(),
                    width: Ext.getBody().getWidth(),  // Получаем реальную ширину
                    height: Ext.getBody().getHeight(), // Получаем реальную высоту
                });

                // Инициализируем глобальные функции
                this.initGlobalFunctions();

                console.log('🎯 Интерфейс приложения готов к работе');
            } catch (error) {
                console.error('❌ Критическая ошибка при создании интерфейса:', error);
                // Покажем сообщение об ошибке
                Ext.Msg.alert('Ошибка', 'Не удалось загрузить приложение: ' + error.message);
            }
        },

        /**
         * Инициализация глобальных функций для доступа из HTML
         */
        initGlobalFunctions: function() {
            console.log('🔧 Инициализация глобальных функций...');


            /**
             * Добавление товара в корзину
             * @param {Number} productId - ID товара
             */
            Marketplace.addToCart = function(productId) {
                console.log(`🛒 Добавление товара ${productId} в корзину`);
                const productsCtrl = this.app.getController('Marketplace.controller.Products');
                if (productsCtrl && productsCtrl.addToCart) {
                    productsCtrl.addToCart(productId);
                } else {
                    console.error('❌ Products controller не найден');
                }
            };


            /**
             * Переключение статуса избранного для товара
             * @param {Number} productId - ID товара
             */
            Marketplace.toggleFavorite = function(productId) {
                console.log(`❤️ Переключение избранного для товара ${productId}`);
                const productsCtrl = this.app.getController('Marketplace.controller.Products');
                if (productsCtrl && productsCtrl.toggleFavorite) {
                    productsCtrl.toggleFavorite(productId);
                } else {
                    console.error('❌ Products controller не найден');
                }
            };

            /**
             * Выход из системы
             */
            Marketplace.logout =  function() {
                console.log('🚪 Выход из системы');
                const authCtrl = this.app.getController('Marketplace.controller.Auth');
                if (authCtrl) {
                    authCtrl.onLogout();
                } else {
                    console.error('❌ Auth controller не найден');
                }
            };

            /**
             * Показать окно входа
             */
            Marketplace.showLogin = function() {
                console.log('🔐 Открытие окна входа');
                const navCtrl = this.app.getController('Marketplace.controller.Navigation');
                if (navCtrl) {
                    navCtrl.showLoginWindow();
                } else {
                    console.error('❌ Navigation controller не найден');
                }
            };

            /**
             * Показать окно регистрации
             */
            Marketplace.showRegister = function() {
                console.log('📝 Открытие окна регистрации');
                const navCtrl = this.app.getController('Marketplace.controller.Navigation');
                if (navCtrl) {
                    navCtrl.showRegisterWindow();
                } else {
                    console.error('❌ Navigation controller не найден');
                }
            };

           
            Marketplace.showNews = function() {
                console.log('📰 Открытие вкладки новостей');
                const navCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Navigation');
                if (navCtrl && navCtrl.showNewsTab) {
                    navCtrl.showNewsTab();
                } else {
                    console.error('❌ Navigation controller не найден');
                }
            };
            

            console.log('✅ Глобальные функции инициализированы');
        },

        /**
         * Обновление интерфейса после изменения состояния
         */
        updateUserInterface: function() {
            console.log('🔄 Обновление пользовательского интерфейса');

            if (this.mainPanel) {
                this.mainPanel.destroy();
            }

            this.mainPanel = Ext.create('Marketplace.view.MainPanel', {
                renderTo: Ext.getBody(),
                width: Ext.getBody().getWidth(),  // Получаем реальную ширину
                height: Ext.getBody().getHeight(), // Получаем реальную высоту
            });

            console.log('✅ Интерфейс обновлен');
        }
    });
});
/**
 * Окно редактирования товара
 */
Ext.define('Marketplace.view.ProductEditWindow', {
    extend: 'Ext.window.Window',

    width: 500,
    height: 600,
    modal: true,
    layout: 'fit',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('✏️ Инициализация окна редактирования товара');

        this.items = [this.createProductForm()];
        this.buttons = this.createButtons();

        this.callParent(arguments);

        if(!Ext.isEmpty(this.productData))
            this.fixData(this.productData);
        
        // Если режим редактирования, заполняем форму
        if (this.mode === 'edit' && this.productData) {
            this.down('form').getForm().setValues(this.productData);
        }
    },
    
    fixData: function(data) {
        data.Name = data.name;
        data.Brand = data.brand;
        data.Category = data.category;
        data.Price = data.price;
        data.OldPrice = data.oldPrice;
        data.Image = data.image;
        data.Rating = data.rating;
        data.ReviewsCount = data.reviewsCount;
        data.Weight = data.weight;
        data.Description = data.description;
        data.InStock = data.inStock;
        data.StockQuantity = data.stockQuantity;
        data.IsFavorite = data.isFavorite;
        data.InCart = data.inCart;
        
            
    },

    /**
     * Создание формы товара
     */
    createProductForm: function() {
        return {
            xtype: 'form',
            bodyPadding: 20,
            scrollable: true,
            defaults: {
                xtype: 'textfield',
                width: '100%',
                margin: '0 0 15 0'
            },
            items: [{
                fieldLabel: 'Название',
                name: 'Name',
                allowBlank: false,
                emptyText: 'Введите название товара'
            }, {
                fieldLabel: 'Бренд',
                name: 'Brand',
                allowBlank: false,
                emptyText: 'Введите название бренда'
            }, {
                fieldLabel: 'Категория',
                name: 'Category',
                allowBlank: false,
                emptyText: 'Введите категорию'
            }, {
                fieldLabel: 'Цена',
                name: 'Price',
                xtype: 'numberfield',
                allowBlank: false,
                minValue: 0,
                maxValue: 100000
            }, {
                fieldLabel: 'Старая цена',
                name: 'OldPrice',
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100000
            }, {
                fieldLabel: 'Изображение (URL)',
                name: 'Image',
                emptyText: 'Введите URL изображения'
            }, {
                fieldLabel: 'Рейтинг',
                name: 'Rating',
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 5,
                step: 0.1
            }, {
                fieldLabel: 'Количество отзывов',
                name: 'ReviewsCount',
                xtype: 'numberfield',
                minValue: 0
            }, {
                fieldLabel: 'Вес/объем',
                name: 'Weight',
                emptyText: 'Например: 1л, 500г'
            }, {
                fieldLabel: 'Описание',
                name: 'Description',
                xtype: 'textarea',
                height: 100
            }, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                    xtype: 'checkboxfield',
                    fieldLabel: 'В наличии',
                    name: 'InStock',
                    boxLabel: '',
                    flex: 1
                }, {
                    xtype: 'numberfield',
                    fieldLabel: 'Количество',
                    name: 'StockQuantity',
                    margin: '0 0 0 10',
                    minValue: 0,
                    flex: 1
                }]
            }]
        };
    },

    /**
     * Создание кнопок формы
     */
    createButtons: function() {
        return [{
            text: 'Сохранить',
            formBind: true,
            handler: this.onSave,
            scope: this
        }, {
            text: 'Отмена',
            handler: function() {
                this.close();
            },
            scope: this
        }];
    },

    /**
     * Обработчик сохранения
     */
    onSave: function() {
        const form = this.down('form');
        if (!form.isValid()) {
            Marketplace.util.ErrorHandler.showWarning('Заполните все обязательные поля');
            return;
        }

        const values = form.getValues();
        console.log('📤 Исходные данные:', values);

        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');

        // ПРЕОБРАЗОВАНИЕ ТИПОВ для C# API
        const apiData = {
            Name: values.Name || "",
            Brand: values.Brand || "",
            Category: values.Category || "",
            Description: values.Description || "",
            Image: values.Image || "",
            Weight: values.Weight || "",

            // Числовые поля - конвертируем в числа
            Price: values.Price ? parseFloat(values.Price) : 0,
            OldPrice: values.OldPrice ? parseFloat(values.OldPrice) : null, // decimal? может быть null
            Rating: values.Rating ? parseFloat(values.Rating) : 0,
            ReviewsCount: values.ReviewsCount ? parseInt(values.ReviewsCount) : 0,
            StockQuantity: values.StockQuantity ? parseInt(values.StockQuantity) : 0,

            // Булево поле
            InStock: Boolean(values.InStock)
        };

        // Проверяем что CreatedAt есть (нужно для модели)
        if (!apiData.CreatedAt) {
            apiData.CreatedAt = new Date().toISOString();
        }

        console.log('📨 Данные для API (с преобразованными типами):', apiData);

        // Проверяем обязательные поля
        if (!apiData.Name || !apiData.Brand || !apiData.Category || apiData.Price <= 0) {
            Marketplace.util.ErrorHandler.showWarning('Заполните название, бренд, категорию и цену');
            return;
        }

        if (this.mode === 'create') {
            // Создание нового товара
            Marketplace.util.API.post('/products', apiData)
                .then(response => {
                    console.log('✅ Товар создан:', response);
                    if (adminCtrl && adminCtrl.refreshProducts) {
                        adminCtrl.refreshProducts();
                    }
                    this.close();
                    Marketplace.util.ErrorHandler.showInfo('Товар успешно создан');
                })
                .catch(error => {
                    console.error('❌ Ошибка создания товара:', error);
                    console.error('❌ Отправленные данные:', apiData);
                    Marketplace.util.ErrorHandler.showError('Ошибка создания товара: ' + error);
                });
        } else if (this.mode === 'edit') {
            // Редактирование существующего товара
            Marketplace.util.API.put('/products/' + this.productId, apiData)
                .then(response => {
                    console.log('✅ Товар обновлен:', response);
                    if (adminCtrl && adminCtrl.refreshProducts) {
                        adminCtrl.refreshProducts();
                    }
                    this.close();
                    Marketplace.util.ErrorHandler.showInfo('Товар успешно обновлен');
                })
                .catch(error => {
                    console.error('❌ Ошибка обновления товара:', error);
                    console.error('❌ Отправленные данные:', apiData);
                    Marketplace.util.ErrorHandler.showError('Ошибка обновления товара: ' + error);
                });
        }
    }
});


/**
 * Окно редактирования новости
 */
Ext.define('Marketplace.view.NewsEditWindow', {
    extend: 'Ext.window.Window',

    title: '📝 Редактирование новости',
    width: 600,
    height: 600,
    modal: true,
    layout: 'fit',
    resizable: true,
    closable: true,
    draggable: true,
    bodyPadding: 10,
    cls: 'news-edit-window',

    /**
     * Инициализация компонента
     */
    initComponent: function() {
        console.log('✏️ Инициализация окна редактирования новости');

        this.items = [this.createNewsForm()];
        this.buttons = this.createButtons();

        this.callParent(arguments);

        // Устанавливаем заголовок в зависимости от режима
        this.setTitle(this.mode === 'create' ? '➕ Создание новости' : '✏️ Редактирование новости');

        // Если режим редактирования, заполняем форму
        if (this.mode === 'edit' && this.newsData) {
            this.fixData(this.newsData);
            this.down('form').getForm().setValues(this.newsData);
        }
    },

    /**
     * Исправляем данные из store (camelCase → PascalCase)
     */
    fixData: function(data) {
        console.log('🔧 Исправление данных новости:', data);

        // Маппинг полей из store (camelCase) в форму (PascalCase)
        if (data.title !== undefined) data.Title = data.title;
        if (data.content !== undefined) data.Content = data.content;
        if (data.image !== undefined) data.Image = data.image;
        if (data.publishedAt !== undefined) data.PublishedAt = data.publishedAt;
        if (data.isActive !== undefined) data.IsActive = data.isActive;
        if (data.author !== undefined) data.Author = data.author;

        // Обрабатываем дату
        if (data.PublishedAt) {
            try {
                data.PublishedAt = new Date(data.PublishedAt);
                console.log('📅 Дата преобразована:', data.PublishedAt);
            } catch (e) {
                console.error('❌ Ошибка преобразования даты:', e);
                data.PublishedAt = new Date();
            }
        } else {
            data.PublishedAt = new Date();
        }

        // Обрабатываем булево поле
        if (typeof data.IsActive === 'string') {
            data.IsActive = data.IsActive === 'true' || data.IsActive === 'on' || data.IsActive === '1';
        } else if (data.IsActive === undefined) {
            data.IsActive = true;
        }

        console.log('✅ Исправленные данные:', data);
    },

    /**
     * Создание формы новости
     */
    createNewsForm: function() {
        return {
            xtype: 'form',
            bodyPadding: 20,
            scrollable: 'y',
            defaults: {
                labelWidth: 120,
                anchor: '100%',
                margin: '0 0 15 0'
            },
            items: [{
                xtype: 'textfield',
                fieldLabel: 'Заголовок',
                name: 'Title',
                allowBlank: false,
                emptyText: 'Введите заголовок новости'
            }, {
                xtype: 'textarea',
                fieldLabel: 'Содержание',
                name: 'Content',
                height: 150,
                allowBlank: false,
                emptyText: 'Введите содержание новости'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Изображение (URL)',
                name: 'Image',
                emptyText: 'Введите URL изображения'
            }, {
                xtype: 'datefield',
                fieldLabel: 'Дата публикации',
                name: 'PublishedAt',
                value: new Date(),
                format: 'd.m.Y H:i',
                submitFormat: 'Y-m-d\\TH:i:s',
                allowBlank: false,
                editable: false
            }, {
                xtype: 'checkboxfield',
                fieldLabel: 'Активная',
                name: 'IsActive',
                boxLabel: '',
                inputValue: true,
                uncheckedValue: false,
                checked: true
            }, {
                xtype: 'textfield',
                fieldLabel: 'Автор',
                name: 'Author',
                allowBlank: false,
                emptyText: 'Введите имя автора'
            }]
        };
    },

    /**
     * Создание кнопок формы
     */
    createButtons: function() {
        return [{
            text: 'Сохранить',
            iconCls: 'x-fa fa-save',
            formBind: true,
            handler: this.onSave,
            scope: this
        }, {
            text: 'Отмена',
            iconCls: 'x-fa fa-times',
            handler: function() {
                this.close();
            },
            scope: this
        }];
    },

    /**
     * Обработчик сохранения
     */
    onSave: function() {
        const form = this.down('form');
        if (!form.isValid()) {
            Marketplace.util.ErrorHandler.showWarning('Заполните все обязательные поля');
            return;
        }

        const values = form.getValues();
        console.log('📤 Данные формы:', values);

        const adminCtrl = Ext.app.Application.instance.getController('Marketplace.controller.Admin');

        // Преобразуем дату в ISO формат для C#
        //if (values.PublishedAt) {
       //     values.PublishedAt = Ext.Date.format(values.PublishedAt, 'Y-m-d\\TH:i:s');
        //    console.log('📅 Дата в ISO формате:', values.PublishedAt);
       // }

        // Убедимся, что IsActive булево (checkbox с inputValue уже возвращает boolean)
        if (typeof values.IsActive === 'string') {
            values.IsActive = values.IsActive === 'true' || values.IsActive === 'on' || values.IsActive === '1';
        }

        console.log('📨 Отправляемые данные:', values);

        if (this.mode === 'create') {
            // Создание новой новости
            Marketplace.util.API.post('/news/create', values)
                .then(response => {
                    console.log('✅ Новость создана:', response);
                    adminCtrl.refreshNews();
                    this.close();
                    Marketplace.util.ErrorHandler.showInfo('Новость успешно создана');
                })
                .catch(error => {
                    console.error('❌ Ошибка создания:', error);
                    Marketplace.util.ErrorHandler.showError('Ошибка создания новости: ' + error);
                });
        } else if (this.mode === 'edit') {
            // Редактирование существующей новости
            Marketplace.util.API.put('/news/update/' + this.newsId, values)
                .then(response => {
                    console.log('✅ Новость обновлена:', response);
                    adminCtrl.refreshNews();
                    this.close();
                    Marketplace.util.ErrorHandler.showInfo('Новость успешно обновлена');
                })
                .catch(error => {
                    console.error('❌ Ошибка обновления:', error);
                    Marketplace.util.ErrorHandler.showError('Ошибка обновления новости: ' + error);
                });
        }
    }
});
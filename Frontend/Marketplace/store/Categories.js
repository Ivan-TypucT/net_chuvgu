/**
 * Хранилище категорий товаров (исправленная версия)
 */
Ext.define('Marketplace.store.Categories', {
    extend: 'Ext.data.Store',
    model: 'Marketplace.model.Category',
    storeId: 'Categories',

    // Убираем autoLoad - загружаем вручную
    autoLoad: false,

    // Используем memory proxy для локальной работы
    proxy: {
        type: 'memory',
        data: [] // Начинаем с пустого массива
    },

    sorters: [{
        property: 'displayOrder',
        direction: 'ASC'
    }],

    /**
     * Загрузить категории через API
     */
    loadCategories: function() {
        console.log('📂 Загрузка категорий через API...');

        return new Promise((resolve, reject) => {
            Marketplace.util.API.get('/categories')
                .then(response => {
                    const categoriesData = response.data || [];
                    console.log(`✅ Категории загружены: ${categoriesData.length}`);

                    // Очищаем store
                    this.removeAll();

                    // Добавляем данные
                    if (categoriesData.length > 0) {
                        this.add(categoriesData);
                    }

                    // Генерируем событие загрузки
                    this.fireEvent('load', this, categoriesData, true);

                    resolve(categoriesData);
                })
                .catch(error => {
                    console.error('❌ Ошибка загрузки категорий:', error);
                    this.fireEvent('load', this, [], false);
                    reject(error);
                });
        });
    },

    /**
     * Создать категорию (админ)
     */
    createCategory: function(categoryData) {
        console.log('➕ Создание категории:', categoryData);

        return Marketplace.util.API.post('/categories', categoryData)
            .then(response => {
                console.log('✅ Категория создана');
                // Добавляем в store
                this.add(response.data);
                return response;
            });
    },

    /**
     * Обновить категорию (админ)
     */
    updateCategory: function(id, updateData) {
        console.log(`✏️ Обновление категории ID: ${id}`, updateData);

        return Marketplace.util.API.put(`/categories/${id}`, updateData)
            .then(response => {
                console.log('✅ Категория обновлена');
                // Обновляем в store
                const category = this.findRecord('id', id);
                if (category) {
                    category.set(updateData);
                }
                return response;
            });
    },

    /**
     * Удалить категорию (админ)
     */
    deleteCategory: function(id) {
        console.log(`🗑️ Удаление категории ID: ${id}`);

        return Marketplace.util.API.delete(`/categories/${id}`)
            .then(response => {
                console.log('✅ Категория удалена');
                // Удаляем из store
                const category = this.findRecord('id', id);
                if (category) {
                    this.remove(category);
                }
                return response;
            });
    },

    /**
     * Получить категорию по ID
     */
    getCategoryById: function(id) {
        return this.findRecord('id', id);
    },

    /**
     * Получить категорию по имени
     */
    getCategoryByName: function(name) {
        return this.findRecord('name', name);
    },

    /**
     * Получить все активные категории
     */
    getActiveCategories: function() {
        return this.query('isActive', true).items;
    }
});
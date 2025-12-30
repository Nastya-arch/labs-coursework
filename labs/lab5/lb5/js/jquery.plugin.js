/**
 * Основной файл скриптов для лабораторной работы №5
 * Переписываем функционал из ЛР3 на jQuery с добавлением новых заданий
 * Автор: Сокольникова А.С., группа ИТ-123
 */

$(document).ready(function() {
    console.log('DOM загружен. Лабораторная работа №5 выполнена: Сокольникова А.С., группа ИТ-123');
    
    // ============================
    // ЗАДАНИЕ 2: Переструктурировать страницу
    // ============================
    // Уже выполнено в HTML - созданы 3 статьи, каждая содержит 2 секции и aside
    
    // ============================
    // ЗАДАНИЕ 3: Анимированное меню
    // ============================
    createAnimatedMenu();
    
    // ============================
    // ЗАДАНИЕ 4: Выделение разделов при выборе пункта меню
    // (Переписываем функционал из ЛР3 на jQuery)
    // ============================
    setupSectionHighlighting();
    
    // ============================
    // ЗАДАНИЕ 5: Выделение столбцов таблицы
    // (Переписываем функционал из ЛР3 на jQuery)
    // ============================
    setupTableColumnHighlighting();
    
    // ============================
    // ЗАДАНИЕ 6: Анимация элементов aside через собственный плагин
    // ============================
    setupAsideAnimation();
    
    // ============================
    // ЗАДАНИЕ 7: Мигающий логотип
    // ============================
    setupLogoBlinking();
    
    // ============================
    // ФУНКЦИОНАЛ ИЗ ЛР3: Обработка формы
    // (Переписываем на jQuery)
    // ============================
    setupFormHandling();
    
    // Добавляем информацию в консоль
    console.log('Все задания лабораторной работы №5 выполнены');
    
    // ============================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================
    
    /**
     * Создание анимированного меню (задание 3)
     */
    function createAnimatedMenu() {
        console.log('Создание анимированного меню...');
        
        // Структура меню на основе статей и секций
        const menuStructure = [
            {
                articleId: 'article-menu',
                articleTitle: '☕ Меню',
                sections: [
                    { id: 'section-classic', title: 'Классические напитки' },
                    { id: 'section-seasonal', title: 'Сезонные предложения' }
                ]
            },
            {
                articleId: 'article-team',
                articleTitle: '👨‍🍳 Команда',
                sections: [
                    { id: 'section-staff', title: 'Наши специалисты' },
                    { id: 'section-schedule', title: 'График работы' }
                ]
            },
            {
                articleId: 'article-feedback',
                articleTitle: '📝 Обратная связь',
                sections: [
                    { id: 'section-description', title: 'Описание' },
                    { id: 'section-form', title: 'Форма опроса' }
                ]
            }
        ];
        
        const $menu = $('#dynamicMenu');
        $menu.empty();
        
        // Создаем пункты меню для каждой статьи
        menuStructure.forEach(item => {
            const $li = $('<li class="nav-item dropdown"></li>');
            
            // Пункт меню первого уровня (статья)
            const $a = $(`
                <a class="nav-link text-white" href="#${item.articleId}" 
                   data-target="#${item.articleId}"
                   style="position: relative; overflow: hidden;">
                    ${item.articleTitle}
                    <span class="dropdown-arrow" style="margin-left: 5px;">▼</span>
                </a>
            `);
            
            // Добавляем анимацию при наведении
            $a.hover(
                function() {
                    $(this).css({
                        'transform': 'translateY(-2px)',
                        'transition': 'all 0.3s ease'
                    });
                    
                    // Показываем выпадающее меню с анимацией
                    const $dropdown = $(this).next('.dropdown-menu');
                    if ($dropdown.length) {
                        $dropdown.stop(true, true).slideDown(300);
                    }
                },
                function() {
                    $(this).css('transform', 'translateY(0)');
                    
                    // Скрываем выпадающее меню с анимацией
                    const $dropdown = $(this).next('.dropdown-menu');
                    if ($dropdown.length && !$dropdown.is(':hover')) {
                        $dropdown.stop(true, true).slideUp(200);
                    }
                }
            );
            
            // Выпадающее меню второго уровня (секции)
            if (item.sections.length > 0) {
                const $dropdown = $('<div class="dropdown-menu"></div>');
                
                item.sections.forEach(section => {
                    const $sectionLink = $(`
                        <a class="dropdown-item" href="#${section.id}" 
                           data-target="#${section.id}">
                            ${section.title}
                        </a>
                    `);
                    
                    // Анимация для пунктов второго уровня
                    $sectionLink.hover(
                        function() {
                            $(this).css({
                                'padding-left': '25px',
                                'transition': 'all 0.2s ease'
                            });
                        },
                        function() {
                            $(this).css('padding-left', '20px');
                        }
                    );
                    
                    $dropdown.append($sectionLink);
                });
                
                // Анимация для всего выпадающего меню
                $dropdown.hover(
                    function() {
                        $(this).stop(true, true).slide
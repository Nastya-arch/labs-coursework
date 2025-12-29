class TaskManager {
    constructor() {
        this.tasks = new Map();
        this.loadFromStorage();
    }

    addTask(date, task) {
        if (!task.trim()) return false;
        
        const dateString = this.formatDate(date);
        if (!this.tasks.has(dateString)) {
            this.tasks.set(dateString, []);
        }
        
        this.tasks.get(dateString).push(task);
        this.saveToStorage();
        return true;
    }

    getTasks(date) {
        const dateString = this.formatDate(date);
        return this.tasks.get(dateString) || [];
    }

    removeTask(date, index) {
        const dateString = this.formatDate(date);
        const tasks = this.tasks.get(dateString);
        if (tasks && tasks[index]) {
            tasks.splice(index, 1);
            if (tasks.length === 0) {
                this.tasks.delete(dateString);
            }
            this.saveToStorage();
            return true;
        }
        return false;
    }

    clearTasks(date) {
        const dateString = this.formatDate(date);
        this.tasks.delete(dateString);
        this.saveToStorage();
    }

    hasTasks(date) {
        const dateString = this.formatDate(date);
        return this.tasks.has(dateString) && this.tasks.get(dateString).length > 0;
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    saveToStorage() {
        const tasksObj = {};
        for (const [date, taskList] of this.tasks) {
            tasksObj[date] = taskList;
        }
        localStorage.setItem('organizerTasks', JSON.stringify(tasksObj));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('organizerTasks');
        if (saved) {
            const tasksObj = JSON.parse(saved);
            for (const [date, taskList] of Object.entries(tasksObj)) {
                this.tasks.set(date, taskList);
            }
        }
    }
}

class OrganizerCalendar {
    constructor() {
        this.taskManager = new TaskManager();
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
        this.updateTodoList();
    }

    cacheElements() {
        this.calendarGrid = document.getElementById('calendar');
        this.currentMonthYear = document.getElementById('current-month-year');
        this.prevMonthBtn = document.getElementById('prev-month');
        this.nextMonthBtn = document.getElementById('next-month');
        this.selectedDateElement = document.getElementById('selected-date');
        this.todoListElement = document.getElementById('todo-list');
        this.newTaskInput = document.getElementById('new-task');
        this.taskForm = document.getElementById('task-form');
        this.clearTasksBtn = document.getElementById('clear-tasks');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
        this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));
        this.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewTask();
        });
        this.clearTasksBtn.addEventListener('click', () => this.clearSelectedTasks());
    }

    changeMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.render();
    }

    render() {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        this.currentMonthYear.textContent = `${monthNames[month]} ${year}`;

        this.calendarGrid.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const daysInMonth = lastDay.getDate();

        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            this.calendarGrid.appendChild(emptyCell);
        }

        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            const currentDayDate = new Date(year, month, day);
            
            dayElement.className = 'day-cell';
            dayElement.setAttribute('role', 'button');
            dayElement.setAttribute('tabindex', '0');
            dayElement.setAttribute('aria-label', `Дата: ${day} ${monthNames[month]}`);
            
            if (this.isSameDay(currentDayDate, today)) {
                dayElement.classList.add('today');
                dayElement.setAttribute('aria-label', dayElement.getAttribute('aria-label') + ' (Сегодня)');
            }
            
            if (this.taskManager.hasTasks(currentDayDate)) {
                dayElement.classList.add('has-tasks');
            }
            
            if (this.isSameDay(currentDayDate, this.selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            const dayNumber = document.createElement('span');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            
            const tasksPreview = document.createElement('span');
            tasksPreview.className = 'tasks-preview';
            const tasks = this.taskManager.getTasks(currentDayDate);
            if (tasks.length > 0) {
                tasksPreview.textContent = `${tasks.length} зада${this.getTaskWordEnding(tasks.length)}`;
            }
            
            dayElement.appendChild(dayNumber);
            dayElement.appendChild(tasksPreview);
            
            dayElement.addEventListener('click', () => this.selectDate(currentDayDate));
            dayElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectDate(currentDayDate);
                }
            });
            
            this.calendarGrid.appendChild(dayElement);
        }
    }

    selectDate(date) {
        this.selectedDate = date;
        this.updateTodoList();
        this.render();
        this.newTaskInput.focus();
    }

    addNewTask() {
        const taskText = this.newTaskInput.value.trim();
        if (taskText) {
            if (this.taskManager.addTask(this.selectedDate, taskText)) {
                this.newTaskInput.value = '';
                this.updateTodoList();
                this.render();
            }
        }
    }

    clearSelectedTasks() {
        const tasks = this.taskManager.getTasks(this.selectedDate);
        if (tasks.length > 0) {
            if (confirm(`Удалить ${tasks.length} зада${this.getTaskWordEnding(tasks.length)} на эту дату?`)) {
                this.taskManager.clearTasks(this.selectedDate);
                this.updateTodoList();
                this.render();
            }
        }
    }

    updateTodoList() {
        const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.selectedDateElement.textContent = dateFormatter.format(this.selectedDate);

        const tasks = this.taskManager.getTasks(this.selectedDate);

        this.todoListElement.innerHTML = '';

        if (tasks.length === 0) {
            const noTasks = document.createElement('li');
            noTasks.className = 'no-tasks';
            noTasks.textContent = 'Планов нет';
            this.todoListElement.appendChild(noTasks);
        } else {
            tasks.forEach((task, index) => {
                const taskElement = document.createElement('li');
                taskElement.className = 'todo-item';
                
                const taskText = document.createElement('span');
                taskText.className = 'todo-text';
                taskText.textContent = task;
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-task';
                deleteBtn.textContent = 'Удалить';
                deleteBtn.addEventListener('click', () => {
                    this.taskManager.removeTask(this.selectedDate, index);
                    this.updateTodoList();
                    this.render();
                });
                
                taskElement.appendChild(taskText);
                taskElement.appendChild(deleteBtn);
                this.todoListElement.appendChild(taskElement);
            });
        }
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    getTaskWordEnding(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'ча';
        if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'чи';
        return 'ч';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const calendar = new OrganizerCalendar();
    
    console.log('=== Демонстрация стандартных объектов ECMAScript ===');
    
    const now = new Date();
    console.log('Текущая дата:', now.toLocaleDateString('ru-RU'));
    console.log('День недели:', now.getDay());
    
    const sampleArray = ['Задача 1', 'Задача 2', 'Задача 3'];
    console.log('Массив задач:', sampleArray);
    console.log('Отфильтрованный массив:', sampleArray.filter(task => task.includes('2')));
    
    const sampleMap = new Map();
    sampleMap.set('2024-12-25', ['Рождество', 'Праздник']);
    console.log('Map пример:', sampleMap);
    
    const sampleString = '  Задача с пробелами  ';
    console.log('Обрезанная строка:', sampleString.trim());
    
    Date.prototype.formatToRussian = function() {
        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];
        return `${this.getDate()} ${months[this.getMonth()]} ${this.getFullYear()} года`;
    };
    
    console.log('Форматированная дата:', now.formatToRussian());
});

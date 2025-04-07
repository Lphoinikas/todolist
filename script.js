// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const taskCountElement = document.getElementById('task-count');
    
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    /**
     * 初始化应用
     * 渲染待办事项列表并更新任务计数器
     */
    function init() {
        renderTodos();
        updateTaskCount();
    }
    
    /**
     * 渲染待办事项列表
     * @param {string} filter - 筛选条件，可选值为 'all'、'active' 或 'completed'
     */
    function renderTodos(filter = 'all') {
        todoList.innerHTML = '';
        
        let filteredTodos = [];
        
        // 根据筛选条件过滤任务
        switch(filter) {
            case 'active':
                filteredTodos = todos.filter(todo => !todo.completed);
                break;
            case 'completed':
                filteredTodos = todos.filter(todo => todo.completed);
                break;
            default:
                filteredTodos = todos;
        }
        
        // 为每个任务创建DOM元素
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''}
                    data-id="${todo.id}"
                >
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn" data-id="${todo.id}">删除</button>
            `;
            
            todoList.appendChild(todoItem);
        });
        
        // 更新筛选按钮状态
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }
    
    /**
     * 添加新任务
     * 监听表单提交事件，创建新任务并更新任务列表
     */
    todoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const todoText = todoInput.value.trim();
        
        if (todoText) {
            const newTodo = {
                id: Date.now(),
                text: todoText,
                completed: false
            };
            
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            updateTaskCount();
            
            todoInput.value = '';
        }
    });
    
    /**
     * 处理任务完成状态切换和删除
     * 监听任务列表的点击事件，根据点击的目标元素执行相应操作
     */
    todoList.addEventListener('click', function(e) {
        // 完成/取消完成任务
        if (e.target.classList.contains('todo-checkbox')) {
            const todoId = parseInt(e.target.dataset.id);
            const todoIndex = todos.findIndex(todo => todo.id === todoId);
            
            if (todoIndex !== -1) {
                todos[todoIndex].completed = e.target.checked;
                saveTodos();
                renderTodos(getCurrentFilter());
                updateTaskCount();
            }
        }
        
        // 删除任务
        if (e.target.classList.contains('delete-btn')) {
            const todoId = parseInt(e.target.dataset.id);
            todos = todos.filter(todo => todo.id !== todoId);
            saveTodos();
            renderTodos(getCurrentFilter());
            updateTaskCount();
        }
    });
    
    /**
     * 筛选按钮点击事件
     * 根据点击的筛选按钮重新渲染任务列表
     */
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            renderTodos(filter);
        });
    });
    
    /**
     * 清除已完成任务
     * 移除所有已完成的任务并更新任务列表
     */
    clearCompletedBtn.addEventListener('click', function() {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos(getCurrentFilter());
        updateTaskCount();
    });
    
    /**
     * 获取当前筛选状态
     * @returns {string} 当前筛选条件，默认为 'all'
     */
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.filter : 'all';
    }
    
    /**
     * 更新任务计数器
     * 显示未完成任务数和总任务数
     */
    function updateTaskCount() {
        const activeCount = todos.filter(todo => !todo.completed).length;
        const totalCount = todos.length;
        taskCountElement.textContent = `${activeCount} / ${totalCount} 项任务`;
    }
    
    /**
     * 保存任务到本地存储
     * 将当前任务列表保存到 localStorage
     */
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    // 初始化应用
    init();
});
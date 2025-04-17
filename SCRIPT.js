// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', function () {
    // 获取DOM元素
    //container
    const todoForm = document.getElementById('todo-form'); // 获取任务表单元素
    const todoInput = document.getElementById('todo-input'); // 获取任务输入框
    const todoList = document.getElementById('todo-list'); // 获取任务列表容器
    const filterButtons = document.querySelectorAll('.filter-btn'); // 获取所有筛选按钮
    //footer
    const clearCompletedBtn = document.getElementById('clear-completed'); // 获取清除已完成任务按钮
    const taskCountElement = document.getElementById('task-count'); // 获取任务计数器元素

    //第一步：创建任务数组todos，通过操作localstorage来实现任务变动
    //1.1 从 localStorage 中加载任务数据，如果没有数据则初始化为空数组
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    //1.2将任务数组转换为JSON字符串并保存到 localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos)); 
    }

    /**
     * 渲染待办事项列表
     * @param {string} filter - 筛选条件，可选值为 'all'、'active' 或 'completed'
     */
    //第二步：渲染待办事项列表，根据筛选条件显示不同任务（实现更新todo列表的输出、状态的查询）
    //2.1默认是all，即默认显示全部任务
    function renderTodos(filter = 'all') {
        todoList.innerHTML = ''; // 清空任务列表的内容

        let filteredTodos = []; // 存储筛选后的任务，函数内数组，根据筛选按钮的不同值进行筛选，并存储在filteredTodos中，通过数组来渲染

        // 根据筛选条件过滤任务
        switch (filter) {
            case 'active': // 筛选未完成的任务
                filteredTodos = todos.filter(todo => !todo.completed);
                break;
            case 'completed': // 筛选已完成的任务
                filteredTodos = todos.filter(todo => todo.completed);
                break;
            default: // 默认显示所有任务
                filteredTodos = todos;
        }

        //2.2为每个任务创建DOM元素，显示到ul中
        filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li'); // 创建任务列表项
            todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`; 
            // 根据任务状态添加类名。todo.completed 是任务对象的属性，表示任务的完成状态：如果 todo.completed 为 true，返回字符串 'completed'。如果 todo.completed 为 false，返回空字符串 ''

            // 设置任务列表项的HTML内容，包括复选框、任务文本和删除按钮
            todoItem.innerHTML = `
                <input 
                    type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''} // 如果任务已完成，复选框默认选中
                    data-id="${todo.id}" // 将任务ID存储在复选框的自定义属性中
                >
                <span class="todo-text">${todo.text}</span> <!-- 显示任务文本 -->
                <button class="delete-btn" data-id="${todo.id}">删除</button> <!-- 删除按钮 -->
            `;

            todoList.appendChild(todoItem); // 将任务列表项添加到任务列表容器中
        });

        // 更新筛选按钮的激活状态
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter); // 根据当前筛选条件设置按钮的激活状态btn.classList.toggle('active', condition)
            //classList.toggle 方法用于添加或移除类名：如果 condition 为 true，则添加类名 'active'。如果 condition 为 false，则移除类名 'active'。在这里，condition 是 btn.dataset.filter === filter，即判断按钮的 data-filter 属性值是否等于当前筛选条件。
        });
    }

    //第三步：监听表单提交事件，创建新任务并更新任务列表
    todoForm.addEventListener('submit', function (e) {
        e.preventDefault(); // 阻止表单的默认提交行为
        const todoText = todoInput.value.trim(); // 获取输入框的值并去除前后空格

        if (todoText) { // 如果输入框不为空
            const newTodo = {//传递包含的对象属性到todos中
                id: Date.now(), // 使用当前时间戳作为任务ID
                text: todoText, // 任务文本
                completed: false // 默认任务未完成
            };

            todos.push(newTodo); // 将新任务添加到任务数组中
            saveTodos(); // 保存任务到 localStorage
            renderTodos(); // 重新渲染任务列表
            updateTaskCount(); // 更新任务计数器

            todoInput.value = ''; // 清空输入框
        }
    });

    //第四步：监听任务列表的点击事件，根据点击的目标元素执行相应操作，处理任务完成状态切换和删除
    //4.1监听任务列表的点击事件，根据点击的目标元素执行相应操作，处理任务完成状态切换和删除
    todoList.addEventListener('click', function (e) {
        // 4.1.1完成/取消完成任务
        if (e.target.classList.contains('todo-checkbox')) { // 如果点击的是复选框
            const todoId = parseInt(e.target.dataset.id); // 获取任务ID
            const todoIndex = todos.findIndex(todo => todo.id === todoId); // 查找任务在数组中的索引

            if (todoIndex !== -1) { // 如果任务存在
                todos[todoIndex].completed = e.target.checked; // 更新任务的完成状态
                saveTodos(); // 保存任务到 localStorage
                renderTodos(getCurrentFilter()); // 根据当前筛选条件重新渲染任务列表
                updateTaskCount(); // 更新任务计数器
            }
        }

        // 删除任务
        if (e.target.classList.contains('delete-btn')) { // 如果点击的是删除按钮
            const todoId = parseInt(e.target.dataset.id); // 获取任务ID
            todos = todos.filter(todo => todo.id !== todoId); // 若任务列表中的任务ID不是选择删除任务的ID就保留，否则从任务数组中移除对应ID的任务
            saveTodos(); // 保存任务到 localStorage
            renderTodos(getCurrentFilter()); // 根据当前筛选条件重新渲染任务列表
            updateTaskCount(); // 更新任务计数器
        }
    });

    /**
     * 筛选按钮点击事件
     * 根据点击的筛选按钮重新渲染任务列表
     */
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.dataset.filter; // 获取筛选条件默认all，还可选active和completed
            renderTodos(filter); // 根据筛选条件重新渲染任务列表
        });
    });

    /**
     * 清除已完成任务
     * 移除所有已完成的任务并更新任务列表
     */
    clearCompletedBtn.addEventListener('click', function () {
        todos = todos.filter(todo => !todo.completed); // 过滤掉已完成的任务
        saveTodos(); // 保存任务到 localStorage
        renderTodos(getCurrentFilter()); // 根据当前筛选条件重新渲染任务列表
        updateTaskCount(); // 更新任务计数器
    });

    /**
     * 获取当前筛选状态
     * @returns {string} 当前筛选条件，默认为 'all'
     */
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active'); // 获取当前激活的筛选按钮
        return activeFilter ? activeFilter.dataset.filter : 'all'; // 返回筛选条件
    }
    //activeFilter ? activeFilter.dataset.filter : 'all'：检查 activeFilter 是否存在：如果存在，返回该按钮的 data-filter 属性值（如 'all'、'active' 或 'completed'）。如果不存在（即没有激活的筛选按钮），返回默认值 'all'


    /**
     * 更新任务计数器
     * 显示未完成任务数和总任务数
     */
    function updateTaskCount() {
        const activeCount = todos.filter(todo => !todo.completed).length; // 计算未完成任务数
        const totalCount = todos.length; // 计算总任务数
        taskCountElement.textContent = `${activeCount} / ${totalCount} 项任务`; // 更新计数器显示内容
    }

    /**
     * 初始化应用
     * 渲染待办事项列表并更新任务计数器
     */
    function init() {
        renderTodos(); // 渲染任务列表
        updateTaskCount(); // 更新任务计数器
    }


    // 初始化应用
    init(); // 调用初始化函数
});
// Inicializando o localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    document.getElementById('add-task-btn').addEventListener('click', addTask);
    document.getElementById('filter').addEventListener('input', filterTasks);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // Carregar o tema salvo
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
});

// Adicionar tarefa
function addTask() {
    const taskInput = document.getElementById('new-task');
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const tasks = getTasksFromStorage();
    tasks.push({ name: taskText, completed: false });
    setTasksInStorage(tasks);

    taskInput.value = '';
    renderTasks();
}

// Renderizar as tarefas
function renderTasks() {
    const tasks = getTasksFromStorage();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            ${task.name}
            <div>
                <button onclick="toggleComplete(${index})">Concluir</button>
                <button onclick="removeTask(${index})">Remover</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Alternar entre concluído/não concluído
function toggleComplete(index) {
    const tasks = getTasksFromStorage();
    tasks[index].completed = !tasks[index].completed;
    setTasksInStorage(tasks);
    renderTasks();
}

// Remover tarefa
function removeTask(index) {
    const tasks = getTasksFromStorage();
    tasks.splice(index, 1);
    setTasksInStorage(tasks);
    renderTasks();
}

// Filtrar tarefas
function filterTasks() {
    const filter = document.getElementById('filter').value.toLowerCase();
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task => task.name.toLowerCase().includes(filter));
    
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            ${task.name}
            <div>
                <button onclick="toggleComplete(${index})">Concluir</button>
                <button onclick="removeTask(${index})">Remover</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Carregar tarefas do localStorage
function loadTasks() {
    const tasks = getTasksFromStorage();
    if (tasks.length === 0) {
        setTasksInStorage([{ name: 'Exemplo de tarefa', completed: false }]);
    }
    renderTasks();
}

// Obter tarefas do localStorage
function getTasksFromStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// Definir tarefas no localStorage
function setTasksInStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Alternar entre tema claro e escuro
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
}

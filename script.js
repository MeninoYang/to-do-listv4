document.addEventListener("DOMContentLoaded", loadTasks);

const caixaescreve = document.getElementById("caixa-escreve");
const boxlista = document.getElementById("box-lista");
const deletedTasksList = document.getElementById("deletedTasksList");
const emptyMessage = document.getElementById("emptyMessage");

document.addEventListener("click", handleTaskClick);


function toggleLeftMenu() {
    const menuLateralEsquerda = document.getElementById('menuLateralEsquerda');
    menuLateralEsquerda.classList.toggle('show');
}

function toggleMenu() {
    const menuLateral = document.getElementById('menuLateral');
    menuLateral.classList.toggle('show');
}

function sanitizeInput(input) {
    const tempElement = document.createElement('div');
    tempElement.innerText = input;
    return tempElement.innerHTML;
}

function addTask(button) {
    const input = button.previousElementSibling;
    const taskText = input.value;
    
    if (taskText) {
        const taskItem = document.createElement('li');
        const createdTime = new Date().toLocaleString(); // Formato de data/hora local

        taskItem.textContent = taskText;
        taskItem.setAttribute('data-created-time', createdTime); // Atributo para armazenar a hora

        taskItem.addEventListener('mouseover', function() {
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Criado em: ${createdTime}`;
            taskItem.appendChild(tooltip);
        });

        taskItem.addEventListener('mouseout', function() {
            const tooltip = taskItem.querySelector('.tooltip');
            if (tooltip) {
                taskItem.removeChild(tooltip);
            }
        });

        document.getElementById('box-lista').appendChild(taskItem);
        input.value = ''; 
    }
}

function addTask(button) {
    const input = button ? button.previousElementSibling : caixaescreve;
    const taskText = sanitizeInput(input.value);

    if (taskText === '') {
        alert("Você deve escrever algo primeiro");
    } else {
        const li = document.createElement("li");
        li.innerHTML = taskText;
        const span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);

        const ul = button ? button.parentElement.nextElementSibling : boxlista;
        ul.appendChild(li);

        input.value = "";
        saveTasks();
    }
}


boxlista.addEventListener("click", handleTaskClick);
deletedTasksList.addEventListener("click", handleDeletedTaskClick);

function handleTaskClick(e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("verificado");
        saveTasks(); // Atualiza o localStorage quando uma tarefa for verificada
    } else if (e.target.tagName === "SPAN") {
        moveTaskToDeleted(e.target); 
    }
}

function moveTaskToDeleted(target) {
    const taskText = target.parentElement.textContent.replace('\u00d7', '').trim();
    const taskChecked = target.parentElement.classList.contains("verificado");
    const currentDate = new Date();
    const dateTime = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

    const deletedTask = document.createElement("li");
    if (taskChecked) {
        deletedTask.classList.add("checked");
    }
    deletedTask.innerHTML = `${taskText} <small>(${dateTime})</small> <button class="delete-btn">x</button>`;
    deletedTask.setAttribute('data-original-list', target.parentElement.parentElement.id);

    // Adiciona a tarefa à lista de deletados
    deletedTasksList.appendChild(deletedTask);
    target.parentElement.remove();
    saveTasks(); // Atualiza o localStorage
    updateEmptyMessage();
}

deletedTasksList.addEventListener("click", handleDeletedTaskClick);

function handleDeletedTaskClick(e) {
    if (e.target.tagName === "BUTTON" && e.target.classList.contains("delete-btn")) {
        e.target.parentElement.remove(); 
        saveTasks();
        updateEmptyMessage(); 
    } else if (e.target.tagName === "LI") {
        restoreTask(e.target); 
    }
}

function restoreTask(taskElement) {
    const taskText = taskElement.innerHTML.split(' <small>')[0].trim(); // Pega o texto da tarefa
    const taskChecked = taskElement.classList.contains("checked");

    const originalListId = taskElement.getAttribute('data-original-list');
    const originalList = document.getElementById(originalListId);

    if (!originalList) {
        alert('A lista original não foi encontrada!');
        return;
    }

    // Verifica se a tarefa já está na lista para evitar duplicações
    const taskExists = Array.from(originalList.getElementsByTagName('li')).some(li => {
        return li.textContent.replace('\u00d7', '').trim() === taskText;
    });

    if (taskExists) {
        return;
    }

    // Cria e adiciona a tarefa de volta à lista original
    const restoredTask = document.createElement("li");
    restoredTask.innerHTML = taskText;

    if (taskChecked) {
        restoredTask.classList.add("verificado");
    }

    const span = document.createElement("span");
    span.innerHTML = "\u00d7";
    restoredTask.appendChild(span);

    // Adiciona a tarefa de volta à lista original
    originalList.appendChild(restoredTask);

    // Remove a tarefa restaurada da lista de deletados e atualiza o localStorage
    taskElement.remove();
    saveTasks(); // Salva o estado atualizado no localStorage
}

function saveTasks() {
    const lists = document.querySelectorAll('.box-to-do ul');
    lists.forEach((ul, index) => {
        localStorage.setItem(`tasksList${index}`, ul.innerHTML); 
    });

    localStorage.setItem("deletedTasks", deletedTasksList.innerHTML); 
}

function loadTasks() {
    const lists = document.querySelectorAll('.box-to-do ul');
    lists.forEach((ul, index) => {
        ul.innerHTML = localStorage.getItem(`tasksList${index}`) || ''; 
        ul.querySelectorAll('li').forEach(task => {
            task.addEventListener("click", handleTaskClick); 
        });
    });

    deletedTasksList.innerHTML = localStorage.getItem("deletedTasks") || ''; 
    deletedTasksList.querySelectorAll('li').forEach(task => {
        task.addEventListener("click", handleDeletedTaskClick); 
    });

    updateEmptyMessage(); 
}


function updateEmptyMessage() {
    emptyMessage.style.display = deletedTasksList.children.length === 0 ? 'block' : 'none'; 
}

function mostrarCadastroModal() {
    const modal = document.getElementById('cadastroModal');
    modal.style.display = 'block';  // Exibe o modal
}

function mostrarLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';  // Exibe o modal
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal com o ID '${modalId}' não foi encontrado.`);
        return;
    }
    modal.style.display = "block"; 
    modal.classList.remove('hidden');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none'; 
}

window.onclick = function(event) {
    const modals = ['cadastroModal', 'loginModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            if (event.target === modal) {
                closeModal(modalId);
            }
            const closeButton = modal.querySelector('.fechar');
            if (event.target === closeButton) {
                closeModal(modalId);
            }
        }
    });
};

document.getElementById("formCadastro").addEventListener("submit", function(e) {
    e.preventDefault();
    alert("Cadastro realizado com sucesso!");
    closeModal("cadastroModal");
});

document.getElementById("formLogin").addEventListener("submit", function(e) {
    e.preventDefault();
    closeModal("loginModal");
    showUserArea();
});

document.querySelectorAll('.fechar').forEach(button => {
    button.onclick = function() {
        const modalId = this.closest('.modal, .modal-login').id;
        closeModal(modalId);
    };
});

function showUserArea() {
    const areaUsuario = document.getElementById("areaUsuario");
    areaUsuario.style.display = "block";

    document.querySelectorAll('.menu-buttons button').forEach(button => button.style.display = 'none');
    document.getElementById("logoutButton").style.display = 'block';

    const usuarioFoto = document.getElementById("usuarioFoto");
    const savedFoto = localStorage.getItem("usuarioFoto");
    usuarioFoto.src = savedFoto || "default_photo-removebg-preview.png";
    document.getElementById("usuarioNome").innerText = "Nome do Usuário";
    document.getElementById('todoArea').style.display = 'block';
}

function logout() {
    document.getElementById("areaUsuario").style.display = "none";
    document.querySelectorAll('.menu-buttons button').forEach(button => button.style.display = 'block');
    document.getElementById("logoutButton").style.display = 'none';
}

function previewImage(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        document.getElementById("usuarioFoto").src = e.target.result;
        localStorage.setItem("usuarioFoto", e.target.result);
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        document.getElementById("usuarioFoto").src = "default_photo-removebg-preview.png";
    }
}

function editarNomeLista() {
    const nomeLista = document.getElementById("nomeLista");
    const inputNomeLista = document.getElementById("inputNomeLista");

    inputNomeLista.value = nomeLista.innerText;
    nomeLista.style.display = "none";
    inputNomeLista.style.display = "inline";
    inputNomeLista.focus();

    inputNomeLista.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            salvarNomeLista();
        }
    });
}

function salvarNomeLista() {
    const nomeLista = document.getElementById("nomeLista");
    const inputNomeLista = document.getElementById("inputNomeLista");

    nomeLista.innerText = inputNomeLista.value;
    nomeLista.style.display = "inline";
    inputNomeLista.style.display = "none";

    localStorage.setItem('nomeLista', inputNomeLista.value);
}

function setupEditTitle(span) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.innerText;

    input.classList.add("input-titulo");
    input.style.fontFamily = getComputedStyle(span).fontFamily;
    input.style.fontSize = getComputedStyle(span).fontSize;
    input.style.color = getComputedStyle(span).color;

    const parent = span.parentElement;
    parent.replaceChild(input, span);

    input.focus();

    input.addEventListener("blur", function() {
        saveTitle(input.value, parent);
    });

    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            saveTitle(input.value, parent);
        }
    });
}

function saveTitle(newTitle, parent) {
    const span = document.createElement("span");
    span.className = "lista-titulo";
    span.innerText = newTitle;

    span.onclick = function() {
        setupEditTitle(this);
    };

    span.style.fontFamily = getComputedStyle(parent.querySelector("input")).fontFamily;
    span.style.fontSize = getComputedStyle(parent.querySelector("input")).fontSize;
    span.style.color = getComputedStyle(parent.querySelector("input")).color;

    parent.replaceChild(span, parent.querySelector("input"));

    saveTasks();
}

function addNewList() {
    const newList = document.createElement('div');
    newList.classList.add('box-to-do');

    const listId = `list-${Date.now()}`; 

    newList.innerHTML = `
        <h2>
            <span class="lista-titulo" onclick="setupEditTitle(this)">Nova lista</span>
            <input type="text" style="display: none;" class="input-titulo" />
            <img src="icon.png" alt="icone da lista">
        </h2>
        <div class="coiso">
            <input type="text" placeholder="Escreva aqui...">
            <button onclick="addTask(this)">Adicionar</button>
        </div>
        <ul id="${listId}"></ul>
    `;

    document.getElementById('listasContainer').appendChild(newList);

    const ul = newList.querySelector("ul");
    ul.addEventListener("click", handleTaskClick);

    document.getElementById('addListButton').style.display = 'none';
}

function addTask(button) {
    const input = button ? button.previousElementSibling : caixaescreve;
    const taskText = sanitizeInput(input.value);

    if (taskText === '') {
        alert("Você deve escrever algo primeiro");
    } else {
        const li = document.createElement("li");
        li.innerHTML = taskText;
        
        li.addEventListener("click", handleTaskClick);

        const span = document.createElement("span");
        span.innerHTML = "\u00d7";
        li.appendChild(span);

        const ul = button ? button.parentElement.nextElementSibling : boxlista;
        ul.appendChild(li);

        input.value = "";
        saveTasks();
    }
}

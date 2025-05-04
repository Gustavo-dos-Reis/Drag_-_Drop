document.addEventListener('DOMContentLoaded', function() {
    const listaTarefas = document.getElementById('lista-tarefas');
    const inputTarefa = document.getElementById('nova-tarefa');
    const btnAdicionar = document.getElementById('adicionar-btn');
    const btnFiltros = document.querySelectorAll('.filtro-btn');
    const btnLimparConcluidas = document.getElementById('limpar-concluidas');
    const btnLimparTodas = document.getElementById('limpar-todas');
    
    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    let tarefaArrastada = null;
    
    // Inicializa a lista
    function renderizarTarefas(filtro = 'todas') {
        listaTarefas.innerHTML = '';
        
        const tarefasFiltradas = tarefas.filter(tarefa => {
            if (filtro === 'pendentes') return !tarefa.concluida;
            if (filtro === 'concluidas') return tarefa.concluida;
            return true;
        });
        
        tarefasFiltradas.forEach((tarefa, index) => {
            const itemTarefa = document.createElement('li');
            itemTarefa.className = `tarefa ${tarefa.concluida ? 'concluida' : ''}`;
            itemTarefa.draggable = true;
            itemTarefa.dataset.id = tarefa.id;
            
            itemTarefa.innerHTML = `
                <span class="texto-tarefa">${tarefa.texto}</span>
                <div class="botoes-tarefa">
                    <button class="botao-tarefa botao-concluir">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="botao-tarefa botao-excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Eventos de drag and drop
            itemTarefa.addEventListener('dragstart', handleDragStart);
            itemTarefa.addEventListener('dragover', handleDragOver);
            itemTarefa.addEventListener('dragleave', handleDragLeave);
            itemTarefa.addEventListener('drop', handleDrop);
            itemTarefa.addEventListener('dragend', handleDragEnd);
            
            // Eventos dos botões
            const btnConcluir = itemTarefa.querySelector('.botao-concluir');
            const btnExcluir = itemTarefa.querySelector('.botao-excluir');
            
            btnConcluir.addEventListener('click', () => toggleConcluirTarefa(tarefa.id));
            btnExcluir.addEventListener('click', () => excluirTarefa(tarefa.id));
            
            listaTarefas.appendChild(itemTarefa);
        });
        
        salvarNoLocalStorage();
    }
    
    // Adiciona nova tarefa
    function adicionarTarefa() {
        const texto = inputTarefa.value.trim();
        if (texto === '') return;
        
        const novaTarefa = {
            id: Date.now(),
            texto,
            concluida: false
        };
        
        tarefas.unshift(novaTarefa);
        inputTarefa.value = '';
        renderizarTarefas(document.querySelector('.filtro-btn.ativo').dataset.filtro);
    }
    
    // Alterna status de conclusão
    function toggleConcluirTarefa(id) {
        tarefas = tarefas.map(tarefa => 
            tarefa.id === id ? {...tarefa, concluida: !tarefa.concluida} : tarefa
        );
        renderizarTarefas(document.querySelector('.filtro-btn.ativo').dataset.filtro);
    }
    
    // Exclui tarefa
    function excluirTarefa(id) {
        tarefas = tarefas.filter(tarefa => tarefa.id !== id);
        renderizarTarefas(document.querySelector('.filtro-btn.ativo').dataset.filtro);
    }
    
    // Filtra tarefas
    function filtrarTarefas(filtro) {
        btnFiltros.forEach(btn => btn.classList.remove('ativo'));
        event.target.classList.add('ativo');
        renderizarTarefas(filtro);
    }
    
    // Limpa tarefas concluídas
    function limparConcluidas() {
        tarefas = tarefas.filter(tarefa => !tarefa.concluida);
        renderizarTarefas(document.querySelector('.filtro-btn.ativo').dataset.filtro);
    }
    
    // Limpa todas as tarefas
    function limparTodas() {
        if (confirm('Tem certeza que deseja apagar todas as tarefas?')) {
            tarefas = [];
            renderizarTarefas();
        }
    }
    
    // Salva no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    }
    
    // Handlers para Drag and Drop
    function handleDragStart(e) {
        tarefaArrastada = this;
        this.classList.add('arrastando');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        this.classList.add('alvo-drop');
        return false;
    }
    
    function handleDragLeave() {
        this.classList.remove('alvo-drop');
    }
    
    function handleDrop(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (tarefaArrastada !== this) {
            const idOrigem = parseInt(tarefaArrastada.dataset.id);
            const idDestino = parseInt(this.dataset.id);
            
            const indexOrigem = tarefas.findIndex(t => t.id === idOrigem);
            const indexDestino = tarefas.findIndex(t => t.id === idDestino);
            
            // Reordena o array
            const [tarefaMovida] = tarefas.splice(indexOrigem, 1);
            tarefas.splice(indexDestino, 0, tarefaMovida);
            
            renderizarTarefas(document.querySelector('.filtro-btn.ativo').dataset.filtro);
        }
        
        this.classList.remove('alvo-drop');
        return false;
    }
    
    function handleDragEnd() {
        this.classList.remove('arrastando');
        document.querySelectorAll('.tarefa').forEach(t => t.classList.remove('alvo-drop'));
    }
    
    // Event Listeners
    btnAdicionar.addEventListener('click', adicionarTarefa);
    inputTarefa.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adicionarTarefa();
    });
    
    btnFiltros.forEach(btn => {
        btn.addEventListener('click', () => filtrarTarefas(btn.dataset.filtro));
    });
    
    btnLimparConcluidas.addEventListener('click', limparConcluidas);
    btnLimparTodas.addEventListener('click', limparTodas);
    
    // Inicializa a aplicação
    renderizarTarefas();
});
// Inicialização da página de objetivos
document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaObjetivos();
    configurarEventListeners();
});

// Função para inicializar a página de objetivos
function inicializarPaginaObjetivos() {
    atualizarEstatisticasObjetivos();
    atualizarListaObjetivos();
    atualizarProgressoGeral();
    verificarModoEscuro();
}

// Verificar e aplicar o modo escuro se estiver ativado
function verificarModoEscuro() {
    // Modo escuro sempre ativado
    window.modoEscuro = true;
    console.log('Modo escuro definido como padrão em goals.js');
    
    // Aplicar classes para modo escuro
    document.body.classList.add('modo-escuro');
    document.documentElement.classList.add('modo-escuro-html');
    console.log('Classes de modo escuro aplicadas em goals.js');
}

// Configurar event listeners da página
function configurarEventListeners() {
    // O botão de modo escuro foi removido, pois o modo escuro agora é padrão
    
    // Formulário de objetivo
    document.getElementById('salvar-objetivo').addEventListener('click', salvarObjetivo);
    
    // Busca de objetivos
    document.getElementById('buscar-objetivo').addEventListener('input', filtrarObjetivos);
    
    // Confirmação de exclusão
    document.getElementById('confirmar-exclusao').addEventListener('click', function() {
        const objetivoId = this.getAttribute('data-id');
        if (objetivoId) {
            excluirObjetivo(objetivoId);
        }
    });
}

// Atualizar estatísticas gerais dos objetivos
function atualizarEstatisticasObjetivos() {
    let totalValor = 0;
    let concluidos = 0;
    let emAndamento = 0;
    
    dadosFinanceiros.objetivos.forEach(objetivo => {
        totalValor += objetivo.valorTotal;
        
        if (objetivo.valorAtual >= objetivo.valorTotal) {
            concluidos++;
        } else {
            emAndamento++;
        }
    });
    
    document.getElementById('total-objetivos').textContent = formatarMoeda(totalValor);
    document.getElementById('objetivos-concluidos').textContent = concluidos;
    document.getElementById('objetivos-andamento').textContent = emAndamento;
}

// Atualizar lista de objetivos na tabela
function atualizarListaObjetivos() {
    const tabela = document.getElementById('tabela-objetivos');
    const semObjetivosRow = document.getElementById('sem-objetivos-row');
    
    // Limpar tabela mantendo apenas a linha de "sem objetivos"
    Array.from(tabela.children).forEach(child => {
        if (child.id !== 'sem-objetivos-row') {
            child.remove();
        }
    });
    
    // Verificar se há objetivos
    if (dadosFinanceiros.objetivos.length === 0) {
        semObjetivosRow.style.display = 'table-row';
        document.getElementById('sem-objetivos-msg').style.display = 'block';
        return;
    }
    
    // Ocultar mensagem de "sem objetivos"
    semObjetivosRow.style.display = 'none';
    document.getElementById('sem-objetivos-msg').style.display = 'none';
    
    // Adicionar cada objetivo à tabela
    dadosFinanceiros.objetivos.forEach((objetivo, index) => {
        const progresso = (objetivo.valorAtual / objetivo.valorTotal) * 100;
        const dataLimite = objetivo.dataLimite ? formatarData(objetivo.dataLimite) : 'Não definida';
        
        const tr = document.createElement('tr');
        tr.className = 'objetivo-item';
        tr.innerHTML = `
            <td>${objetivo.titulo}</td>
            <td>${formatarMoeda(objetivo.valorTotal)}</td>
            <td>${formatarMoeda(objetivo.valorAtual)}</td>
            <td>
                <div class="progress" style="height: 10px;">
                    <div class="progress-bar ${progresso >= 100 ? 'bg-success' : ''}" 
                         role="progressbar" 
                         style="width: ${progresso}%" 
                         aria-valuenow="${progresso}" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                <small class="text-muted">${progresso.toFixed(0)}%</small>
            </td>
            <td>${dataLimite}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarObjetivo(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="confirmarExclusao(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tabela.appendChild(tr);
    });
}

// Atualizar barras de progresso geral
function atualizarProgressoGeral() {
    const container = document.getElementById('objetivos-progresso');
    container.innerHTML = '';
    
    if (dadosFinanceiros.objetivos.length === 0) {
        return;
    }
    
    dadosFinanceiros.objetivos.forEach(objetivo => {
        const progresso = (objetivo.valorAtual / objetivo.valorTotal) * 100;
        const progressoElement = document.createElement('div');
        progressoElement.className = 'mb-3';
        progressoElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <div>${objetivo.titulo}</div>
                <div><small>${formatarMoeda(objetivo.valorAtual)} de ${formatarMoeda(objetivo.valorTotal)}</small></div>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar ${progresso >= 100 ? 'bg-success' : ''}" 
                     role="progressbar" 
                     style="width: ${progresso}%" 
                     aria-valuenow="${progresso}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                </div>
            </div>
        `;
        
        container.appendChild(progressoElement);
    });
}

// Filtrar objetivos na tabela
function filtrarObjetivos() {
    const termo = document.getElementById('buscar-objetivo').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-objetivos .objetivo-item');
    
    linhas.forEach(linha => {
        const titulo = linha.cells[0].textContent.toLowerCase();
        if (titulo.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Abrir modal para editar objetivo
function editarObjetivo(index) {
    const objetivo = dadosFinanceiros.objetivos[index];
    
    document.getElementById('objetivo-id').value = index;
    document.getElementById('objetivo-titulo').value = objetivo.titulo;
    document.getElementById('objetivo-descricao').value = objetivo.descricao || '';
    document.getElementById('objetivo-valor-total').value = objetivo.valorTotal;
    document.getElementById('objetivo-valor-atual').value = objetivo.valorAtual;
    document.getElementById('objetivo-data-limite').value = objetivo.dataLimite || '';
    document.getElementById('objetivo-categoria').value = objetivo.categoria || 'outro';
    
    document.getElementById('modalObjetivoLabel').textContent = 'Editar Objetivo';
    
    const modal = new bootstrap.Modal(document.getElementById('modalObjetivo'));
    modal.show();
}

// Confirmar exclusão de objetivo
function confirmarExclusao(index) {
    document.getElementById('confirmar-exclusao').setAttribute('data-id', index);
    const modal = new bootstrap.Modal(document.getElementById('modalConfirmacao'));
    modal.show();
}

// Excluir objetivo
function excluirObjetivo(index) {
    dadosFinanceiros.objetivos.splice(index, 1);
    
    // Fechar modal de confirmação
    const modalConfirmacao = bootstrap.Modal.getInstance(document.getElementById('modalConfirmacao'));
    modalConfirmacao.hide();
    
    // Atualizar interface
    atualizarEstatisticasObjetivos();
    atualizarListaObjetivos();
    atualizarProgressoGeral();
    
    // Atualizar também o dashboard se estiver na mesma sessão
    if (typeof atualizarObjetivo === 'function') {
        atualizarObjetivo();
    }
}

// Salvar objetivo (novo ou edição)
function salvarObjetivo() {
    const id = document.getElementById('objetivo-id').value;
    const titulo = document.getElementById('objetivo-titulo').value;
    const descricao = document.getElementById('objetivo-descricao').value;
    const valorTotal = parseFloat(document.getElementById('objetivo-valor-total').value);
    const valorAtual = parseFloat(document.getElementById('objetivo-valor-atual').value);
    const dataLimite = document.getElementById('objetivo-data-limite').value;
    const categoria = document.getElementById('objetivo-categoria').value;
    
    if (!titulo || isNaN(valorTotal)) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    const objetivo = {
        titulo: titulo,
        descricao: descricao,
        valorTotal: valorTotal,
        valorAtual: valorAtual || 0,
        dataLimite: dataLimite,
        categoria: categoria,
        id: Date.now().toString() // Gerar ID único
    };
    
    if (id === '') {
        // Novo objetivo
        dadosFinanceiros.objetivos.push(objetivo);
    } else {
        // Edição de objetivo existente
        dadosFinanceiros.objetivos[parseInt(id)] = objetivo;
    }
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalObjetivo'));
    modal.hide();
    
    // Limpar formulário
    document.getElementById('form-objetivo').reset();
    document.getElementById('objetivo-id').value = '';
    document.getElementById('modalObjetivoLabel').textContent = 'Novo Objetivo';
    
    // Atualizar interface
    atualizarEstatisticasObjetivos();
    atualizarListaObjetivos();
    atualizarProgressoGeral();
    
    // Atualizar também o dashboard se estiver na mesma sessão
    if (typeof atualizarObjetivo === 'function') {
        atualizarObjetivo();
    }
}

// Adicionar valor a um objetivo existente
function adicionarValorObjetivo(index, valor) {
    if (index >= 0 && index < dadosFinanceiros.objetivos.length) {
        dadosFinanceiros.objetivos[index].valorAtual += valor;
        
        // Atualizar interface
        atualizarEstatisticasObjetivos();
        atualizarListaObjetivos();
        atualizarProgressoGeral();
        
        // Atualizar também o dashboard se estiver na mesma sessão
        if (typeof atualizarObjetivo === 'function') {
            atualizarObjetivo();
        }
        
        return true;
    }
    
    return false;
}
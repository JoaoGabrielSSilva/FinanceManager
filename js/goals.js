// Função para inicializar a página de objetivos
function inicializarObjetivos() {
    // Inicializa os componentes personalizados
    initModals();
    initCollapseElements();
    initDropdowns();
    initFormValidation();
    initTooltips();
    
    // Carrega dados do localStorage
    carregarDados();
    
    // Atualiza as estatísticas
    atualizarEstatisticas();
    
    // Preenche a lista de objetivos
    preencherListaObjetivos();
    
    // Configura os event listeners
    configurarEventListeners();
}

// Função para carregar dados do localStorage
function carregarDados() {
    const objetivosStorage = localStorage.getItem('objetivos');
    
    if (objetivosStorage) {
        dadosObjetivos = JSON.parse(objetivosStorage);
    } else {
        // Dados de exemplo para objetivos
        dadosObjetivos = [
            { id: 1, nome: 'Viagem para a praia', valor: 2000, valorAtual: 800, data: '2023-12-31', categoria: 'Viagem', descricao: 'Férias de fim de ano' },
            { id: 2, nome: 'Notebook novo', valor: 5000, valorAtual: 2500, data: '2023-09-30', categoria: 'Tecnologia', descricao: 'Para trabalho e estudos' }
        ];
        salvarObjetivos();
    }
}

// Função para salvar objetivos no localStorage
function salvarObjetivos() {
    localStorage.setItem('objetivos', JSON.stringify(dadosObjetivos));
}

// Função para atualizar as estatísticas
function atualizarEstatisticas() {
    // Total de objetivos
    document.getElementById('total-objetivos').textContent = dadosObjetivos.length;
    
    // Objetivos concluídos
    const objetivosConcluidos = dadosObjetivos.filter(objetivo => 
        objetivo.valorAtual >= objetivo.valor
    ).length;
    document.getElementById('objetivos-concluidos').textContent = objetivosConcluidos;
    
    // Valor total
    const valorTotal = dadosObjetivos.reduce((acc, objetivo) => acc + objetivo.valor, 0);
    document.getElementById('valor-total-objetivos').textContent = formatarMoeda(valorTotal);
}

// Função para preencher a lista de objetivos
function preencherListaObjetivos() {
    const listaObjetivos = document.getElementById('lista-objetivos');
    const semObjetivos = document.getElementById('sem-objetivos');
    
    // Limpa a lista
    listaObjetivos.innerHTML = '';
    
    // Verifica se há objetivos
    if (dadosObjetivos.length === 0) {
        semObjetivos.style.display = 'block';
        return;
    }
    
    // Esconde a mensagem de sem objetivos
    semObjetivos.style.display = 'none';
    
    // Adiciona cada objetivo à lista
    dadosObjetivos.forEach(objetivo => {
        // Calcula o progresso
        const progresso = (objetivo.valorAtual / objetivo.valor) * 100;
        
        // Cria o elemento do objetivo
        const objetivoElement = document.createElement('div');
        objetivoElement.className = 'objetivo-card';
        objetivoElement.innerHTML = `
            <div class="objetivo-header">
                <h3 class="objetivo-titulo">${objetivo.nome}</h3>
                <div class="objetivo-acoes">
                    <button class="btn btn-sm btn-outline-secondary editar-objetivo" data-id="${objetivo.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger excluir-objetivo" data-id="${objetivo.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="objetivo-progresso">
                <div class="barra-progresso">
                    <div class="barra-progresso-fill" style="width: ${progresso}%"></div>
                </div>
                <div class="objetivo-info">
                    <span>${formatarMoeda(objetivo.valorAtual)}</span>
                    <span>${formatarMoeda(objetivo.valor)}</span>
                </div>
                <div class="objetivo-meta">
                    <span>${progresso.toFixed(0)}% concluído</span>
                    <span class="objetivo-data">${objetivo.data ? formatarData(objetivo.data) : 'Sem data'}</span>
                </div>
            </div>
            <div class="objetivo-detalhes">
                <span class="objetivo-categoria">${objetivo.categoria}</span>
                ${objetivo.descricao ? `<p class="objetivo-descricao">${objetivo.descricao}</p>` : ''}
            </div>
        `;
        
        listaObjetivos.appendChild(objetivoElement);
    });
    
    // Adiciona event listeners para os botões de editar e excluir
    document.querySelectorAll('.editar-objetivo').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            abrirModalEditarObjetivo(id);
        });
    });
    
    document.querySelectorAll('.excluir-objetivo').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            abrirModalConfirmarExclusao(id);
        });
    });
}

// Função para configurar os event listeners
function configurarEventListeners() {
    // Botão para adicionar objetivo
    const btnAdicionarObjetivo = document.getElementById('adicionar-objetivo');
    if (btnAdicionarObjetivo) {
        btnAdicionarObjetivo.addEventListener('click', () => {
            abrirModalAdicionarObjetivo();
        });
    }
    
    // Botão para criar primeiro objetivo
    const btnCriarPrimeiroObjetivo = document.getElementById('criar-primeiro-objetivo');
    if (btnCriarPrimeiroObjetivo) {
        btnCriarPrimeiroObjetivo.addEventListener('click', () => {
            abrirModalAdicionarObjetivo();
        });
    }
    
    // Botão para salvar objetivo
    const btnSalvarObjetivo = document.getElementById('salvar-objetivo');
    if (btnSalvarObjetivo) {
        btnSalvarObjetivo.addEventListener('click', () => {
            salvarObjetivo();
        });
    }
    
    // Botão para confirmar exclusão
    const btnConfirmarExclusao = document.getElementById('confirmar-exclusao');
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', () => {
            const id = parseInt(btnConfirmarExclusao.getAttribute('data-id'));
            excluirObjetivo(id);
        });
    }
}

// Função para abrir o modal de adicionar objetivo
function abrirModalAdicionarObjetivo() {
    // Limpa o formulário
    document.getElementById('objetivo-id').value = '';
    document.getElementById('objetivo-nome').value = '';
    document.getElementById('objetivo-valor').value = '';
    document.getElementById('objetivo-valor-atual').value = '0';
    document.getElementById('objetivo-data').value = '';
    document.getElementById('objetivo-categoria').value = 'Viagem';
    document.getElementById('objetivo-descricao').value = '';
    
    // Atualiza o título do modal
    document.getElementById('titulo-modal-objetivo').textContent = 'Novo Objetivo';
    
    // Abre o modal
    const modal = document.getElementById('modal-objetivo');
    modal.classList.add('show');
}

// Função para abrir o modal de editar objetivo
function abrirModalEditarObjetivo(id) {
    // Busca o objetivo pelo ID
    const objetivo = dadosObjetivos.find(o => o.id === id);
    if (!objetivo) return;
    
    // Preenche o formulário
    document.getElementById('objetivo-id').value = objetivo.id;
    document.getElementById('objetivo-nome').value = objetivo.nome;
    document.getElementById('objetivo-valor').value = objetivo.valor;
    document.getElementById('objetivo-valor-atual').value = objetivo.valorAtual;
    document.getElementById('objetivo-data').value = objetivo.data || '';
    document.getElementById('objetivo-categoria').value = objetivo.categoria;
    document.getElementById('objetivo-descricao').value = objetivo.descricao || '';
    
    // Atualiza o título do modal
    document.getElementById('titulo-modal-objetivo').textContent = 'Editar Objetivo';
    
    // Abre o modal
    const modal = document.getElementById('modal-objetivo');
    modal.classList.add('show');
}

// Função para abrir o modal de confirmar exclusão
function abrirModalConfirmarExclusao(id) {
    // Configura o botão de confirmação
    const btnConfirmarExclusao = document.getElementById('confirmar-exclusao');
    btnConfirmarExclusao.setAttribute('data-id', id);
    
    // Abre o modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.add('show');
}

// Função para salvar um objetivo
function salvarObjetivo() {
    // Obtém os valores do formulário
    const id = document.getElementById('objetivo-id').value;
    const nome = document.getElementById('objetivo-nome').value;
    const valor = parseFloat(document.getElementById('objetivo-valor').value);
    const valorAtual = parseFloat(document.getElementById('objetivo-valor-atual').value);
    const data = document.getElementById('objetivo-data').value;
    const categoria = document.getElementById('objetivo-categoria').value;
    const descricao = document.getElementById('objetivo-descricao').value;
    
    // Valida os campos
    if (!nome || isNaN(valor) || valor <= 0 || isNaN(valorAtual) || valorAtual < 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    // Cria o objeto do objetivo
    const objetivo = {
        nome,
        valor,
        valorAtual,
        data,
        categoria,
        descricao
    };
    
    // Verifica se é uma edição ou um novo objetivo
    if (id) {
        // Edição
        objetivo.id = parseInt(id);
        const index = dadosObjetivos.findIndex(o => o.id === objetivo.id);
        if (index !== -1) {
            dadosObjetivos[index] = objetivo;
        }
    } else {
        // Novo objetivo
        objetivo.id = dadosObjetivos.length > 0 ? Math.max(...dadosObjetivos.map(o => o.id)) + 1 : 1;
        dadosObjetivos.push(objetivo);
    }
    
    // Salva os objetivos
    salvarObjetivos();
    
    // Atualiza a interface
    atualizarEstatisticas();
    preencherListaObjetivos();
    
    // Fecha o modal
    const modal = document.getElementById('modal-objetivo');
    modal.classList.remove('show');
}

// Função para excluir um objetivo
function excluirObjetivo(id) {
    // Remove o objetivo do array
    dadosObjetivos = dadosObjetivos.filter(o => o.id !== id);
    
    // Salva os objetivos
    salvarObjetivos();
    
    // Atualiza a interface
    atualizarEstatisticas();
    preencherListaObjetivos();
    
    // Fecha o modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.remove('show');
}

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Função para formatar data
function formatarData(data) {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
}

// Inicializa a página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarObjetivos);
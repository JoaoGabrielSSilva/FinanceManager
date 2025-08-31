// Dados de exemplo para o aplicativo
let dadosFinanceiros = {
    saldoAtual: 0,
    receitas: 0,
    despesas: 0,
    objetivos: [
        
    ],
    transacoes: [
        
    ]
};


// Variáveis globais
// Definir modo escuro como padrão
window.modoEscuro = true;

// Função para inicializar o modo escuro
function inicializarModoEscuro() {
    // Definir modo escuro como padrão (sempre ativado)
    window.modoEscuro = true;
    console.log('Modo escuro definido como padrão');
}

// Inicializar o modo escuro imediatamente
inicializarModoEscuro();

let objetivoAtualIndex = 0;
let chartMeta;
let chartMensal;

// Função para formatar valores monetários
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar datas
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Inicialização do Dashboard
function inicializarDashboard() {
    atualizarSaldo();
    atualizarObjetivo();
    criarGraficoMensal();
    atualizarTabelaTransacoes();
    configurarEventListeners();
}

// Atualizar informações de saldo
function atualizarSaldo() {
    document.getElementById('saldo-atual').textContent = formatarMoeda(dadosFinanceiros.saldoAtual);
    document.getElementById('total-receitas').textContent = formatarMoeda(dadosFinanceiros.receitas);
    document.getElementById('total-despesas').textContent = formatarMoeda(dadosFinanceiros.despesas);
}

// Atualizar objetivo financeiro
function atualizarObjetivo() {
    // Verificar se existem objetivos
    if (dadosFinanceiros.objetivos.length === 0) {
        // Exibir mensagem placeholder quando não há objetivos
        document.getElementById('meta-titulo').textContent = "Não há meta atualmente";
        document.getElementById('meta-valor-atual').textContent = "--";
        document.getElementById('meta-valor-total').textContent = "--";
        
        // Limpar o gráfico se existir
        if (chartMeta) {
            chartMeta.destroy();
            chartMeta = null;
        }
        
        // Remover texto de porcentagem se existir
        const existingText = document.getElementById('meta-porcentagem');
        if (existingText) {
            existingText.remove();
        }
        
        // Desabilitar botões de navegação
        document.getElementById('prev-meta').disabled = true;
        document.getElementById('next-meta').disabled = true;
        
        return;
    } else {
        // Habilitar botões de navegação
        document.getElementById('prev-meta').disabled = false;
        document.getElementById('next-meta').disabled = false;
    }
    
    const objetivo = dadosFinanceiros.objetivos[objetivoAtualIndex];
    document.getElementById('meta-titulo').textContent = objetivo.titulo;
    document.getElementById('meta-valor-atual').textContent = formatarMoeda(objetivo.valorAtual);
    document.getElementById('meta-valor-total').textContent = formatarMoeda(objetivo.valorTotal);
    
    // Atualizar gráfico de meta
    criarGraficoMeta(objetivo);
}

// Criar gráfico de meta (donut)
function criarGraficoMeta(objetivo) {
    const porcentagem = (objetivo.valorAtual / objetivo.valorTotal) * 100;
    const ctx = document.getElementById('grafico-meta').getContext('2d');
    
    // Destruir gráfico anterior se existir
    if (chartMeta) {
        chartMeta.destroy();
    }
    
    // Definir cores baseadas no modo atual (claro/escuro)
    const progressColor = modoEscuro ? 'rgba(66, 133, 244, 0.8)' : '#007bff';
    const remainingColor = modoEscuro ? 'rgba(255, 255, 255, 0.1)' : '#e9ecef';
    const textColor = modoEscuro ? '#adb5bd' : '#666';
    
    chartMeta = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Progresso', 'Restante'],
            datasets: [{
                data: [objetivo.valorAtual, objetivo.valorTotal - objetivo.valorAtual],
                backgroundColor: [progressColor, remainingColor],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '70%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatarMoeda(context.raw);
                        }
                    }
                }
            }
        }
    });
    
    // Adicionar texto no centro do donut
    const porcentagemFormatada = porcentagem.toFixed(0) + '%';
    const existingText = document.getElementById('meta-porcentagem');
    if (existingText) {
        existingText.textContent = porcentagemFormatada;
    } else {
        const canvas = document.getElementById('grafico-meta');
        const container = canvas.parentNode;
        const textElement = document.createElement('div');
        textElement.id = 'meta-porcentagem';
        textElement.style.position = 'absolute';
        textElement.style.top = '50%';
        textElement.style.left = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.style.fontSize = '1.5rem';
        textElement.style.fontWeight = 'bold';
        textElement.textContent = porcentagemFormatada;
        container.style.position = 'relative';
        container.appendChild(textElement);
    }
}

// Criar gráfico mensal (barras)
function criarGraficoMensal() {
    const ctx = document.getElementById('grafico-mensal').getContext('2d');
    
    // Dados de exemplo para os últimos 6 meses
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const receitas = [3000, 3200, 3100, 3400, 3300, 3500];
    const despesas = [2500, 2700, 2400, 2800, 2600, 1000];
    
    // Destruir gráfico anterior se existir
    if (chartMensal) {
        chartMensal.destroy();
    }
    
    // Definir cores baseadas no modo atual (claro/escuro)
    const gridColor = modoEscuro ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = modoEscuro ? '#adb5bd' : '#666';
    
    chartMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitas,
                    backgroundColor: modoEscuro ? 'rgba(76, 175, 80, 0.7)' : '#28a745',
                    borderWidth: 0
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    backgroundColor: modoEscuro ? 'rgba(244, 67, 54, 0.7)' : '#dc3545',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return 'R$ ' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatarMoeda(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// Atualizar tabela de transações
function atualizarTabelaTransacoes() {
    const tabela = document.getElementById('tabela-transacoes');
    tabela.innerHTML = '';
    
    dadosFinanceiros.transacoes.forEach(transacao => {
        const tr = document.createElement('tr');
        tr.className = `transaction-item ${transacao.tipo === 'receita' ? 'income' : 'expense'}`;
        tr.dataset.id = transacao.id;
        
        // Formatar valor com classe de cor
        const valorFormatado = formatarMoeda(transacao.valor);
        const valorClass = transacao.tipo === 'receita' ? 'value-positive' : 'value-negative';
        const valorPrefix = transacao.tipo === 'receita' ? '+' : '-';
        
        // Criar células da tabela
        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td><span class="badge bg-light text-dark badge-category">${transacao.categoria}</span></td>
            <td class="${valorClass}">${valorPrefix} ${valorFormatado}</td>
            <td>${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
            <td>
                <button class="btn-delete" data-id="${transacao.id}" title="Excluir transação">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        
        tabela.appendChild(tr);
    });
    
    // Adicionar event listeners para os botões de exclusão
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que o evento se propague para a linha
            const id = parseInt(this.dataset.id);
            excluirTransacao(id);
        });
    });
}

// Função para excluir uma transação
function excluirTransacao(id) {
    // Encontrar o índice da transação no array
    const index = dadosFinanceiros.transacoes.findIndex(t => t.id === id);
    
    if (index !== -1) {
        // Remover a transação do array
        const transacaoRemovida = dadosFinanceiros.transacoes.splice(index, 1)[0];
        
        // Atualizar saldo
        if (transacaoRemovida.tipo === 'receita') {
            dadosFinanceiros.receitas -= transacaoRemovida.valor;
            dadosFinanceiros.saldoAtual -= transacaoRemovida.valor;
        } else {
            dadosFinanceiros.despesas -= transacaoRemovida.valor;
            dadosFinanceiros.saldoAtual += transacaoRemovida.valor;
        }
        
        // Atualizar a interface
        inicializarDashboard();
    }
}

// Configurar event listeners
function configurarEventListeners() {
    // Navegação entre objetivos
    document.getElementById('prev-meta').addEventListener('click', () => {
        objetivoAtualIndex = (objetivoAtualIndex - 1 + dadosFinanceiros.objetivos.length) % dadosFinanceiros.objetivos.length;
        atualizarObjetivo();
    });
    
    document.getElementById('next-meta').addEventListener('click', () => {
        objetivoAtualIndex = (objetivoAtualIndex + 1) % dadosFinanceiros.objetivos.length;
        atualizarObjetivo();
    });
    
    // Ordenação da tabela
    document.getElementById('sort-data').addEventListener('click', () => {
        dadosFinanceiros.transacoes.sort((a, b) => new Date(a.data) - new Date(b.data));
        atualizarTabelaTransacoes();
    });
    
    document.getElementById('sort-valor').addEventListener('click', () => {
        dadosFinanceiros.transacoes.sort((a, b) => b.valor - a.valor);
        atualizarTabelaTransacoes();
    });
    
    document.getElementById('sort-categoria').addEventListener('click', () => {
        dadosFinanceiros.transacoes.sort((a, b) => a.categoria.localeCompare(b.categoria));
        atualizarTabelaTransacoes();
    });
    
    // Botão flutuante para cadastros
    document.getElementById('btn-add').addEventListener('click', () => {
        const modal = new bootstrap.Modal(document.getElementById('modal-cadastro'));
        modal.show();
    });
    
    // Alternar entre formulários no modal
    document.getElementById('btn-despesa').addEventListener('change', toggleFormularios);
    document.getElementById('btn-receita').addEventListener('change', toggleFormularios);
    document.getElementById('btn-objetivo').addEventListener('change', toggleFormularios);
    
    // Submissão dos formulários
    document.getElementById('form-transacao').addEventListener('submit', cadastrarTransacao);
    document.getElementById('form-objetivo').addEventListener('submit', cadastrarObjetivo);
    
    // Definir data atual como padrão nos campos de data
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = hoje;
    document.getElementById('objetivo-data').value = hoje;
    
    // O botão de modo escuro foi removido, pois o modo escuro agora é padrão
}

// Função configurarMenuUsuario foi removida pois não é mais necessária
// Função toggleModoEscuro também foi removida pois o modo escuro agora é padrão

// Alternar entre formulários no modal
function toggleFormularios() {
    const formTransacao = document.getElementById('form-transacao');
    const formObjetivo = document.getElementById('form-objetivo');
    const modalTitulo = document.getElementById('modal-titulo');
    
    if (document.getElementById('btn-objetivo').checked) {
        formTransacao.classList.add('d-none');
        formObjetivo.classList.remove('d-none');
        modalTitulo.textContent = 'Cadastrar Objetivo';
    } else {
        formTransacao.classList.remove('d-none');
        formObjetivo.classList.add('d-none');
        modalTitulo.textContent = document.getElementById('btn-despesa').checked ? 'Cadastrar Despesa' : 'Cadastrar Receita';
    }
}

// Cadastrar nova transação
function cadastrarTransacao(event) {
    event.preventDefault();
    
    // Obter valores do formulário
    const descricao = document.getElementById('descricao').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const categoria = document.getElementById('categoria').value;
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('btn-despesa').checked ? 'despesa' : 'receita';
    
    // Validar formulário
    if (!descricao || isNaN(valor) || !categoria || !data) {
        alert('Por favor, preencha todos os campos.');
        return;
    }
    
    // Gerar ID único para a nova transação
    const novoId = dadosFinanceiros.transacoes.length > 0 ? 
        Math.max(...dadosFinanceiros.transacoes.map(t => t.id)) + 1 : 1;
    
    // Adicionar nova transação
    const novaTransacao = {
        id: novoId,
        data,
        descricao,
        categoria,
        valor,
        tipo
    };
    
    dadosFinanceiros.transacoes.unshift(novaTransacao);
    
    // Atualizar saldo
    if (tipo === 'receita') {
        dadosFinanceiros.receitas += valor;
        dadosFinanceiros.saldoAtual += valor;
    } else {
        dadosFinanceiros.despesas += valor;
        dadosFinanceiros.saldoAtual -= valor;
    }
    
    // Atualizar interface
    atualizarSaldo();
    atualizarTabelaTransacoes();
    
    // Fechar modal e limpar formulário
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-cadastro'));
    modal.hide();
    document.getElementById('form-transacao').reset();
    
    // Definir data atual como padrão
    document.getElementById('data').value = new Date().toISOString().split('T')[0];
}

// Cadastrar novo objetivo
function cadastrarObjetivo(event) {
    event.preventDefault();
    
    // Obter valores do formulário
    const titulo = document.getElementById('objetivo-titulo').value;
    const valorTotal = parseFloat(document.getElementById('objetivo-valor').value);
    const valorAtual = parseFloat(document.getElementById('objetivo-valor-atual').value);
    
    // Validar formulário
    if (!titulo || isNaN(valorTotal) || isNaN(valorAtual)) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (valorAtual > valorTotal) {
        alert('O valor atual não pode ser maior que o valor total.');
        return;
    }
    
    // Adicionar novo objetivo
    const novoObjetivo = {
        titulo,
        valorTotal,
        valorAtual
    };
    
    dadosFinanceiros.objetivos.push(novoObjetivo);
    objetivoAtualIndex = dadosFinanceiros.objetivos.length - 1;
    
    // Atualizar interface
    atualizarObjetivo();
    
    // Fechar modal e limpar formulário
    const modal = bootstrap.Modal.getInstance(document.getElementById('modal-cadastro'));
    modal.hide();
    document.getElementById('form-objetivo').reset();
}

// Verificar e aplicar o modo escuro se estiver ativado
function verificarModoEscuro() {
    // Modo escuro sempre ativado
    window.modoEscuro = true;
    console.log('Modo escuro definido como padrão');
    
    // Aplicar classes para modo escuro
    document.body.classList.add('modo-escuro');
    document.documentElement.classList.add('modo-escuro-html');
    console.log('Classes de modo escuro aplicadas');
}

// Inicializar o aplicativo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando aplicativo...');
    // Primeiro verificar o modo escuro para aplicar o tema correto desde o início
    verificarModoEscuro();
    // Depois configurar os event listeners (incluindo o do botão de modo escuro)
    configurarEventListeners();
    // Inicializar o dashboard e outras funcionalidades
    inicializarDashboard();
    console.log('Aplicativo inicializado com sucesso!');
});
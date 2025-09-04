// Dados de exemplo para a aplicação
let dadosTransacoes = [];
let dadosObjetivos = [];

// Função para inicializar o dashboard
function inicializarDashboard() {
    // Inicializa os componentes personalizados
    initModals();
    initCollapseElements();
    initDropdowns();
    initFormValidation();
    initTooltips();

    // Carrega dados do localStorage
    carregarDados();

    // Atualiza o saldo
    atualizarSaldo();

    // Inicializa os gráficos
    inicializarGraficoObjetivos();
    inicializarGraficoMensal();

    // Preenche a tabela de transações
    preencherTabelaTransacoes();

    // Configura os event listeners (opcional: já será feito no DOMContentLoaded)
    // Deixamos aqui apenas como referência, mas vamos centralizar no DOMContentLoaded
}

// Função para carregar dados do localStorage
function carregarDados() {
    const transacoesStorage = localStorage.getItem('transacoes');
    const objetivosStorage = localStorage.getItem('objetivos');

    if (transacoesStorage) {
        dadosTransacoes = JSON.parse(transacoesStorage);
    } else {
        dadosTransacoes = [
            
        ];
        salvarTransacoes();
    }

    if (objetivosStorage) {
        dadosObjetivos = JSON.parse(objetivosStorage);
    } else {
        // Dados de exemplo para objetivos
        dadosObjetivos = [
            
        ];
        salvarObjetivos();
    }
}

// Função para salvar transações no localStorage
function salvarTransacoes() {
    localStorage.setItem('transacoes', JSON.stringify(dadosTransacoes));
}

// Função para salvar objetivos no localStorage
function salvarObjetivos() {
    localStorage.setItem('objetivos', JSON.stringify(dadosObjetivos));
}

// Função para atualizar o saldo
function atualizarSaldo() {
    const saldoElement = document.getElementById('saldo-valor');
    if (!saldoElement) return;

    const saldo = calcularSaldo();
    saldoElement.textContent = formatarMoeda(saldo);
    saldoElement.className = saldo >= 0 ? 'valor positivo' : 'valor negativo';
}

// Função para calcular o saldo
function calcularSaldo() {
    return dadosTransacoes.reduce((acc, transacao) => {
        if (transacao.tipo === 'receita') {
            return acc + transacao.valor;
        } else {
            return acc - transacao.valor;
        }
    }, 0);
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

// Função para inicializar o gráfico de objetivos
function inicializarGraficoObjetivos() {
    const objetivoAtual = document.getElementById('objetivo-atual');
    if (!objetivoAtual) return;

    // Verifica se há objetivos cadastrados
    if (dadosObjetivos.length === 0) {
        objetivoAtual.innerHTML = '<p class="text-center texto-muted">Nenhum objetivo cadastrado</p>';
        return;
    }

    // Exibe o primeiro objetivo
    exibirObjetivo(0);

    // Configura os botões de navegação
    const btnAnterior = document.getElementById('objetivo-anterior');
    const btnProximo = document.getElementById('objetivo-proximo');

    if (btnAnterior && btnProximo) {
        let indiceAtual = 0;

        btnAnterior.addEventListener('click', () => {
            indiceAtual = (indiceAtual - 1 + dadosObjetivos.length) % dadosObjetivos.length;
            exibirObjetivo(indiceAtual);
        });

        btnProximo.addEventListener('click', () => {
            indiceAtual = (indiceAtual + 1) % dadosObjetivos.length;
            exibirObjetivo(indiceAtual);
        });
    }
}

// Função para exibir um objetivo específico
function exibirObjetivo(indice) {
    const objetivo = dadosObjetivos[indice];

    // Atualiza o título do objetivo
    const objetivoTitulo = document.getElementById('objetivo-titulo');
    if (objetivoTitulo) {
        objetivoTitulo.textContent = objetivo.nome;
    }

    // Atualiza os valores do objetivo
    const objetivoAtualValor = document.getElementById('objetivo-atual');
    const objetivoMetaValor = document.getElementById('objetivo-meta');

    if (objetivoAtualValor) {
        objetivoAtualValor.textContent = formatarMoeda(objetivo.valorAtual);
    }

    if (objetivoMetaValor) {
        objetivoMetaValor.textContent = formatarMoeda(objetivo.valor);
    }

    // Calcula o progresso
    const progresso = (objetivo.valorAtual / objetivo.valor) * 100;

    // Atualiza a barra de progresso
    const progressoFill = document.getElementById('objetivo-progresso-fill');
    if (progressoFill) {
        progressoFill.style.width = `${progresso}%`;
    }

    // Inicializa o gráfico de pizza
    const ctx = document.getElementById('grafico-meta');
    if (ctx) {
        // Destrói o gráfico anterior se existir
        if (window.graficoObjetivo) {
            window.graficoObjetivo.destroy();
        }

        window.graficoObjetivo = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Concluído', 'Restante'],
                datasets: [{
                    data: [objetivo.valorAtual, objetivo.valor - objetivo.valorAtual],
                    backgroundColor: ['#4f46e5', '#2d2d2d'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return formatarMoeda(value);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Função para inicializar o gráfico mensal
function inicializarGraficoMensal() {
    const ctx = document.getElementById('grafico-mensal');
    if (!ctx) return;

    // Agrupa transações por mês
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dadosPorMes = Array(12).fill().map(() => ({ receitas: 0, despesas: 0 }));

    dadosTransacoes.forEach(transacao => {
        const data = new Date(transacao.data);
        const mes = data.getMonth();

        if (transacao.tipo === 'receita') {
            dadosPorMes[mes].receitas += transacao.valor;
        } else {
            dadosPorMes[mes].despesas += transacao.valor;
        }
    });

    // Cria o gráfico
    window.graficoMensal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [
                {
                    label: 'Receitas',
                    data: dadosPorMes.map(mes => mes.receitas),
                    backgroundColor: '#10b981',
                    borderWidth: 0
                },
                {
                    label: 'Despesas',
                    data: dadosPorMes.map(mes => mes.despesas),
                    backgroundColor: '#ef4444',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false,
                        color: '#2d2d2d'
                    },
                    ticks: {
                        color: '#b3b3b3'
                    }
                },
                y: {
                    grid: {
                        color: '#2d2d2d'
                    },
                    ticks: {
                        color: '#b3b3b3',
                        callback: function(value) {
                            return formatarMoeda(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#b3b3b3'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return formatarMoeda(value);
                        }
                    }
                }
            }
        }
    });
}

// Função para preencher a tabela de transações
function preencherTabelaTransacoes() {
    const tabelaBody = document.getElementById('tabela-transacoes');
    if (!tabelaBody) return;

    // Limpa a tabela
    tabelaBody.innerHTML = '';

    // Verifica se há transações
    if (dadosTransacoes.length === 0) {
        tabelaBody.innerHTML = `
            <tr id="sem-transacoes-row">
                <td colspan="5" class="text-center">
                    <p class="texto-muted">Não há transações cadastradas</p>
                </td>
            </tr>
        `;
        return;
    }

    // Ordena as transações por data (mais recentes primeiro)
    const transacoesOrdenadas = [...dadosTransacoes].sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });

    // Limita a 5 transações para o dashboard
    const transacoesRecentes = transacoesOrdenadas.slice(0, 5);

    // Adiciona as transações à tabela
    transacoesRecentes.forEach(transacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td class="${transacao.tipo === 'receita' ? 'tipo-receita' : 'tipo-despesa'}">
                ${formatarMoeda(transacao.valor)}
            </td>
            <td>
                <div class="acoes">
                    <button class="btn btn-sm btn-outline-secondary editar-transacao" data-id="${transacao.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger excluir-transacao" data-id="${transacao.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tabelaBody.appendChild(tr);
    });

    // Adiciona event listeners para os botões de editar e excluir
    document.querySelectorAll('.editar-transacao').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            abrirModalEditarTransacao(id);
        });
    });

    document.querySelectorAll('.excluir-transacao').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            abrirModalConfirmarExclusao(id, 'transacao');
        });
    });
}

// Função para configurar os event listeners (opcional - pode ser removida se usar DOMContentLoaded)
// Mantida apenas por compatibilidade, mas vamos usar o DOMContentLoaded principal
function configurarEventListeners() {
    // Esses eventos agora são gerenciados diretamente no DOMContentLoaded
    console.log('Event listeners configurados via DOMContentLoaded');
}

// Função para alternar a visibilidade do menu flutuante
function toggleMenuFlutuante() {
    const menuFlutuante = document.getElementById('menu-flutuante');
    if (menuFlutuante) {
        menuFlutuante.classList.toggle('hidden');
    }
}

// Função para abrir o modal de adicionar objetivo
function abrirModalAdicionarObjetivo() {
    const objetivoTituloInput = document.getElementById('objetivo-titulo-input');
    const objetivoValor = document.getElementById('objetivo-valor');
    const objetivoValorAtual = document.getElementById('objetivo-valor-atual');
    const objetivoData = document.getElementById('objetivo-data');

    if (objetivoTituloInput) objetivoTituloInput.value = '';
    if (objetivoValor) objetivoValor.value = '';
    if (objetivoValorAtual) objetivoValorAtual.value = '0';
    if (objetivoData) objetivoData.value = new Date().toISOString().split('T')[0];

    const formTransacao = document.getElementById('form-transacao');
    const formObjetivo = document.getElementById('form-objetivo');

    if (formTransacao) formTransacao.classList.add('hidden');
    if (formObjetivo) formObjetivo.classList.remove('hidden');

    const modalTitulo = document.getElementById('modal-titulo');
    if (modalTitulo) modalTitulo.textContent = 'Adicionar Objetivo Financeiro';

    const modalTransacao = document.getElementById('modalTransacao');
    if (modalTransacao) {
        openModal(modalTransacao);
    }
}

// Função para abrir o modal de adicionar transação
function abrirModalAdicionarTransacao(tipo = 'receita') {
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';

    const tipoSelect = document.getElementById('tipo');
    if (tipoSelect) {
        tipoSelect.value = tipo;
    }

    const modalTitulo = document.getElementById('modal-titulo');
    if (modalTitulo) {
        modalTitulo.textContent = tipo === 'receita' ? 'Adicionar Receita' : 'Adicionar Despesa';
    }

    const dataInput = document.getElementById('data');
    if (dataInput) {
        dataInput.value = new Date().toISOString().split('T')[0];
    }

    const categoriaSelect = document.getElementById('categoria');
    if (categoriaSelect) {
        categoriaSelect.value = tipo === 'receita' ? 'Salário' : 'Outros';
    }

    const formTransacao = document.getElementById('form-transacao');
    const formObjetivo = document.getElementById('form-objetivo');

    if (formTransacao) formTransacao.classList.remove('hidden');
    if (formObjetivo) formObjetivo.classList.add('hidden');

    const modalTransacao = document.getElementById('modalTransacao');
    if (modalTransacao) {
        openModal(modalTransacao);
    }
}

// Função para abrir o modal de editar transação
function abrirModalEditarTransacao(id) {
    const transacao = dadosTransacoes.find(t => t.id === id);
    if (!transacao) return;

    document.getElementById('transacao-id').value = transacao.id;
    document.getElementById('transacao-descricao').value = transacao.descricao;
    document.getElementById('transacao-valor').value = transacao.valor;
    document.getElementById('transacao-data').value = transacao.data;
    document.getElementById('transacao-categoria').value = transacao.categoria;

    if (transacao.tipo === 'receita') {
        document.getElementById('transacao-tipo-receita').checked = true;
    } else {
        document.getElementById('transacao-tipo-despesa').checked = true;
    }

    document.getElementById('titulo-modal-transacao').textContent = 'Editar Transação';

    const modal = document.getElementById('modal-transacao');
    modal.classList.add('show');
}

// Função para abrir o modal de confirmar exclusão
function abrirModalConfirmarExclusao(id, tipo) {
    const btnConfirmarExclusao = document.getElementById('confirmar-exclusao');
    btnConfirmarExclusao.setAttribute('data-id', id);
    btnConfirmarExclusao.setAttribute('data-tipo', tipo);

    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.add('show');
}

// Função para salvar uma transação
function salvarTransacao() {
    const id = document.getElementById('transacao-id').value;
    const descricao = document.getElementById('transacao-descricao').value;
    const valor = parseFloat(document.getElementById('transacao-valor').value);
    const data = document.getElementById('transacao-data').value;
    const categoria = document.getElementById('transacao-categoria').value;
    const tipo = document.querySelector('input[name="transacao-tipo"]:checked').value;

    if (!descricao || isNaN(valor) || valor <= 0 || !data || !categoria || !tipo) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const transacao = {
        descricao,
        valor,
        data,
        categoria,
        tipo
    };

    if (id) {
        transacao.id = parseInt(id);
        const index = dadosTransacoes.findIndex(t => t.id === transacao.id);
        if (index !== -1) {
            dadosTransacoes[index] = transacao;
        }
    } else {
        transacao.id = dadosTransacoes.length > 0 ? Math.max(...dadosTransacoes.map(t => t.id)) + 1 : 1;
        dadosTransacoes.push(transacao);
    }

    salvarTransacoes();
    atualizarSaldo();
    inicializarGraficoMensal();
    preencherTabelaTransacoes();

    const modal = document.getElementById('modal-transacao');
    if (modal) modal.classList.remove('show');
}

// Função para excluir uma transação
function excluirTransacao(id) {
    dadosTransacoes = dadosTransacoes.filter(t => t.id !== id);
    salvarTransacoes();
    atualizarSaldo();
    inicializarGraficoMensal();
    preencherTabelaTransacoes();

    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.classList.remove('show');
}

// Função para excluir um objetivo
function excluirObjetivo(id) {
    dadosObjetivos = dadosObjetivos.filter(o => o.id !== id);
    salvarObjetivos();
    inicializarGraficoObjetivos();

    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) modal.classList.remove('show');
}

// Inicializa os modais (placeholder - assumindo que openModal é definido em outro lugar)
function initModals() {
    console.log('Modais inicializados via custom.js');
}

function initCollapseElements() {
    console.log('Elementos colapsáveis inicializados via custom.js');
}

function initDropdowns() {
    console.log('Dropdowns inicializados via custom.js');
}

function initFormValidation() {
    console.log('Validação de formulários inicializada via custom.js');
}

function initTooltips() {
    console.log('Tooltips inicializados via custom.js');
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação inicializando...');
    inicializarDashboard();

    const menuFlutuante = document.getElementById('menu-flutuante');
    const btnAdicionar = document.getElementById('btn-adicionar');

    if (!menuFlutuante || !btnAdicionar) {
        console.error('Elementos essenciais não encontrados:', { menuFlutuante, btnAdicionar });
        return;
    }

    // Garante que o menu começa oculto
    menuFlutuante.classList.add('hidden');

    // Toggle do menu ao clicar no botão flutuante
    btnAdicionar.addEventListener('click', (e) => {
        e.stopPropagation();
        menuFlutuante.classList.toggle('hidden');
    });

    // Botões do menu flutuante
    const btnReceita = document.getElementById('btn-receita');
    const btnDespesa = document.getElementById('btn-despesa');
    const btnObjetivo = document.getElementById('btn-objetivo');

    [btnReceita, btnDespesa, btnObjetivo].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menuFlutuante.classList.add('hidden'); // Fecha o menu
            });
        }
    });

    if (btnReceita) {
        btnReceita.addEventListener('click', () => abrirModalAdicionarTransacao('receita'));
    }

    if (btnDespesa) {
        btnDespesa.addEventListener('click', () => abrirModalAdicionarTransacao('despesa'));
    }

    if (btnObjetivo) {
        btnObjetivo.addEventListener('click', () => abrirModalAdicionarObjetivo());
    }

    // Fecha o menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!menuFlutuante.classList.contains('hidden')) {
            if (!menuFlutuante.contains(e.target) && e.target !== btnAdicionar && !btnAdicionar.contains(e.target)) {
                menuFlutuante.classList.add('hidden');
            }
        }
    });

    // Fecha o menu com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menuFlutuante.classList.contains('hidden')) {
            menuFlutuante.classList.add('hidden');
        }
    });
});
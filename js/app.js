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
    
    // Configura os event listeners
    configurarEventListeners();
}

// Função para carregar dados do localStorage
function carregarDados() {
    const transacoesStorage = localStorage.getItem('transacoes');
    const objetivosStorage = localStorage.getItem('objetivos');
    
    if (transacoesStorage) {
        dadosTransacoes = JSON.parse(transacoesStorage);
    } else {
        // Dados de exemplo para transações
        dadosTransacoes = [
            { id: 1, data: '2023-06-01', descricao: 'Salário', categoria: 'Salário', valor: 3000, tipo: 'receita' },
            { id: 2, data: '2023-06-05', descricao: 'Aluguel', categoria: 'Moradia', valor: 800, tipo: 'despesa' },
            { id: 3, data: '2023-06-10', descricao: 'Supermercado', categoria: 'Alimentação', valor: 350, tipo: 'despesa' },
            { id: 4, data: '2023-06-15', descricao: 'Freelance', categoria: 'Outros', valor: 500, tipo: 'receita' },
            { id: 5, data: '2023-06-20', descricao: 'Conta de Luz', categoria: 'Moradia', valor: 120, tipo: 'despesa' }
        ];
        salvarTransacoes();
    }
    
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
    const objetivoAtual = document.getElementById('objetivo-atual');
    if (!objetivoAtual) return;
    
    // Limpa o conteúdo anterior
    objetivoAtual.innerHTML = '';
    
    // Cria o elemento do objetivo
    const objetivoElement = document.createElement('div');
    objetivoElement.className = 'objetivo-card';
    
    // Calcula o progresso
    const progresso = (objetivo.valorAtual / objetivo.valor) * 100;
    
    // Conteúdo do objetivo
    objetivoElement.innerHTML = `
        <div class="objetivo-header">
            <h3 class="objetivo-titulo">${objetivo.nome}</h3>
            <span class="objetivo-categoria">${objetivo.categoria}</span>
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
    `;
    
    objetivoAtual.appendChild(objetivoElement);
    
    // Inicializa o gráfico de pizza
    const ctx = document.getElementById('grafico-objetivo');
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

// Função para configurar os event listeners
function configurarEventListeners() {
    // Botão flutuante para adicionar transação
    const btnAdicionar = document.getElementById('adicionar-transacao');
    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            abrirModalAdicionarTransacao();
        });
    }
    
    // Formulário de transação
    const formTransacao = document.getElementById('form-transacao');
    if (formTransacao) {
        formTransacao.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarTransacao();
        });
    }
    
    // Botão para salvar transação
    const btnSalvarTransacao = document.getElementById('salvar-transacao');
    if (btnSalvarTransacao) {
        btnSalvarTransacao.addEventListener('click', () => {
            salvarTransacao();
        });
    }
    
    // Botão para confirmar exclusão
    const btnConfirmarExclusao = document.getElementById('confirmar-exclusao');
    if (btnConfirmarExclusao) {
        btnConfirmarExclusao.addEventListener('click', () => {
            const id = parseInt(btnConfirmarExclusao.getAttribute('data-id'));
            const tipo = btnConfirmarExclusao.getAttribute('data-tipo');
            
            if (tipo === 'transacao') {
                excluirTransacao(id);
            } else if (tipo === 'objetivo') {
                excluirObjetivo(id);
            }
        });
    }
}

// Função para abrir o modal de adicionar transação
function abrirModalAdicionarTransacao() {
    // Limpa o formulário
    document.getElementById('transacao-id').value = '';
    document.getElementById('transacao-descricao').value = '';
    document.getElementById('transacao-valor').value = '';
    document.getElementById('transacao-data').value = new Date().toISOString().split('T')[0];
    document.getElementById('transacao-categoria').value = 'Outros';
    document.getElementById('transacao-tipo-receita').checked = true;
    
    // Atualiza o título do modal
    document.getElementById('titulo-modal-transacao').textContent = 'Nova Transação';
    
    // Abre o modal
    const modal = document.getElementById('modal-transacao');
    modal.classList.add('show');
}

// Função para abrir o modal de editar transação
function abrirModalEditarTransacao(id) {
    // Busca a transação pelo ID
    const transacao = dadosTransacoes.find(t => t.id === id);
    if (!transacao) return;
    
    // Preenche o formulário
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
    
    // Atualiza o título do modal
    document.getElementById('titulo-modal-transacao').textContent = 'Editar Transação';
    
    // Abre o modal
    const modal = document.getElementById('modal-transacao');
    modal.classList.add('show');
}

// Função para abrir o modal de confirmar exclusão
function abrirModalConfirmarExclusao(id, tipo) {
    // Configura o botão de confirmação
    const btnConfirmarExclusao = document.getElementById('confirmar-exclusao');
    btnConfirmarExclusao.setAttribute('data-id', id);
    btnConfirmarExclusao.setAttribute('data-tipo', tipo);
    
    // Abre o modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.add('show');
}

// Função para salvar uma transação
function salvarTransacao() {
    // Obtém os valores do formulário
    const id = document.getElementById('transacao-id').value;
    const descricao = document.getElementById('transacao-descricao').value;
    const valor = parseFloat(document.getElementById('transacao-valor').value);
    const data = document.getElementById('transacao-data').value;
    const categoria = document.getElementById('transacao-categoria').value;
    const tipo = document.querySelector('input[name="transacao-tipo"]:checked').value;
    
    // Valida os campos
    if (!descricao || isNaN(valor) || valor <= 0 || !data || !categoria || !tipo) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    // Cria o objeto da transação
    const transacao = {
        descricao,
        valor,
        data,
        categoria,
        tipo
    };
    
    // Verifica se é uma edição ou uma nova transação
    if (id) {
        // Edição
        transacao.id = parseInt(id);
        const index = dadosTransacoes.findIndex(t => t.id === transacao.id);
        if (index !== -1) {
            dadosTransacoes[index] = transacao;
        }
    } else {
        // Nova transação
        transacao.id = dadosTransacoes.length > 0 ? Math.max(...dadosTransacoes.map(t => t.id)) + 1 : 1;
        dadosTransacoes.push(transacao);
    }
    
    // Salva as transações
    salvarTransacoes();
    
    // Atualiza a interface
    atualizarSaldo();
    inicializarGraficoMensal();
    preencherTabelaTransacoes();
    
    // Fecha o modal
    const modal = document.getElementById('modal-transacao');
    modal.classList.remove('show');
}

// Função para excluir uma transação
function excluirTransacao(id) {
    // Remove a transação do array
    dadosTransacoes = dadosTransacoes.filter(t => t.id !== id);
    
    // Salva as transações
    salvarTransacoes();
    
    // Atualiza a interface
    atualizarSaldo();
    inicializarGraficoMensal();
    preencherTabelaTransacoes();
    
    // Fecha o modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.remove('show');
}

// Função para excluir um objetivo
function excluirObjetivo(id) {
    // Remove o objetivo do array
    dadosObjetivos = dadosObjetivos.filter(o => o.id !== id);
    
    // Salva os objetivos
    salvarObjetivos();
    
    // Atualiza a interface
    inicializarGraficoObjetivos();
    
    // Fecha o modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    modal.classList.remove('show');
}

// Inicializa os modais
function initModals() {
    // Implementação dos modais personalizados
    document.querySelectorAll('[data-toggle="modal"], [data-bs-toggle="modal"]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const target = trigger.getAttribute('data-target') || trigger.getAttribute('data-bs-target');
            const modal = document.querySelector(target);
            if (modal) {
                modal.classList.add('show');
            }
        });
    });

    document.querySelectorAll('[data-dismiss="modal"], [data-bs-dismiss="modal"]').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Fechar modal ao clicar fora dele
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// Inicializa elementos colapsáveis
function initCollapseElements() {
    document.querySelectorAll('[data-toggle="collapse"], [data-bs-toggle="collapse"]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const target = trigger.getAttribute('data-target') || trigger.getAttribute('data-bs-target');
            const element = document.querySelector(target);
            if (element) {
                if (element.style.display === 'none' || !element.style.display) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });
    });
}

// Inicializa dropdowns
function initDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.nextElementSibling;
            if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                dropdown.classList.toggle('show');
            }
        });
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown-toggle')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
}

// Inicializa validação de formulários
function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Destaca campos inválidos
                form.querySelectorAll(':invalid').forEach(field => {
                    field.classList.add('is-invalid');
                    
                    field.addEventListener('input', () => {
                        if (field.checkValidity()) {
                            field.classList.remove('is-invalid');
                        }
                    });
                });
            }
            
            form.classList.add('was-validated');
        });
    });
}

// Inicializa tooltips
function initTooltips() {
    document.querySelectorAll('[data-toggle="tooltip"]').forEach(element => {
        element.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.getAttribute('title') || element.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltip);
            
            const rect = element.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.opacity = '1';
            
            element.addEventListener('mouseleave', () => {
                document.body.removeChild(tooltip);
            }, { once: true });
        });
    });
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarDashboard);
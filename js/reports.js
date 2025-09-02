// Função para inicializar a página de relatórios
function inicializarRelatorios() {
    // Inicializa os componentes personalizados
    initModals();
    initCollapseElements();
    initDropdowns();
    initFormValidation();
    initTooltips();
    
    // Carrega dados do localStorage
    carregarDados();
    
    // Inicializa os gráficos
    inicializarGraficoCategorias();
    inicializarGraficoEvolucao('mensal');
    
    // Atualiza o resumo
    atualizarResumo();
    
    // Preenche a tabela de transações
    preencherTabelaTransacoes();
    
    // Configura os event listeners
    configurarEventListeners();
}

// Função para carregar dados do localStorage
function carregarDados() {
    const transacoesStorage = localStorage.getItem('transacoes');
    
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
}

// Função para salvar transações no localStorage
function salvarTransacoes() {
    localStorage.setItem('transacoes', JSON.stringify(dadosTransacoes));
}

// Função para inicializar o gráfico de categorias
function inicializarGraficoCategorias() {
    const ctx = document.getElementById('grafico-categorias');
    if (!ctx) return;
    
    // Filtra apenas as despesas
    const despesas = dadosTransacoes.filter(t => t.tipo === 'despesa');
    
    // Agrupa por categoria
    const categorias = {};
    despesas.forEach(despesa => {
        if (!categorias[despesa.categoria]) {
            categorias[despesa.categoria] = 0;
        }
        categorias[despesa.categoria] += despesa.valor;
    });
    
    // Prepara os dados para o gráfico
    const labels = Object.keys(categorias);
    const dados = Object.values(categorias);
    
    // Cores para as categorias
    const cores = [
        '#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#3b82f6',
        '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1'
    ];
    
    // Cria o gráfico
    window.graficoCategorias = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: dados,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#b3b3b3',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatarMoeda(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Função para inicializar o gráfico de evolução
function inicializarGraficoEvolucao(tipoVisualizacao) {
    const ctx = document.getElementById('grafico-evolucao');
    if (!ctx) return;
    
    // Destrói o gráfico anterior se existir
    if (window.graficoEvolucao) {
        window.graficoEvolucao.destroy();
    }
    
    let labels, dadosReceitas, dadosDespesas, dadosSaldo;
    
    // Prepara os dados de acordo com o tipo de visualização
    if (tipoVisualizacao === 'mensal') {
        const resultado = prepararDadosMensais();
        labels = resultado.labels;
        dadosReceitas = resultado.receitas;
        dadosDespesas = resultado.despesas;
        dadosSaldo = resultado.saldo;
    } else if (tipoVisualizacao === 'semanal') {
        const resultado = prepararDadosSemanais();
        labels = resultado.labels;
        dadosReceitas = resultado.receitas;
        dadosDespesas = resultado.despesas;
        dadosSaldo = resultado.saldo;
    } else { // diário
        const resultado = prepararDadosDiarios();
        labels = resultado.labels;
        dadosReceitas = resultado.receitas;
        dadosDespesas = resultado.despesas;
        dadosSaldo = resultado.saldo;
    }
    
    // Cria o gráfico
    window.graficoEvolucao = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: dadosReceitas,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Despesas',
                    data: dadosDespesas,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                },
                {
                    label: 'Saldo',
                    data: dadosSaldo,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
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
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return `${label}: ${formatarMoeda(value)}`;
                        }
                    }
                }
            }
        }
    });
}

// Função para preparar dados mensais
function prepararDadosMensais() {
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
    
    const receitas = dadosPorMes.map(mes => mes.receitas);
    const despesas = dadosPorMes.map(mes => mes.despesas);
    const saldo = dadosPorMes.map(mes => mes.receitas - mes.despesas);
    
    return {
        labels: meses,
        receitas,
        despesas,
        saldo
    };
}

// Função para preparar dados semanais
function prepararDadosSemanais() {
    // Obtém a data atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    // Calcula o número de semanas no mês atual
    const numSemanas = Math.ceil((fimMes.getDate() - inicioMes.getDate() + 1) / 7);
    
    // Prepara os arrays para os dados
    const labels = Array(numSemanas).fill().map((_, i) => `Semana ${i + 1}`);
    const dadosPorSemana = Array(numSemanas).fill().map(() => ({ receitas: 0, despesas: 0 }));
    
    // Filtra as transações do mês atual
    const transacoesMesAtual = dadosTransacoes.filter(t => {
        const data = new Date(t.data);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    });
    
    // Agrupa as transações por semana
    transacoesMesAtual.forEach(transacao => {
        const data = new Date(transacao.data);
        const dia = data.getDate();
        const semana = Math.floor((dia - 1) / 7);
        
        if (transacao.tipo === 'receita') {
            dadosPorSemana[semana].receitas += transacao.valor;
        } else {
            dadosPorSemana[semana].despesas += transacao.valor;
        }
    });
    
    const receitas = dadosPorSemana.map(semana => semana.receitas);
    const despesas = dadosPorSemana.map(semana => semana.despesas);
    const saldo = dadosPorSemana.map(semana => semana.receitas - semana.despesas);
    
    return {
        labels,
        receitas,
        despesas,
        saldo
    };
}

// Função para preparar dados diários
function prepararDadosDiarios() {
    // Obtém a data atual
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const numDias = fimMes.getDate();
    
    // Prepara os arrays para os dados
    const labels = Array(numDias).fill().map((_, i) => `${i + 1}`);
    const dadosPorDia = Array(numDias).fill().map(() => ({ receitas: 0, despesas: 0 }));
    
    // Filtra as transações do mês atual
    const transacoesMesAtual = dadosTransacoes.filter(t => {
        const data = new Date(t.data);
        return data.getMonth() === hoje.getMonth() && data.getFullYear() === hoje.getFullYear();
    });
    
    // Agrupa as transações por dia
    transacoesMesAtual.forEach(transacao => {
        const data = new Date(transacao.data);
        const dia = data.getDate() - 1; // Índice 0-based
        
        if (transacao.tipo === 'receita') {
            dadosPorDia[dia].receitas += transacao.valor;
        } else {
            dadosPorDia[dia].despesas += transacao.valor;
        }
    });
    
    const receitas = dadosPorDia.map(dia => dia.receitas);
    const despesas = dadosPorDia.map(dia => dia.despesas);
    const saldo = dadosPorDia.map(dia => dia.receitas - dia.despesas);
    
    return {
        labels,
        receitas,
        despesas,
        saldo
    };
}

// Função para atualizar o resumo
function atualizarResumo() {
    // Calcula os totais
    const totalReceitas = dadosTransacoes
        .filter(t => t.tipo === 'receita')
        .reduce((acc, t) => acc + t.valor, 0);
    
    const totalDespesas = dadosTransacoes
        .filter(t => t.tipo === 'despesa')
        .reduce((acc, t) => acc + t.valor, 0);
    
    const saldo = totalReceitas - totalDespesas;
    
    // Atualiza os elementos na interface
    document.getElementById('resumo-receitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('resumo-despesas').textContent = formatarMoeda(totalDespesas);
    
    const saldoElement = document.getElementById('resumo-saldo');
    saldoElement.textContent = formatarMoeda(saldo);
    saldoElement.className = saldo >= 0 ? 'valor positivo' : 'valor negativo';
}

// Função para preencher a tabela de transações
function preencherTabelaTransacoes() {
    const tabelaBody = document.getElementById('tabela-transacoes-relatorio');
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
    
    // Obtém os filtros
    const periodo = document.getElementById('periodo').value;
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    const categoria = document.getElementById('categoria-filtro').value;
    const tipo = document.getElementById('tipo-filtro').value;
    
    // Filtra as transações
    let transacoesFiltradas = [...dadosTransacoes];
    
    // Filtra por período
    if (periodo !== 'personalizado') {
        const hoje = new Date();
        let dataInicioFiltro, dataFimFiltro;
        
        switch (periodo) {
            case 'mes-atual':
                dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                dataFimFiltro = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                break;
            case 'mes-anterior':
                dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
                dataFimFiltro = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
                break;
            case 'ultimos-3-meses':
                dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
                dataFimFiltro = hoje;
                break;
            case 'ultimos-6-meses':
                dataInicioFiltro = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
                dataFimFiltro = hoje;
                break;
            case 'ano-atual':
                dataInicioFiltro = new Date(hoje.getFullYear(), 0, 1);
                dataFimFiltro = new Date(hoje.getFullYear(), 11, 31);
                break;
        }
        
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const dataTransacao = new Date(t.data);
            return dataTransacao >= dataInicioFiltro && dataTransacao <= dataFimFiltro;
        });
    } else if (dataInicio && dataFim) {
        // Filtra por datas personalizadas
        const dataInicioObj = new Date(dataInicio);
        const dataFimObj = new Date(dataFim);
        
        transacoesFiltradas = transacoesFiltradas.filter(t => {
            const dataTransacao = new Date(t.data);
            return dataTransacao >= dataInicioObj && dataTransacao <= dataFimObj;
        });
    }
    
    // Filtra por categoria
    if (categoria) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.categoria === categoria);
    }
    
    // Filtra por tipo
    if (tipo) {
        transacoesFiltradas = transacoesFiltradas.filter(t => t.tipo === tipo);
    }
    
    // Ordena as transações por data (mais recentes primeiro)
    transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Verifica se há transações após a filtragem
    if (transacoesFiltradas.length === 0) {
        tabelaBody.innerHTML = `
            <tr id="sem-transacoes-row">
                <td colspan="5" class="text-center">
                    <p class="texto-muted">Não há transações no período selecionado</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Adiciona as transações à tabela
    transacoesFiltradas.forEach(transacao => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td class="${transacao.tipo === 'receita' ? 'tipo-receita' : 'tipo-despesa'}">
                ${formatarMoeda(transacao.valor)}
            </td>
            <td>${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}</td>
        `;
        tabelaBody.appendChild(tr);
    });
}

// Função para configurar os event listeners
function configurarEventListeners() {
    // Filtro de período
    const selectPeriodo = document.getElementById('periodo');
    if (selectPeriodo) {
        selectPeriodo.addEventListener('change', () => {
            const datasPersonalizadas = document.getElementById('datas-personalizadas');
            if (selectPeriodo.value === 'personalizado') {
                datasPersonalizadas.style.display = 'flex';
            } else {
                datasPersonalizadas.style.display = 'none';
            }
        });
    }
    
    // Botão de aplicar filtros
    const btnAplicarFiltros = document.getElementById('aplicar-filtros');
    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener('click', () => {
            preencherTabelaTransacoes();
        });
    }
    
    // Botão de limpar filtros
    const btnLimparFiltros = document.getElementById('limpar-filtros');
    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener('click', () => {
            document.getElementById('periodo').value = 'mes-atual';
            document.getElementById('data-inicio').value = '';
            document.getElementById('data-fim').value = '';
            document.getElementById('categoria-filtro').value = '';
            document.getElementById('tipo-filtro').value = '';
            document.getElementById('datas-personalizadas').style.display = 'none';
            preencherTabelaTransacoes();
        });
    }
    
    // Campo de busca
    const campoBusca = document.getElementById('buscar-transacao');
    if (campoBusca) {
        campoBusca.addEventListener('input', () => {
            const termo = campoBusca.value.toLowerCase();
            const linhas = document.querySelectorAll('#tabela-transacoes-relatorio tr:not(#sem-transacoes-row)');
            
            linhas.forEach(linha => {
                const texto = linha.textContent.toLowerCase();
                if (texto.includes(termo)) {
                    linha.style.display = '';
                } else {
                    linha.style.display = 'none';
                }
            });
        });
    }
    
    // Botões de visualização do gráfico
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove a classe active de todos os botões
            document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
            // Adiciona a classe active ao botão clicado
            btn.classList.add('active');
            
            // Atualiza o gráfico
            const tipoVisualizacao = btn.getAttribute('data-view');
            inicializarGraficoEvolucao(tipoVisualizacao);
        });
    });
    
    // Botões de exportação
    document.getElementById('exportar-pdf')?.addEventListener('click', exportarPDF);
    document.getElementById('exportar-excel')?.addEventListener('click', exportarExcel);
    document.getElementById('exportar-csv')?.addEventListener('click', exportarCSV);
}

// Função para exportar para PDF
function exportarPDF() {
    alert('Funcionalidade de exportação para PDF será implementada em breve!');
}

// Função para exportar para Excel
function exportarExcel() {
    alert('Funcionalidade de exportação para Excel será implementada em breve!');
}

// Função para exportar para CSV
function exportarCSV() {
    // Obtém os dados da tabela
    const linhas = document.querySelectorAll('#tabela-transacoes-relatorio tr:not(#sem-transacoes-row)');
    if (linhas.length === 0) {
        alert('Não há dados para exportar!');
        return;
    }
    
    // Cabeçalho do CSV
    let csv = 'Data,Descrição,Categoria,Valor,Tipo\n';
    
    // Adiciona cada linha da tabela
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll('td');
        if (colunas.length === 5) {
            const data = colunas[0].textContent;
            const descricao = colunas[1].textContent;
            const categoria = colunas[2].textContent;
            const valor = colunas[3].textContent.replace('R$', '').trim();
            const tipo = colunas[4].textContent;
            
            // Escapa as vírgulas nos campos de texto
            const linha = `"${data}","${descricao}","${categoria}","${valor}","${tipo}"`;
            csv += linha + '\n';
        }
    });
    
    // Cria um blob e um link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'transacoes.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
document.addEventListener('DOMContentLoaded', inicializarRelatorios);
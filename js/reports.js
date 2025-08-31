// Inicialização da página de relatórios
document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaRelatorios();
    configurarEventListeners();
});

// Função para inicializar a página de relatórios
function inicializarPaginaRelatorios() {
    configurarPeriodoPersonalizado();
    aplicarFiltros(); // Carrega os dados iniciais
}



// Configurar event listeners da página
function configurarEventListeners() {
    // O botão de modo escuro foi removido, pois o modo escuro agora é padrão
    
    // Filtros
    document.getElementById('periodo').addEventListener('change', configurarPeriodoPersonalizado);
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('limpar-filtros').addEventListener('click', limparFiltros);
    
    // Busca de transações
    document.getElementById('buscar-transacao').addEventListener('input', filtrarTransacoes);
    
    // Alternar visualização do gráfico de evolução
    document.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-view]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            atualizarGraficoEvolucao(this.getAttribute('data-view'));
        });
    });
    
    // Exportação
    document.getElementById('exportar-pdf').addEventListener('click', exportarPDF);
    document.getElementById('exportar-excel').addEventListener('click', exportarExcel);
    document.getElementById('exportar-csv').addEventListener('click', exportarCSV);
}

// Mostrar/ocultar campos de data personalizada
function configurarPeriodoPersonalizado() {
    const periodo = document.getElementById('periodo').value;
    const datasPersonalizadas = document.getElementById('datas-personalizadas');
    
    if (periodo === 'personalizado') {
        datasPersonalizadas.style.display = 'block';
    } else {
        datasPersonalizadas.style.display = 'none';
    }
}

// Limpar todos os filtros
function limparFiltros() {
    document.getElementById('periodo').value = 'mes-atual';
    document.getElementById('tipo-transacao').value = 'todos';
    document.getElementById('categoria').value = 'todas';
    document.getElementById('agrupar-por').value = 'mes';
    document.getElementById('tipo-grafico').value = 'barras';
    document.getElementById('data-inicio').value = '';
    document.getElementById('data-fim').value = '';
    document.getElementById('datas-personalizadas').style.display = 'none';
    
    aplicarFiltros();
}

// Aplicar filtros e atualizar relatórios
function aplicarFiltros() {
    const filtros = obterFiltros();
    const transacoesFiltradas = filtrarDados(filtros);
    
    atualizarResumoFinanceiro(transacoesFiltradas);
    atualizarIndicadores(transacoesFiltradas, filtros);
    atualizarGraficoEvolucao('receitas-despesas', transacoesFiltradas, filtros);
    atualizarGraficoCategorias(transacoesFiltradas, filtros);
    atualizarTabelaTransacoes(transacoesFiltradas);
}

// Obter valores dos filtros
function obterFiltros() {
    const periodo = document.getElementById('periodo').value;
    let dataInicio, dataFim;
    
    // Definir datas com base no período selecionado
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    switch (periodo) {
        case 'mes-atual':
            dataInicio = primeiroDiaMes;
            dataFim = ultimoDiaMes;
            break;
        case 'mes-anterior':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
            break;
        case 'trimestre':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, hoje.getDate());
            dataFim = hoje;
            break;
        case 'semestre':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, hoje.getDate());
            dataFim = hoje;
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
            dataFim = hoje;
            break;
        case 'personalizado':
            const dataInicioInput = document.getElementById('data-inicio').value;
            const dataFimInput = document.getElementById('data-fim').value;
            
            if (dataInicioInput) {
                dataInicio = new Date(dataInicioInput);
            } else {
                dataInicio = new Date(hoje.getFullYear() - 1, hoje.getMonth(), hoje.getDate());
            }
            
            if (dataFimInput) {
                dataFim = new Date(dataFimInput);
            } else {
                dataFim = hoje;
            }
            break;
    }
    
    return {
        dataInicio: dataInicio,
        dataFim: dataFim,
        tipo: document.getElementById('tipo-transacao').value,
        categoria: document.getElementById('categoria').value,
        agruparPor: document.getElementById('agrupar-por').value,
        tipoGrafico: document.getElementById('tipo-grafico').value
    };
}

// Filtrar dados com base nos filtros
function filtrarDados(filtros) {
    return dadosFinanceiros.transacoes.filter(transacao => {
        const dataTransacao = new Date(transacao.data);
        
        // Filtro de período
        if (dataTransacao < filtros.dataInicio || dataTransacao > filtros.dataFim) {
            return false;
        }
        
        // Filtro de tipo
        if (filtros.tipo !== 'todos' && transacao.tipo !== filtros.tipo) {
            return false;
        }
        
        // Filtro de categoria
        if (filtros.categoria !== 'todas' && transacao.categoria !== filtros.categoria) {
            return false;
        }
        
        return true;
    });
}

// Atualizar resumo financeiro
function atualizarResumoFinanceiro(transacoes) {
    let totalReceitas = 0;
    let totalDespesas = 0;
    
    transacoes.forEach(transacao => {
        if (transacao.tipo === 'receita') {
            totalReceitas += transacao.valor;
        } else if (transacao.tipo === 'despesa') {
            totalDespesas += transacao.valor;
        }
    });
    
    const saldo = totalReceitas - totalDespesas;
    
    document.getElementById('resumo-receitas').textContent = formatarMoeda(totalReceitas);
    document.getElementById('resumo-despesas').textContent = formatarMoeda(totalDespesas);
    document.getElementById('resumo-saldo').textContent = formatarMoeda(saldo);
    document.getElementById('resumo-saldo').className = saldo >= 0 ? 'value-positive' : 'value-negative';
}

// Atualizar indicadores financeiros
function atualizarIndicadores(transacoes, filtros) {
    // Taxa de economia
    let totalReceitas = 0;
    let totalDespesas = 0;
    let maiorDespesa = { valor: 0, categoria: 'N/A' };
    
    transacoes.forEach(transacao => {
        if (transacao.tipo === 'receita') {
            totalReceitas += transacao.valor;
        } else if (transacao.tipo === 'despesa') {
            totalDespesas += transacao.valor;
            
            // Verificar se é a maior despesa
            if (transacao.valor > maiorDespesa.valor) {
                maiorDespesa = { valor: transacao.valor, categoria: transacao.categoria };
            }
        }
    });
    
    // Taxa de economia
    let taxaEconomia = 0;
    if (totalReceitas > 0) {
        taxaEconomia = ((totalReceitas - totalDespesas) / totalReceitas) * 100;
    }
    
    // Média diária de gastos
    const diasPeriodo = Math.ceil((filtros.dataFim - filtros.dataInicio) / (1000 * 60 * 60 * 24)) || 1;
    const mediaDiaria = totalDespesas / diasPeriodo;
    
    // Atualizar elementos
    document.getElementById('taxa-economia').textContent = taxaEconomia.toFixed(1) + '%';
    document.getElementById('maior-despesa-valor').textContent = formatarMoeda(maiorDespesa.valor);
    document.getElementById('maior-despesa-categoria').textContent = maiorDespesa.categoria.charAt(0).toUpperCase() + maiorDespesa.categoria.slice(1);
    document.getElementById('media-diaria').textContent = formatarMoeda(mediaDiaria);
}

// Atualizar gráfico de evolução
function atualizarGraficoEvolucao(tipoVisualizacao = 'receitas-despesas', transacoes = null, filtros = null) {
    if (!transacoes) {
        transacoes = filtrarDados(obterFiltros());
    }
    
    if (!filtros) {
        filtros = obterFiltros();
    }
    
    const ctx = document.getElementById('grafico-evolucao').getContext('2d');
    const semDados = document.getElementById('sem-dados-evolucao');
    
    // Verificar se há dados
    if (transacoes.length === 0) {
        semDados.style.display = 'block';
        return;
    } else {
        semDados.style.display = 'none';
    }
    
    // Agrupar dados por período
    const dadosAgrupados = agruparTransacoesPorPeriodo(transacoes, filtros.agruparPor);
    
    // Preparar dados para o gráfico
    const labels = Object.keys(dadosAgrupados);
    const datasetsConfig = [];
    
    // Definir cores baseadas no modo atual (claro/escuro)
    const receitaColor = modoEscuro ? 'rgba(76, 175, 80, 0.7)' : '#28a745';
    const despesaColor = modoEscuro ? 'rgba(244, 67, 54, 0.7)' : '#dc3545';
    const saldoColor = modoEscuro ? 'rgba(66, 133, 244, 0.7)' : '#007bff';
    const gridColor = modoEscuro ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = modoEscuro ? '#adb5bd' : '#666';
    
    if (tipoVisualizacao === 'receitas-despesas') {
        // Dados de receitas e despesas
        const receitasData = labels.map(label => dadosAgrupados[label].receitas);
        const despesasData = labels.map(label => dadosAgrupados[label].despesas);
        
        datasetsConfig.push({
            label: 'Receitas',
            data: receitasData,
            backgroundColor: receitaColor,
            borderColor: receitaColor,
            borderWidth: filtros.tipoGrafico === 'linhas' ? 2 : 0,
            fill: filtros.tipoGrafico === 'area'
        });
        
        datasetsConfig.push({
            label: 'Despesas',
            data: despesasData,
            backgroundColor: despesaColor,
            borderColor: despesaColor,
            borderWidth: filtros.tipoGrafico === 'linhas' ? 2 : 0,
            fill: filtros.tipoGrafico === 'area'
        });
    } else {
        // Dados de saldo
        const saldoData = labels.map(label => dadosAgrupados[label].receitas - dadosAgrupados[label].despesas);
        
        datasetsConfig.push({
            label: 'Saldo',
            data: saldoData,
            backgroundColor: saldoColor,
            borderColor: saldoColor,
            borderWidth: filtros.tipoGrafico === 'linhas' ? 2 : 0,
            fill: filtros.tipoGrafico === 'area'
        });
    }
    
    // Destruir gráfico anterior se existir
    if (window.chartEvolucao) {
        window.chartEvolucao.destroy();
    }
    
    // Criar novo gráfico
    let tipoChart = 'bar';
    if (filtros.tipoGrafico === 'linhas') tipoChart = 'line';
    if (filtros.tipoGrafico === 'pizza') tipoChart = 'pie';
    if (filtros.tipoGrafico === 'area') tipoChart = 'line';
    
    window.chartEvolucao = new Chart(ctx, {
        type: tipoChart,
        data: {
            labels: labels,
            datasets: datasetsConfig
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: tipoChart !== 'pie' ? {
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
            } : {},
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

// Atualizar gráfico de categorias
function atualizarGraficoCategorias(transacoes = null, filtros = null) {
    if (!transacoes) {
        transacoes = filtrarDados(obterFiltros());
    }
    
    if (!filtros) {
        filtros = obterFiltros();
    }
    
    const ctx = document.getElementById('grafico-categorias').getContext('2d');
    const semDados = document.getElementById('sem-dados-categorias');
    
    // Filtrar apenas despesas para o gráfico de categorias
    const despesas = transacoes.filter(t => t.tipo === 'despesa');
    
    // Verificar se há dados
    if (despesas.length === 0) {
        semDados.style.display = 'block';
        return;
    } else {
        semDados.style.display = 'none';
    }
    
    // Agrupar despesas por categoria
    const categorias = {};
    despesas.forEach(despesa => {
        if (!categorias[despesa.categoria]) {
            categorias[despesa.categoria] = 0;
        }
        categorias[despesa.categoria] += despesa.valor;
    });
    
    // Preparar dados para o gráfico
    const labels = Object.keys(categorias);
    const data = labels.map(label => categorias[label]);
    
    // Gerar cores para cada categoria
    const cores = gerarCoresCategorias(labels.length);
    
    // Destruir gráfico anterior se existir
    if (window.chartCategorias) {
        window.chartCategorias.destroy();
    }
    
    // Criar novo gráfico
    window.chartCategorias = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: cores,
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
                        color: modoEscuro ? '#adb5bd' : '#666'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = formatarMoeda(context.raw);
                            const porcentagem = ((context.raw / data.reduce((a, b) => a + b, 0)) * 100).toFixed(1) + '%';
                            return `${context.label}: ${valor} (${porcentagem})`;
                        }
                    }
                }
            }
        }
    });
}

// Atualizar tabela de transações
function atualizarTabelaTransacoes(transacoes = null) {
    if (!transacoes) {
        transacoes = filtrarDados(obterFiltros());
    }
    
    const tabela = document.getElementById('tabela-transacoes-relatorio');
    const semTransacoesRow = document.getElementById('sem-transacoes-row');
    
    // Limpar tabela mantendo apenas a linha de "sem transações"
    Array.from(tabela.children).forEach(child => {
        if (child.id !== 'sem-transacoes-row') {
            child.remove();
        }
    });
    
    // Verificar se há transações
    if (transacoes.length === 0) {
        semTransacoesRow.style.display = 'table-row';
        return;
    }
    
    // Ocultar mensagem de "sem transações"
    semTransacoesRow.style.display = 'none';
    
    // Ordenar transações por data (mais recentes primeiro)
    transacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Adicionar cada transação à tabela
    transacoes.forEach(transacao => {
        const tr = document.createElement('tr');
        tr.className = `transaction-item ${transacao.tipo}`;
        tr.innerHTML = `
            <td>${formatarData(transacao.data)}</td>
            <td>${transacao.descricao}</td>
            <td>
                <span class="badge bg-${getCategoryColor(transacao.categoria)}">
                    ${transacao.categoria.charAt(0).toUpperCase() + transacao.categoria.slice(1)}
                </span>
            </td>
            <td class="${transacao.tipo === 'receita' ? 'value-positive' : 'value-negative'}">
                ${formatarMoeda(transacao.valor)}
            </td>
            <td>
                <span class="badge ${transacao.tipo === 'receita' ? 'bg-success' : 'bg-danger'}">
                    ${transacao.tipo === 'receita' ? 'Receita' : 'Despesa'}
                </span>
            </td>
        `;
        
        tabela.appendChild(tr);
    });
}

// Filtrar transações na tabela
function filtrarTransacoes() {
    const termo = document.getElementById('buscar-transacao').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabela-transacoes-relatorio tr:not(#sem-transacoes-row)');
    
    linhas.forEach(linha => {
        const descricao = linha.cells[1].textContent.toLowerCase();
        const categoria = linha.cells[2].textContent.toLowerCase();
        
        if (descricao.includes(termo) || categoria.includes(termo)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Agrupar transações por período
function agruparTransacoesPorPeriodo(transacoes, agruparPor) {
    const agrupados = {};
    
    transacoes.forEach(transacao => {
        const data = new Date(transacao.data);
        let chave;
        
        switch (agruparPor) {
            case 'dia':
                chave = formatarData(transacao.data);
                break;
            case 'semana':
                // Obter o primeiro dia da semana (domingo)
                const primeiroDiaSemana = new Date(data);
                primeiroDiaSemana.setDate(data.getDate() - data.getDay());
                chave = `Semana ${formatarData(primeiroDiaSemana)}`;
                break;
            case 'mes':
                chave = `${data.toLocaleString('pt-BR', { month: 'short' })} ${data.getFullYear()}`;
                break;
            case 'categoria':
                chave = transacao.categoria.charAt(0).toUpperCase() + transacao.categoria.slice(1);
                break;
        }
        
        if (!agrupados[chave]) {
            agrupados[chave] = { receitas: 0, despesas: 0 };
        }
        
        if (transacao.tipo === 'receita') {
            agrupados[chave].receitas += transacao.valor;
        } else if (transacao.tipo === 'despesa') {
            agrupados[chave].despesas += transacao.valor;
        }
    });
    
    return agrupados;
}

// Gerar cores para categorias
function gerarCoresCategorias(quantidade) {
    const coresPadrao = modoEscuro ? [
        'rgba(76, 175, 80, 0.8)',
        'rgba(244, 67, 54, 0.8)',
        'rgba(66, 133, 244, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 87, 34, 0.8)',
        'rgba(0, 188, 212, 0.8)',
        'rgba(121, 85, 72, 0.8)'
    ] : [
        '#28a745',
        '#dc3545',
        '#007bff',
        '#ffc107',
        '#6f42c1',
        '#fd7e14',
        '#17a2b8',
        '#795548'
    ];
    
    // Se precisar de mais cores do que as padrão, gerar aleatoriamente
    if (quantidade > coresPadrao.length) {
        const cores = [...coresPadrao];
        for (let i = coresPadrao.length; i < quantidade; i++) {
            const r = Math.floor(Math.random() * 200);
            const g = Math.floor(Math.random() * 200);
            const b = Math.floor(Math.random() * 200);
            cores.push(modoEscuro ? `rgba(${r}, ${g}, ${b}, 0.8)` : `rgb(${r}, ${g}, ${b})`);
        }
        return cores;
    }
    
    return coresPadrao.slice(0, quantidade);
}

// Obter cor para categoria
function getCategoryColor(categoria) {
    const cores = {
        'alimentacao': 'success',
        'transporte': 'info',
        'moradia': 'primary',
        'lazer': 'warning',
        'saude': 'danger',
        'educacao': 'secondary',
        'salario': 'success',
        'investimentos': 'primary',
        'outros': 'dark'
    };
    
    return cores[categoria] || 'secondary';
}

// Exportar para PDF
function exportarPDF() {
    alert('Exportação para PDF será implementada em uma versão futura.');
}

// Exportar para Excel
function exportarExcel() {
    alert('Exportação para Excel será implementada em uma versão futura.');
}

// Exportar para CSV
function exportarCSV() {
    const transacoes = filtrarDados(obterFiltros());
    if (transacoes.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }
    
    // Criar cabeçalho CSV
    let csv = 'Data,Descrição,Categoria,Valor,Tipo\n';
    
    // Adicionar cada transação
    transacoes.forEach(t => {
        const linha = [
            formatarData(t.data),
            `"${t.descricao}"`,
            t.categoria,
            t.valor.toString().replace('.', ','),
            t.tipo
        ];
        csv += linha.join(',') + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_financeiro.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
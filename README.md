# Gestor Financeiro

Um aplicativo web para gestão financeira pessoal desenvolvido com HTML, CSS, Bootstrap e JavaScript.

## Funcionalidades

### Dashboard Principal

- **Saldo Atual**: Exibe o saldo atual do usuário de forma destacada
- **Meta Financeira**: Gráfico tipo donut mostrando o progresso em relação a objetivos financeiros
  - Navegação entre objetivos cadastrados usando setas
- **Gráfico Mensal**: Gráfico de barras comparando receitas e despesas por mês
- **Tabela de Transações**: Lista todas as transações do mês atual com opções de ordenação por data, valor ou categoria

### Sistema de Cadastro

- **Botão Flutuante**: Acesso rápido para cadastrar novas informações
- **Opções de Cadastro**:
  - Nova despesa
  - Nova receita
  - Novo objetivo financeiro

## Tecnologias Utilizadas

- **HTML5**: Estrutura da página
- **CSS3**: Estilização personalizada
- **Bootstrap 5**: Framework para design responsivo
- **JavaScript**: Interatividade e manipulação de dados
- **Chart.js**: Biblioteca para criação de gráficos

## Como Usar

1. Clone este repositório
2. Abra o arquivo `index.html` em seu navegador
3. Explore o dashboard e cadastre suas transações e objetivos financeiros

## Estrutura do Projeto

```
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos personalizados
├── js/
│   └── app.js          # Lógica da aplicação
└── README.md           # Documentação
```

## Recursos

- Design responsivo para dispositivos móveis e desktop
- Interface intuitiva e amigável
- Visualização gráfica de dados financeiros
- Gerenciamento de objetivos financeiros
- Cadastro e acompanhamento de receitas e despesas

## Melhorias Futuras

- Persistência de dados com localStorage ou backend
- Autenticação de usuários
- Exportação de relatórios em PDF
- Categorias personalizáveis
- Notificações para lembretes de pagamentos
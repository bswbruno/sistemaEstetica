// Classe principal da aplicação
class App {
    constructor() {
        this.configuracoes = Storage.carregar(CONFIG.STORAGE_KEYS.CONFIGURACOES) || CONFIG.DEFAULT_CONFIG;
        this.clientes = new Clientes();
        this.agendamentos = new Agendamentos();
        this.servicos = new Servicos();
        this.financeiro = new Financeiro();
        this.estoque = new Estoque();
        this.configuracoesModulo = new Configuracoes();
        
        this.inicializar();
    }

    inicializar() {
        this.inicializarEventos();
        this.carregarTema();
        this.navegarPara('dashboard');
    }

    inicializarEventos() {
        // Eventos do menu
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pagina = e.currentTarget.dataset.pagina;
                this.navegarPara(pagina);
            });
        });

        // Evento do botão de tema
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.alternarTema());
        }

        // Evento do menu mobile
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleMenuMobile());
        }

        // Evento do overlay do menu mobile
        const menuOverlay = document.getElementById('menuOverlay');
        if (menuOverlay) {
            menuOverlay.addEventListener('click', () => this.fecharMenuMobile());
        }

        // Evento de redimensionamento da janela
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.fecharMenuMobile();
            }
        });
    }

    navegarPara(pagina) {
        const container = document.querySelector('.main-content');
        if (!container) return;

        // Atualiza menu ativo
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.pagina === pagina);
        });

        // Carrega conteúdo da página
        switch (pagina) {
            case 'dashboard':
                this.dashboard.renderizar(container);
                break;
            case 'clientes':
                this.clientes.renderizar(container);
                break;
            case 'agendamentos':
                this.agendamentos.renderizar(container);
                break;
            case 'servicos':
                this.servicos.renderizar(container);
                break;
            case 'financeiro':
                this.financeiro.renderizar(container);
                break;
            case 'estoque':
                this.estoque.renderizar(container);
                break;
            case 'configuracoes':
                this.configuracoesModulo.renderizar(container);
                break;
        }

        // Fecha menu mobile após navegação
        if (window.innerWidth <= 768) {
            this.fecharMenuMobile();
        }
    }

    carregarTema() {
        if (this.configuracoes.tema === 'escuro') {
            document.body.classList.add('tema-escuro');
        } else {
            document.body.classList.remove('tema-escuro');
        }
    }

    alternarTema() {
        this.configuracoes.tema = this.configuracoes.tema === 'escuro' ? 'claro' : 'escuro';
        Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, this.configuracoes);
        this.carregarTema();
    }

    toggleMenuMobile() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('menuOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    fecharMenuMobile() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('menuOverlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 
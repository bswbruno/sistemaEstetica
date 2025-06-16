// Classe principal da aplicação
class App {
    constructor() {
        this.inicializar();
    }

    inicializar() {
        this.carregarTema();
        this.inicializarEventos();
        this.navegarPara('dashboard');
    }

    carregarTema() {
        const config = Storage.carregar(CONFIG.STORAGE_KEYS.CONFIGURACOES);
        if (config && config.tema) {
            document.body.className = `tema-${config.tema}`;
            document.getElementById('tema-toggle').checked = config.tema === 'escuro';
        }
    }

    inicializarEventos() {
        // Evento de navegação
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pagina = e.currentTarget.getAttribute('href').substring(1);
                this.navegarPara(pagina);
                
                // Fecha o menu mobile ao clicar em um item
                if (window.innerWidth <= 768) {
                    this.fecharMenuMobile();
                }
            });
        });

        // Evento do toggle de tema
        document.getElementById('tema-toggle').addEventListener('change', (e) => {
            const tema = e.target.checked ? 'escuro' : 'claro';
            document.body.className = `tema-${tema}`;
            
            const config = Storage.carregar(CONFIG.STORAGE_KEYS.CONFIGURACOES);
            config.tema = tema;
            Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, config);
        });

        // Menu Mobile
        const menuToggle = document.querySelector('.menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');

        menuToggle.addEventListener('click', () => {
            this.toggleMenuMobile();
        });

        overlay.addEventListener('click', () => {
            this.fecharMenuMobile();
        });

        // Fecha o menu ao redimensionar para desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.fecharMenuMobile();
            }
        });
    }

    toggleMenuMobile() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');
        
        sidebar.classList.toggle('ativo');
        overlay.classList.toggle('ativo');
    }

    fecharMenuMobile() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.menu-overlay');
        
        sidebar.classList.remove('ativo');
        overlay.classList.remove('ativo');
    }

    navegarPara(pagina) {
        // Atualiza menu ativo
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('ativo');
            if (item.getAttribute('href') === `#${pagina}`) {
                item.classList.add('ativo');
            }
        });

        // Atualiza título da página
        document.getElementById('titulo-pagina').textContent = this.getTituloPagina(pagina);

        // Carrega conteúdo da página
        this.carregarPagina(pagina);
    }

    getTituloPagina(pagina) {
        const titulos = {
            dashboard: 'Dashboard',
            clientes: 'Clientes',
            agendamentos: 'Agendamentos',
            servicos: 'Serviços',
            financeiro: 'Financeiro',
            estoque: 'Estoque',
            configuracoes: 'Configurações'
        };
        return titulos[pagina] || 'Dashboard';
    }

    carregarPagina(pagina) {
        const container = document.getElementById('conteudo-pagina');
        
        switch(pagina) {
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
                this.configuracoes.renderizar(container);
                break;
            default:
                this.dashboard.renderizar(container);
        }
    }
}

// Inicializa a aplicação
const app = new App(); 
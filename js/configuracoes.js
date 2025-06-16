// Classe para gerenciamento de configurações
class Configuracoes {
    constructor() {
        this.config = Storage.carregar(CONFIG.STORAGE_KEYS.CONFIGURACOES) || CONFIG.DEFAULT_CONFIG;
    }

    // Renderiza a página de configurações
    renderizar(container) {
        container.innerHTML = `
            <div class="configuracoes-container">
                <div class="configuracoes-secao">
                    <h3>Dados do Estúdio</h3>
                    <form id="form-estudio" class="formulario">
                        <div class="campo">
                            <label for="nomeEstudio">Nome do Estúdio</label>
                            <input type="text" id="nomeEstudio" name="nomeEstudio" value="${this.config.nomeEstudio}">
                        </div>

                        <div class="campo">
                            <label for="telefone">Telefone</label>
                            <input type="tel" id="telefone" name="telefone" value="${this.config.telefone}">
                        </div>

                        <div class="campo">
                            <label for="endereco">Endereço</label>
                            <input type="text" id="endereco" name="endereco" value="${this.config.endereco}">
                        </div>

                        <div class="acoes-formulario">
                            <button type="submit" class="btn-primario">Salvar Dados</button>
                        </div>
                    </form>
                </div>

                <div class="configuracoes-secao">
                    <h3>Personalização</h3>
                    <form id="form-personalizacao" class="formulario">
                        <div class="campo">
                            <label for="cor-primaria">Cor Primária</label>
                            <input type="color" id="cor-primaria" name="cor-primaria" value="${this.config.cores.primaria}">
                        </div>

                        <div class="campo">
                            <label for="cor-secundaria">Cor Secundária</label>
                            <input type="color" id="cor-secundaria" name="cor-secundaria" value="${this.config.cores.secundaria}">
                        </div>

                        <div class="acoes-formulario">
                            <button type="submit" class="btn-primario">Salvar Cores</button>
                        </div>
                    </form>
                </div>

                <div class="configuracoes-secao">
                    <h3>Backup e Restauração</h3>
                    <div class="backup-acoes">
                        <button class="btn-secundario" onclick="app.configuracoesModulo.exportarDados()">
                            <span class="material-icons">download</span>
                            Exportar Dados
                        </button>
                        <button class="btn-secundario" onclick="app.configuracoesModulo.importarDados()">
                            <span class="material-icons">upload</span>
                            Importar Dados
                        </button>
                        <button class="btn-secundario" onclick="app.configuracoesModulo.limparDados()">
                            <span class="material-icons">delete_forever</span>
                            Limpar Dados
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.inicializarEventos();
    }

    // Inicializa eventos
    inicializarEventos() {
        const formEstudio = document.getElementById('form-estudio');
        if (formEstudio) {
            formEstudio.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarDadosEstudio();
            });
        }

        const formPersonalizacao = document.getElementById('form-personalizacao');
        if (formPersonalizacao) {
            formPersonalizacao.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarCores();
            });
        }
    }

    // Salva dados do estúdio
    salvarDadosEstudio() {
        const form = document.getElementById('form-estudio');
        this.config.nomeEstudio = form.querySelector('#nomeEstudio').value;
        this.config.telefone = form.querySelector('#telefone').value;
        this.config.endereco = form.querySelector('#endereco').value;

        Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, this.config);
        alert('Dados do estúdio salvos com sucesso!');
    }

    // Salva cores personalizadas
    salvarCores() {
        const form = document.getElementById('form-personalizacao');
        this.config.cores.primaria = form.querySelector('#cor-primaria').value;
        this.config.cores.secundaria = form.querySelector('#cor-secundaria').value;

        Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, this.config);
        
        // Atualiza variáveis CSS
        document.documentElement.style.setProperty('--cor-primaria', this.config.cores.primaria);
        document.documentElement.style.setProperty('--cor-secundaria', this.config.cores.secundaria);
        
        alert('Cores personalizadas salvas com sucesso!');
    }

    // Exporta dados para arquivo JSON
    exportarDados() {
        const dados = {
            clientes: Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES),
            agendamentos: Storage.carregar(CONFIG.STORAGE_KEYS.AGENDAMENTOS),
            servicos: Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS),
            financeiro: Storage.carregar(CONFIG.STORAGE_KEYS.FINANCEIRO),
            configuracoes: this.config
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_estetica_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Importa dados de arquivo JSON
    importarDados() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const dados = JSON.parse(event.target.result);
                        
                        // Valida estrutura do arquivo
                        if (!this.validarDadosImportacao(dados)) {
                            throw new Error('Arquivo inválido');
                        }

                        // Salva dados
                        Storage.salvar(CONFIG.STORAGE_KEYS.CLIENTES, dados.clientes);
                        Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, dados.agendamentos);
                        Storage.salvar(CONFIG.STORAGE_KEYS.SERVICOS, dados.servicos);
                        Storage.salvar(CONFIG.STORAGE_KEYS.FINANCEIRO, dados.financeiro);
                        Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, dados.configuracoes);

                        // Atualiza configurações
                        this.config = dados.configuracoes;
                        document.documentElement.style.setProperty('--cor-primaria', this.config.cores.primaria);
                        document.documentElement.style.setProperty('--cor-secundaria', this.config.cores.secundaria);

                        alert('Dados importados com sucesso!');
                        window.location.reload();
                    } catch (error) {
                        alert('Erro ao importar dados: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        };

        input.click();
    }

    // Valida estrutura dos dados importados
    validarDadosImportacao(dados) {
        return (
            dados &&
            Array.isArray(dados.clientes) &&
            Array.isArray(dados.agendamentos) &&
            Array.isArray(dados.servicos) &&
            Array.isArray(dados.financeiro) &&
            dados.configuracoes &&
            dados.configuracoes.cores
        );
    }

    // Limpa todos os dados
    limparDados() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita!')) {
            Storage.limpar();
            this.config = CONFIG.DEFAULT_CONFIG;
            Storage.salvar(CONFIG.STORAGE_KEYS.CONFIGURACOES, this.config);
            alert('Todos os dados foram limpos!');
            window.location.reload();
        }
    }
} 
// Classe para gerenciamento de clientes
class Clientes {
    constructor() {
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
    }

    // Renderiza a página de clientes
    renderizar(container) {
        container.innerHTML = `
            <div class="clientes-container">
                <div class="clientes-lista" id="clientes-lista">
                    ${this.renderizarLista()}
                </div>
            </div>
        `;

        this.inicializarEventos();
    }

    // Renderiza a lista de clientes
    renderizarLista() {
        if (this.clientes.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">people</span>
                    <p>Nenhum cliente cadastrado</p>
                </div>
            `;
        }

        return `
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>WhatsApp</th>
                            <th>Data de Nascimento</th>
                            <th>Tipo de Pele</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.clientes.map(cliente => `
                            <tr>
                                <td>${cliente.nome}</td>
                                <td>${cliente.whatsapp}</td>
                                <td>${this.formatarData(cliente.dataNascimento)}</td>
                                <td>${cliente.tipoPele}</td>
                                <td>
                                    <button class="btn-acao" onclick="app.clientes.editarCliente(${cliente.id})">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="btn-acao" onclick="app.clientes.visualizarHistorico(${cliente.id})">
                                        <span class="material-icons">history</span>
                                    </button>
                                    <button class="btn-acao" onclick="app.clientes.excluirCliente(${cliente.id})">
                                        <span class="material-icons">delete</span>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Renderiza o formulário de cliente
    renderizarFormulario(cliente = null) {
        const isEdicao = cliente !== null;
        const titulo = isEdicao ? 'Editar Cliente' : 'Novo Cliente';

        return `
            <div class="formulario-container">
                <h3>${titulo}</h3>
                <form id="form-cliente" class="formulario">
                    <input type="hidden" id="cliente-id" value="${cliente?.id || ''}">
                    
                    <div class="campo">
                        <label for="nome">Nome Completo</label>
                        <input type="text" id="nome" name="nome" required value="${cliente?.nome || ''}">
                    </div>

                    <div class="campo">
                        <label for="whatsapp">WhatsApp</label>
                        <input type="tel" id="whatsapp" name="whatsapp" required value="${cliente?.whatsapp || ''}">
                    </div>

                    <div class="campo">
                        <label for="dataNascimento">Data de Nascimento</label>
                        <input type="date" id="dataNascimento" name="dataNascimento" required value="${cliente?.dataNascimento || ''}">
                    </div>

                    <div class="campo">
                        <label for="tipoPele">Tipo de Pele</label>
                        <select id="tipoPele" name="tipoPele" required>
                            <option value="">Selecione...</option>
                            <option value="Normal" ${cliente?.tipoPele === 'Normal' ? 'selected' : ''}>Normal</option>
                            <option value="Seca" ${cliente?.tipoPele === 'Seca' ? 'selected' : ''}>Seca</option>
                            <option value="Oleosa" ${cliente?.tipoPele === 'Oleosa' ? 'selected' : ''}>Oleosa</option>
                            <option value="Mista" ${cliente?.tipoPele === 'Mista' ? 'selected' : ''}>Mista</option>
                            <option value="Sensível" ${cliente?.tipoPele === 'Sensível' ? 'selected' : ''}>Sensível</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="observacoes">Observações</label>
                        <textarea id="observacoes" name="observacoes" rows="4">${cliente?.observacoes || ''}</textarea>
                    </div>

                    <div class="acoes-formulario">
                        <button type="button" class="btn-secundario" onclick="app.clientes.cancelarEdicao()">Cancelar</button>
                        <button type="submit" class="btn-primario">${isEdicao ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        const form = document.getElementById('form-cliente');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarCliente();
            });
        }
    }

    // Abre formulário para novo cliente
    novoCliente() {
        const container = document.getElementById('conteudo-pagina');
        container.innerHTML = this.renderizarFormulario();
        this.inicializarEventos();
    }

    // Abre formulário para editar cliente
    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (cliente) {
            const container = document.getElementById('conteudo-pagina');
            container.innerHTML = this.renderizarFormulario(cliente);
            this.inicializarEventos();
        }
    }

    // Salva cliente (novo ou edição)
    salvarCliente() {
        const form = document.getElementById('form-cliente');
        const id = form.querySelector('#cliente-id').value;
        const dados = {
            id: id ? parseInt(id) : Date.now(),
            nome: form.querySelector('#nome').value,
            whatsapp: form.querySelector('#whatsapp').value,
            dataNascimento: form.querySelector('#dataNascimento').value,
            tipoPele: form.querySelector('#tipoPele').value,
            observacoes: form.querySelector('#observacoes').value
        };

        if (id) {
            const index = this.clientes.findIndex(c => c.id === parseInt(id));
            this.clientes[index] = dados;
        } else {
            this.clientes.push(dados);
        }

        Storage.salvar(CONFIG.STORAGE_KEYS.CLIENTES, this.clientes);
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Exclui cliente
    excluirCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            this.clientes = this.clientes.filter(c => c.id !== id);
            Storage.salvar(CONFIG.STORAGE_KEYS.CLIENTES, this.clientes);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Visualiza histórico do cliente
    visualizarHistorico(id) {
        // Implementação futura
        alert('Funcionalidade em desenvolvimento');
    }

    // Cancela edição e volta para lista
    cancelarEdicao() {
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Formata data para exibição
    formatarData(data) {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
    }
}

// Adiciona o módulo de clientes à aplicação
App.prototype.clientes = new Clientes();
App.prototype.carregarClientes = function(container) {
    this.clientes.renderizar(container);
}; 
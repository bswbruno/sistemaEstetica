// Classe para gerenciamento de clientes
class Clientes {
    constructor() {
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
        this.inicializarEventos();
    }

    // Renderiza a página de clientes
    renderizar(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Clientes</h2>
                <button class="btn btn-primary btn-novo-cliente">
                    <i class="material-icons">add</i>
                    Novo Cliente
                </button>
            </div>

            <div class="clientes-container">
                <div class="clientes-lista">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Última Visita</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.clientes.map(cliente => `
                                <tr>
                                    <td>${cliente.nome}</td>
                                    <td>${cliente.telefone}</td>
                                    <td>${cliente.email || '-'}</td>
                                    <td>${cliente.ultimaVisita || '-'}</td>
                                    <td>
                                        <button class="btn-icon btn-editar-cliente" data-id="${cliente.id}">
                                            <i class="material-icons">edit</i>
                                        </button>
                                        <button class="btn-icon btn-excluir-cliente" data-id="${cliente.id}">
                                            <i class="material-icons">delete</i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="cliente-form" style="display: none;">
                    <h3>Cadastrar Cliente</h3>
                    <form id="formCliente">
                        <input type="hidden" id="clienteId">
                        <div class="form-group">
                            <label for="nome">Nome Completo</label>
                            <input type="text" id="nome" required>
                        </div>
                        <div class="form-group">
                            <label for="telefone">Telefone</label>
                            <input type="tel" id="telefone" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email">
                        </div>
                        <div class="form-group">
                            <label for="dataNascimento">Data de Nascimento</label>
                            <input type="date" id="dataNascimento">
                        </div>
                        <div class="form-group">
                            <label for="observacoes">Observações</label>
                            <textarea id="observacoes"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-cancelar-cliente">Cancelar</button>
                            <button type="button" class="btn btn-primary btn-salvar-cliente">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-novo-cliente')) {
                this.abrirFormulario();
            } else if (e.target.matches('.btn-salvar-cliente')) {
                this.salvarCliente();
            } else if (e.target.matches('.btn-cancelar-cliente')) {
                this.fecharFormulario();
            } else if (e.target.matches('.btn-editar-cliente')) {
                const id = e.target.dataset.id;
                this.editarCliente(id);
            } else if (e.target.matches('.btn-excluir-cliente')) {
                const id = e.target.dataset.id;
                this.excluirCliente(id);
            }
        });
    }

    // Abre formulário para novo cliente
    abrirFormulario() {
        const lista = document.querySelector('.clientes-lista');
        const formulario = document.querySelector('.cliente-form');
        
        if (lista && formulario) {
            lista.style.display = 'none';
            formulario.style.display = 'block';
            document.getElementById('formCliente').reset();
            document.getElementById('clienteId').value = '';
        }
    }

    // Abre formulário para editar cliente
    editarCliente(id) {
        const cliente = this.clientes.find(c => c.id === id);
        if (!cliente) return;

        document.getElementById('clienteId').value = cliente.id;
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('telefone').value = cliente.telefone;
        document.getElementById('email').value = cliente.email || '';
        document.getElementById('dataNascimento').value = cliente.dataNascimento || '';
        document.getElementById('observacoes').value = cliente.observacoes || '';

        this.abrirFormulario();
    }

    // Salva cliente (novo ou edição)
    salvarCliente() {
        const form = document.getElementById('formCliente');
        if (!form) return;

        const clienteId = document.getElementById('clienteId').value;
        const cliente = {
            id: clienteId || Date.now().toString(),
            nome: document.getElementById('nome').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            observacoes: document.getElementById('observacoes').value,
            dataCadastro: clienteId ? this.clientes.find(c => c.id === clienteId)?.dataCadastro : new Date().toISOString(),
            ultimaVisita: clienteId ? this.clientes.find(c => c.id === clienteId)?.ultimaVisita : null
        };

        if (clienteId) {
            const index = this.clientes.findIndex(c => c.id === clienteId);
            if (index !== -1) {
                this.clientes[index] = cliente;
            }
        } else {
            this.clientes.push(cliente);
        }

        if (Storage.salvar(CONFIG.STORAGE_KEYS.CLIENTES, this.clientes)) {
            this.fecharFormulario();
            this.renderizar(document.querySelector('.main-content'));
            alert('Cliente salvo com sucesso!');
        } else {
            alert('Erro ao salvar cliente. Tente novamente.');
        }
    }

    // Exclui cliente
    excluirCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            this.clientes = this.clientes.filter(c => c.id !== id);
            if (Storage.salvar(CONFIG.STORAGE_KEYS.CLIENTES, this.clientes)) {
                this.renderizar(document.querySelector('.main-content'));
                alert('Cliente excluído com sucesso!');
            } else {
                alert('Erro ao excluir cliente. Tente novamente.');
            }
        }
    }

    // Fecha o formulário de cadastro
    fecharFormulario() {
        const lista = document.querySelector('.clientes-lista');
        const formulario = document.querySelector('.cliente-form');
        
        if (lista && formulario) {
            lista.style.display = 'block';
            formulario.style.display = 'none';
        }
    }
}

// Adiciona o módulo de clientes à aplicação
App.prototype.clientes = new Clientes();
App.prototype.carregarClientes = function(container) {
    this.clientes.renderizar(container);
}; 
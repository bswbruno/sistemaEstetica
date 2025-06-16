// Classe para gerenciamento de serviços
class Servicos {
    constructor() {
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
        this.inicializarEventos();
    }

    // Renderiza a página de serviços
    renderizar(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Serviços</h2>
                <button class="btn btn-primary btn-novo-servico">
                    <i class="material-icons">add</i>
                    Novo Serviço
                </button>
            </div>

            <div class="servicos-container">
                <div class="servicos-lista">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Duração</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.servicos.map(servico => `
                                <tr>
                                    <td>${servico.nome}</td>
                                    <td>${servico.categoria}</td>
                                    <td>${servico.duracao} min</td>
                                    <td>R$ ${servico.valor.toFixed(2)}</td>
                                    <td>
                                        <button class="btn-icon btn-editar-servico" data-id="${servico.id}">
                                            <i class="material-icons">edit</i>
                                        </button>
                                        <button class="btn-icon btn-excluir-servico" data-id="${servico.id}">
                                            <i class="material-icons">delete</i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="servico-form" style="display: none;">
                    <h3>Cadastrar Serviço</h3>
                    <form id="formServico">
                        <input type="hidden" id="servicoId">
                        <div class="form-group">
                            <label for="nome">Nome do Serviço</label>
                            <input type="text" id="nome" required>
                        </div>
                        <div class="form-group">
                            <label for="categoria">Categoria</label>
                            <select id="categoria" required>
                                <option value="">Selecione uma categoria</option>
                                ${CONFIG.CATEGORIAS_SERVICOS.map(categoria => 
                                    `<option value="${categoria}">${categoria}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="duracao">Duração (minutos)</label>
                            <input type="number" id="duracao" min="15" step="15" required>
                        </div>
                        <div class="form-group">
                            <label for="valor">Valor (R$)</label>
                            <input type="number" id="valor" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="descricao">Descrição</label>
                            <textarea id="descricao" rows="4"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-cancelar-servico">Cancelar</button>
                            <button type="button" class="btn btn-primary btn-salvar-servico">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-novo-servico')) {
                this.abrirFormulario();
            } else if (e.target.matches('.btn-salvar-servico')) {
                this.salvarServico();
            } else if (e.target.matches('.btn-cancelar-servico')) {
                this.fecharFormulario();
            } else if (e.target.matches('.btn-editar-servico')) {
                const id = e.target.dataset.id;
                this.editarServico(id);
            } else if (e.target.matches('.btn-excluir-servico')) {
                const id = e.target.dataset.id;
                this.excluirServico(id);
            }
        });
    }

    abrirFormulario() {
        const lista = document.querySelector('.servicos-lista');
        const formulario = document.querySelector('.servico-form');
        
        if (lista && formulario) {
            lista.style.display = 'none';
            formulario.style.display = 'block';
            document.getElementById('formServico').reset();
            document.getElementById('servicoId').value = '';
        }
    }

    fecharFormulario() {
        const lista = document.querySelector('.servicos-lista');
        const formulario = document.querySelector('.servico-form');
        
        if (lista && formulario) {
            lista.style.display = 'block';
            formulario.style.display = 'none';
        }
    }

    salvarServico() {
        const form = document.getElementById('formServico');
        if (!form) return;

        const servicoId = document.getElementById('servicoId').value;
        const servico = {
            id: servicoId || Date.now().toString(),
            nome: document.getElementById('nome').value,
            categoria: document.getElementById('categoria').value,
            duracao: parseInt(document.getElementById('duracao').value),
            valor: parseFloat(document.getElementById('valor').value),
            descricao: document.getElementById('descricao').value,
            dataCadastro: servicoId ? this.servicos.find(s => s.id === servicoId)?.dataCadastro : new Date().toISOString()
        };

        if (servicoId) {
            const index = this.servicos.findIndex(s => s.id === servicoId);
            if (index !== -1) {
                this.servicos[index] = servico;
            }
        } else {
            this.servicos.push(servico);
        }

        if (Storage.salvar(CONFIG.STORAGE_KEYS.SERVICOS, this.servicos)) {
            this.fecharFormulario();
            this.renderizar(document.querySelector('.main-content'));
            alert('Serviço salvo com sucesso!');
        } else {
            alert('Erro ao salvar serviço. Tente novamente.');
        }
    }

    editarServico(id) {
        const servico = this.servicos.find(s => s.id === id);
        if (!servico) return;

        document.getElementById('servicoId').value = servico.id;
        document.getElementById('nome').value = servico.nome;
        document.getElementById('categoria').value = servico.categoria;
        document.getElementById('duracao').value = servico.duracao;
        document.getElementById('valor').value = servico.valor;
        document.getElementById('descricao').value = servico.descricao || '';

        this.abrirFormulario();
    }

    excluirServico(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            this.servicos = this.servicos.filter(s => s.id !== id);
            if (Storage.salvar(CONFIG.STORAGE_KEYS.SERVICOS, this.servicos)) {
                this.renderizar(document.querySelector('.main-content'));
                alert('Serviço excluído com sucesso!');
            } else {
                alert('Erro ao excluir serviço. Tente novamente.');
            }
        }
    }
}

// Adiciona o módulo de serviços à aplicação
App.prototype.servicos = new Servicos();
App.prototype.carregarServicos = function(container) {
    this.servicos.renderizar(container);
}; 
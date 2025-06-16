// Classe para gerenciamento de serviços
class Servicos {
    constructor() {
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
    }

    // Renderiza a página de serviços
    renderizar(container) {
        container.innerHTML = `
            <div class="servicos-container">
                <div class="servicos-lista" id="servicos-lista">
                    ${this.renderizarLista()}
                </div>
            </div>
        `;
    }

    // Renderiza a lista de serviços
    renderizarLista() {
        if (this.servicos.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">miscellaneous_services</span>
                    <p>Nenhum serviço cadastrado</p>
                </div>
            `;
        }

        return `
            <div class="tabela-container">
                <table class="tabela">
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
                                <td>${this.formatarValor(servico.valor)}</td>
                                <td>
                                    <button class="btn-acao" onclick="app.servicos.editarServico(${servico.id})">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="btn-acao" onclick="app.servicos.excluirServico(${servico.id})">
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

    // Renderiza o formulário de serviço
    renderizarFormulario(servico = null) {
        const isEdicao = servico !== null;
        const titulo = isEdicao ? 'Editar Serviço' : 'Novo Serviço';

        return `
            <div class="formulario-container">
                <h3>${titulo}</h3>
                <form id="form-servico" class="formulario">
                    <input type="hidden" id="servico-id" value="${servico?.id || ''}">
                    
                    <div class="campo">
                        <label for="nome">Nome do Serviço</label>
                        <input type="text" id="nome" name="nome" required value="${servico?.nome || ''}">
                    </div>

                    <div class="campo">
                        <label for="categoria">Categoria</label>
                        <select id="categoria" name="categoria" required>
                            <option value="">Selecione...</option>
                            ${CONFIG.CATEGORIAS_SERVICOS.map(categoria => `
                                <option value="${categoria}" ${servico?.categoria === categoria ? 'selected' : ''}>
                                    ${categoria}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="campo">
                        <label for="duracao">Duração (minutos)</label>
                        <input type="number" id="duracao" name="duracao" required min="1" value="${servico?.duracao || ''}">
                    </div>

                    <div class="campo">
                        <label for="valor">Valor (R$)</label>
                        <input type="number" id="valor" name="valor" required min="0" step="0.01" value="${servico?.valor || ''}">
                    </div>

                    <div class="campo">
                        <label for="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="4">${servico?.descricao || ''}</textarea>
                    </div>

                    <div class="acoes-formulario">
                        <button type="button" class="btn-secundario" onclick="app.servicos.cancelarEdicao()">Cancelar</button>
                        <button type="submit" class="btn-primario">${isEdicao ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        const form = document.getElementById('form-servico');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarServico();
            });
        }
    }

    // Abre formulário para novo serviço
    novoServico() {
        const container = document.getElementById('conteudo-pagina');
        container.innerHTML = this.renderizarFormulario();
        this.inicializarEventos();
    }

    // Abre formulário para editar serviço
    editarServico(id) {
        const servico = this.servicos.find(s => s.id === id);
        if (servico) {
            const container = document.getElementById('conteudo-pagina');
            container.innerHTML = this.renderizarFormulario(servico);
            this.inicializarEventos();
        }
    }

    // Salva serviço (novo ou edição)
    salvarServico() {
        const form = document.getElementById('form-servico');
        const id = form.querySelector('#servico-id').value;
        const dados = {
            id: id ? parseInt(id) : Date.now(),
            nome: form.querySelector('#nome').value,
            categoria: form.querySelector('#categoria').value,
            duracao: parseInt(form.querySelector('#duracao').value),
            valor: parseFloat(form.querySelector('#valor').value),
            descricao: form.querySelector('#descricao').value
        };

        if (id) {
            const index = this.servicos.findIndex(s => s.id === parseInt(id));
            this.servicos[index] = dados;
        } else {
            this.servicos.push(dados);
        }

        Storage.salvar(CONFIG.STORAGE_KEYS.SERVICOS, this.servicos);
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Exclui serviço
    excluirServico(id) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            this.servicos = this.servicos.filter(s => s.id !== id);
            Storage.salvar(CONFIG.STORAGE_KEYS.SERVICOS, this.servicos);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Cancela edição e volta para lista
    cancelarEdicao() {
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Formata valor para exibição
    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Adiciona o módulo de serviços à aplicação
App.prototype.servicos = new Servicos();
App.prototype.carregarServicos = function(container) {
    this.servicos.renderizar(container);
}; 
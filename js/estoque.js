// Classe para gerenciamento de estoque
class Estoque {
    constructor() {
        this.estoque = Storage.carregar(CONFIG.STORAGE_KEYS.ESTOQUE) || [];
    }

    // Renderiza a página de estoque
    renderizar(container) {
        container.innerHTML = `
            <div class="estoque-container">
                <div class="resumo-cards">
                    <div class="card">
                        <span class="material-icons">inventory</span>
                        <div class="card-info">
                            <h4>Total de Produtos</h4>
                            <p>${this.getTotalProdutos()}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">payments</span>
                        <div class="card-info">
                            <h4>Valor Total em Estoque</h4>
                            <p>${this.formatarValor(this.getValorTotalEstoque())}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">warning</span>
                        <div class="card-info">
                            <h4>Produtos com Baixo Estoque</h4>
                            <p>${this.getProdutosBaixoEstoque()}</p>
                        </div>
                    </div>
                </div>

                <div class="estoque-lista" id="estoque-lista">
                    ${this.renderizarLista()}
                </div>
            </div>
        `;

        this.inicializarEventos();
    }

    // Renderiza a lista de produtos
    renderizarLista() {
        if (this.estoque.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">inventory</span>
                    <p>Nenhum produto cadastrado</p>
                </div>
            `;
        }

        return `
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Quantidade</th>
                            <th>Valor Unitário</th>
                            <th>Valor Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.estoque.map(produto => `
                            <tr>
                                <td>${produto.nome}</td>
                                <td>${produto.quantidade} ${produto.unidade}</td>
                                <td>${this.formatarValor(produto.valorUnitario)}</td>
                                <td>${this.formatarValor(produto.quantidade * produto.valorUnitario)}</td>
                                <td>
                                    <span class="status-badge ${this.getStatusEstoque(produto).toLowerCase()}">
                                        ${this.getStatusEstoque(produto)}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn-acao" onclick="app.estoque.editarProduto(${produto.id})">
                                        <span class="material-icons">edit</span>
                                    </button>
                                    <button class="btn-acao" onclick="app.estoque.ajustarEstoque(${produto.id})">
                                        <span class="material-icons">add_circle</span>
                                    </button>
                                    <button class="btn-acao" onclick="app.estoque.excluirProduto(${produto.id})">
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

    // Renderiza o formulário de produto
    renderizarFormulario(produto = null) {
        const isEdicao = produto !== null;
        const titulo = isEdicao ? 'Editar Produto' : 'Novo Produto';

        return `
            <div class="formulario-container">
                <h3>${titulo}</h3>
                <form id="form-produto" class="formulario">
                    <input type="hidden" id="produto-id" value="${produto?.id || ''}">
                    
                    <div class="campo">
                        <label for="nome">Nome do Produto</label>
                        <input type="text" id="nome" name="nome" required value="${produto?.nome || ''}">
                    </div>

                    <div class="campo">
                        <label for="quantidade">Quantidade</label>
                        <input type="number" id="quantidade" name="quantidade" required min="0" step="0.01" value="${produto?.quantidade || ''}">
                    </div>

                    <div class="campo">
                        <label for="unidade">Unidade</label>
                        <select id="unidade" name="unidade" required>
                            <option value="">Selecione...</option>
                            <option value="un" ${produto?.unidade === 'un' ? 'selected' : ''}>Unidade</option>
                            <option value="kg" ${produto?.unidade === 'kg' ? 'selected' : ''}>Quilograma</option>
                            <option value="l" ${produto?.unidade === 'l' ? 'selected' : ''}>Litro</option>
                            <option value="ml" ${produto?.unidade === 'ml' ? 'selected' : ''}>Mililitro</option>
                            <option value="g" ${produto?.unidade === 'g' ? 'selected' : ''}>Grama</option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="valorUnitario">Valor Unitário</label>
                        <input type="number" id="valorUnitario" name="valorUnitario" required min="0" step="0.01" value="${produto?.valorUnitario || ''}">
                    </div>

                    <div class="campo">
                        <label for="minimo">Quantidade Mínima</label>
                        <input type="number" id="minimo" name="minimo" required min="0" step="0.01" value="${produto?.minimo || ''}">
                    </div>

                    <div class="campo">
                        <label for="observacoes">Observações</label>
                        <textarea id="observacoes" name="observacoes" rows="4">${produto?.observacoes || ''}</textarea>
                    </div>

                    <div class="acoes-formulario">
                        <button type="button" class="btn-secundario" onclick="app.estoque.cancelarEdicao()">Cancelar</button>
                        <button type="submit" class="btn-primario">${isEdicao ? 'Salvar' : 'Cadastrar'}</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        const form = document.getElementById('form-produto');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarProduto();
            });
        }
    }

    // Abre formulário para novo produto
    novoProduto() {
        const container = document.getElementById('conteudo-pagina');
        container.innerHTML = this.renderizarFormulario();
        this.inicializarEventos();
    }

    // Abre formulário para editar produto
    editarProduto(id) {
        const produto = this.estoque.find(p => p.id === id);
        if (produto) {
            const container = document.getElementById('conteudo-pagina');
            container.innerHTML = this.renderizarFormulario(produto);
            this.inicializarEventos();
        }
    }

    // Salva produto (novo ou edição)
    salvarProduto() {
        const form = document.getElementById('form-produto');
        const id = form.querySelector('#produto-id').value;
        const dados = {
            id: id ? parseInt(id) : Date.now(),
            nome: form.querySelector('#nome').value,
            quantidade: parseFloat(form.querySelector('#quantidade').value),
            unidade: form.querySelector('#unidade').value,
            valorUnitario: parseFloat(form.querySelector('#valorUnitario').value),
            minimo: parseFloat(form.querySelector('#minimo').value),
            observacoes: form.querySelector('#observacoes').value
        };

        if (id) {
            const index = this.estoque.findIndex(p => p.id === parseInt(id));
            this.estoque[index] = dados;
        } else {
            this.estoque.push(dados);
        }

        Storage.salvar(CONFIG.STORAGE_KEYS.ESTOQUE, this.estoque);
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Exclui produto
    excluirProduto(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            this.estoque = this.estoque.filter(p => p.id !== id);
            Storage.salvar(CONFIG.STORAGE_KEYS.ESTOQUE, this.estoque);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Ajusta estoque
    ajustarEstoque(id) {
        const produto = this.estoque.find(p => p.id === id);
        if (produto) {
            const quantidade = prompt('Digite a quantidade a adicionar:', '0');
            if (quantidade !== null) {
                const qtd = parseFloat(quantidade);
                if (!isNaN(qtd)) {
                    produto.quantidade += qtd;
                    Storage.salvar(CONFIG.STORAGE_KEYS.ESTOQUE, this.estoque);
                    this.renderizar(document.getElementById('conteudo-pagina'));
                } else {
                    alert('Quantidade inválida!');
                }
            }
        }
    }

    // Cancela edição e volta para lista
    cancelarEdicao() {
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Obtém status do estoque
    getStatusEstoque(produto) {
        if (produto.quantidade <= 0) return 'ESGOTADO';
        if (produto.quantidade <= produto.minimo) return 'BAIXO';
        return 'NORMAL';
    }

    // Obtém total de produtos
    getTotalProdutos() {
        return this.estoque.length;
    }

    // Obtém valor total em estoque
    getValorTotalEstoque() {
        return this.estoque.reduce((total, p) => total + (p.quantidade * p.valorUnitario), 0);
    }

    // Obtém produtos com baixo estoque
    getProdutosBaixoEstoque() {
        return this.estoque.filter(p => p.quantidade <= p.minimo).length;
    }

    // Formata valor
    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Adiciona o módulo de estoque à aplicação
App.prototype.estoque = new Estoque();
App.prototype.carregarEstoque = function(container) {
    this.estoque.renderizar(container);
}; 
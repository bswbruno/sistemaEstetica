// Classe para gerenciamento financeiro
class Financeiro {
    constructor() {
        this.pagamentos = Storage.carregar(CONFIG.STORAGE_KEYS.FINANCEIRO) || [];
        this.agendamentos = Storage.carregar(CONFIG.STORAGE_KEYS.AGENDAMENTOS) || [];
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
    }

    // Renderiza a página financeira
    renderizar(container) {
        container.innerHTML = `
            <div class="financeiro-container">
                <div class="resumo-financeiro">
                    <div class="card">
                        <span class="material-icons">today</span>
                        <div class="card-info">
                            <h4>Hoje</h4>
                            <p>${this.formatarValor(this.calcularTotalPeriodo('hoje'))}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">date_range</span>
                        <div class="card-info">
                            <h4>Esta Semana</h4>
                            <p>${this.formatarValor(this.calcularTotalPeriodo('semana'))}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">calendar_month</span>
                        <div class="card-info">
                            <h4>Este Mês</h4>
                            <p>${this.formatarValor(this.calcularTotalPeriodo('mes'))}</p>
                        </div>
                    </div>
                </div>

                <div class="filtros">
                    <div class="campo">
                        <label for="filtro-data-inicio">Data Início</label>
                        <input type="date" id="filtro-data-inicio" onchange="app.financeiro.filtrar()">
                    </div>
                    <div class="campo">
                        <label for="filtro-data-fim">Data Fim</label>
                        <input type="date" id="filtro-data-fim" onchange="app.financeiro.filtrar()">
                    </div>
                    <div class="campo">
                        <label for="filtro-forma-pagamento">Forma de Pagamento</label>
                        <select id="filtro-forma-pagamento" onchange="app.financeiro.filtrar()">
                            <option value="">Todas</option>
                            ${CONFIG.FORMAS_PAGAMENTO.map(forma => `
                                <option value="${forma}">${forma}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="financeiro-lista" id="financeiro-lista">
                    ${this.renderizarLista()}
                </div>
            </div>
        `;
    }

    // Renderiza a lista de pagamentos
    renderizarLista(filtros = {}) {
        let pagamentosFiltrados = [...this.pagamentos];

        // Aplica filtros
        if (filtros.dataInicio) {
            pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                new Date(p.data) >= new Date(filtros.dataInicio)
            );
        }
        if (filtros.dataFim) {
            pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                new Date(p.data) <= new Date(filtros.dataFim)
            );
        }
        if (filtros.formaPagamento) {
            pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                p.formaPagamento === filtros.formaPagamento
            );
        }

        if (pagamentosFiltrados.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">payments</span>
                    <p>Nenhum pagamento encontrado</p>
                </div>
            `;
        }

        return `
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Serviço</th>
                            <th>Valor</th>
                            <th>Forma de Pagamento</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pagamentosFiltrados.map(pagamento => {
                            const cliente = this.clientes.find(c => c.id === pagamento.clienteId);
                            const servico = this.servicos.find(s => s.id === pagamento.servicoId);
                            return `
                                <tr>
                                    <td>${this.formatarData(pagamento.data)}</td>
                                    <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                    <td>${servico ? servico.nome : 'Serviço não encontrado'}</td>
                                    <td>${this.formatarValor(pagamento.valor)}</td>
                                    <td>${pagamento.formaPagamento}</td>
                                    <td>
                                        <button class="btn-acao" onclick="app.financeiro.excluirPagamento(${pagamento.id})">
                                            <span class="material-icons">delete</span>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Renderiza o formulário de pagamento
    renderizarFormulario(agendamento = null) {
        const titulo = 'Registrar Pagamento';

        return `
            <div class="formulario-container">
                <h3>${titulo}</h3>
                <form id="form-pagamento" class="formulario">
                    <input type="hidden" id="agendamento-id" value="${agendamento?.id || ''}">
                    
                    <div class="campo">
                        <label for="cliente">Cliente</label>
                        <select id="cliente" name="cliente" required>
                            <option value="">Selecione um cliente...</option>
                            ${this.clientes.map(cliente => `
                                <option value="${cliente.id}" ${agendamento?.clienteId === cliente.id ? 'selected' : ''}>
                                    ${cliente.nome}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="campo">
                        <label for="servico">Serviço</label>
                        <select id="servico" name="servico" required>
                            <option value="">Selecione um serviço...</option>
                            ${this.servicos.map(servico => `
                                <option value="${servico.id}" ${agendamento?.servicoId === servico.id ? 'selected' : ''}>
                                    ${servico.nome} - ${this.formatarValor(servico.valor)}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="campo">
                        <label for="valor">Valor</label>
                        <input type="number" id="valor" name="valor" required min="0" step="0.01" value="${agendamento ? this.servicos.find(s => s.id === agendamento.servicoId)?.valor || '' : ''}">
                    </div>

                    <div class="campo">
                        <label for="data">Data</label>
                        <input type="date" id="data" name="data" required value="${agendamento?.data || new Date().toISOString().split('T')[0]}">
                    </div>

                    <div class="campo">
                        <label for="formaPagamento">Forma de Pagamento</label>
                        <select id="formaPagamento" name="formaPagamento" required>
                            <option value="">Selecione...</option>
                            ${CONFIG.FORMAS_PAGAMENTO.map(forma => `
                                <option value="${forma}">${forma}</option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="campo">
                        <label for="observacoes">Observações</label>
                        <textarea id="observacoes" name="observacoes" rows="4"></textarea>
                    </div>

                    <div class="acoes-formulario">
                        <button type="button" class="btn-secundario" onclick="app.financeiro.cancelarEdicao()">Cancelar</button>
                        <button type="submit" class="btn-primario">Registrar</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        const form = document.getElementById('form-pagamento');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarPagamento();
            });

            // Atualiza valor quando seleciona serviço
            const servicoSelect = form.querySelector('#servico');
            servicoSelect.addEventListener('change', () => {
                const servicoId = parseInt(servicoSelect.value);
                const servico = this.servicos.find(s => s.id === servicoId);
                if (servico) {
                    form.querySelector('#valor').value = servico.valor;
                }
            });
        }
    }

    // Abre formulário para novo pagamento
    novoPagamento() {
        const container = document.getElementById('conteudo-pagina');
        container.innerHTML = this.renderizarFormulario();
        this.inicializarEventos();
    }

    // Salva pagamento
    salvarPagamento() {
        const form = document.getElementById('form-pagamento');
        const dados = {
            id: Date.now(),
            clienteId: parseInt(form.querySelector('#cliente').value),
            servicoId: parseInt(form.querySelector('#servico').value),
            valor: parseFloat(form.querySelector('#valor').value),
            data: form.querySelector('#data').value,
            formaPagamento: form.querySelector('#formaPagamento').value,
            observacoes: form.querySelector('#observacoes').value
        };

        this.pagamentos.push(dados);
        Storage.salvar(CONFIG.STORAGE_KEYS.FINANCEIRO, this.pagamentos);
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Exclui pagamento
    excluirPagamento(id) {
        if (confirm('Tem certeza que deseja excluir este pagamento?')) {
            this.pagamentos = this.pagamentos.filter(p => p.id !== id);
            Storage.salvar(CONFIG.STORAGE_KEYS.FINANCEIRO, this.pagamentos);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Aplica filtros
    filtrar() {
        const filtros = {
            dataInicio: document.getElementById('filtro-data-inicio').value,
            dataFim: document.getElementById('filtro-data-fim').value,
            formaPagamento: document.getElementById('filtro-forma-pagamento').value
        };

        const container = document.getElementById('financeiro-lista');
        container.innerHTML = this.renderizarLista(filtros);
    }

    // Cancela edição e volta para lista
    cancelarEdicao() {
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Calcula total por período
    calcularTotalPeriodo(periodo) {
        const hoje = new Date();
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay()));
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

        let pagamentosFiltrados = [...this.pagamentos];

        switch (periodo) {
            case 'hoje':
                pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                    new Date(p.data).toDateString() === new Date().toDateString()
                );
                break;
            case 'semana':
                pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                    new Date(p.data) >= inicioSemana
                );
                break;
            case 'mes':
                pagamentosFiltrados = pagamentosFiltrados.filter(p => 
                    new Date(p.data) >= inicioMes
                );
                break;
        }

        return pagamentosFiltrados.reduce((total, p) => total + p.valor, 0);
    }

    // Formata data para exibição
    formatarData(data) {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Formata valor para exibição
    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Adiciona o módulo financeiro à aplicação
App.prototype.financeiro = new Financeiro();
App.prototype.carregarFinanceiro = function(container) {
    this.financeiro.renderizar(container);
}; 
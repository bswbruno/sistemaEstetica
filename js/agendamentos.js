// Classe para gerenciamento de agendamentos
class Agendamentos {
    constructor() {
        this.agendamentos = Storage.carregar(CONFIG.STORAGE_KEYS.AGENDAMENTOS) || [];
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
    }

    // Renderiza a página de agendamentos
    renderizar(container) {
        container.innerHTML = `
            <div class="agendamentos-container">
                <div class="filtros">
                    <div class="campo">
                        <label for="filtro-data">Data</label>
                        <input type="date" id="filtro-data" onchange="app.agendamentos.filtrar()">
                    </div>
                    <div class="campo">
                        <label for="filtro-cliente">Cliente</label>
                        <select id="filtro-cliente" onchange="app.agendamentos.filtrar()">
                            <option value="">Todos</option>
                            ${this.clientes.map(cliente => `
                                <option value="${cliente.id}">${cliente.nome}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="campo">
                        <label for="filtro-status">Status</label>
                        <select id="filtro-status" onchange="app.agendamentos.filtrar()">
                            <option value="">Todos</option>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.AGENDADO}">Agendado</option>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.CONCLUIDO}">Concluído</option>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.CANCELADO}">Cancelado</option>
                        </select>
                    </div>
                </div>

                <div class="agendamentos-lista" id="agendamentos-lista">
                    ${this.renderizarLista()}
                </div>
            </div>
        `;
    }

    // Renderiza a lista de agendamentos
    renderizarLista(filtros = {}) {
        let agendamentosFiltrados = [...this.agendamentos];

        // Aplica filtros
        if (filtros.data) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => 
                a.data === filtros.data
            );
        }
        if (filtros.clienteId) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => 
                a.clienteId === parseInt(filtros.clienteId)
            );
        }
        if (filtros.status) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => 
                a.status === filtros.status
            );
        }

        if (agendamentosFiltrados.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">event</span>
                    <p>Nenhum agendamento encontrado</p>
                </div>
            `;
        }

        return `
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Cliente</th>
                            <th>Serviço</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${agendamentosFiltrados.map(agendamento => {
                            const cliente = this.clientes.find(c => c.id === agendamento.clienteId);
                            const servico = this.servicos.find(s => s.id === agendamento.servicoId);
                            return `
                                <tr>
                                    <td>${this.formatarDataHora(agendamento.data, agendamento.hora)}</td>
                                    <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                    <td>${servico ? servico.nome : 'Serviço não encontrado'}</td>
                                    <td>
                                        <span class="status-badge ${agendamento.status.toLowerCase()}">
                                            ${agendamento.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-acao" onclick="app.agendamentos.editarAgendamento(${agendamento.id})">
                                            <span class="material-icons">edit</span>
                                        </button>
                                        <button class="btn-acao" onclick="app.agendamentos.alterarStatus(${agendamento.id})">
                                            <span class="material-icons">update</span>
                                        </button>
                                        <button class="btn-acao" onclick="app.agendamentos.excluirAgendamento(${agendamento.id})">
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

    // Renderiza o formulário de agendamento
    renderizarFormulario(agendamento = null) {
        const isEdicao = agendamento !== null;
        const titulo = isEdicao ? 'Editar Agendamento' : 'Novo Agendamento';

        // Atualiza as listas de clientes e serviços
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];

        return `
            <div class="formulario-container">
                <h3>${titulo}</h3>
                <form id="form-agendamento" class="formulario">
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
                        <label for="data">Data</label>
                        <input type="date" id="data" name="data" required value="${agendamento?.data || ''}">
                    </div>

                    <div class="campo">
                        <label for="hora">Hora</label>
                        <input type="time" id="hora" name="hora" required value="${agendamento?.hora || ''}">
                    </div>

                    <div class="campo">
                        <label for="status">Status</label>
                        <select id="status" name="status" required>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.AGENDADO}" ${agendamento?.status === CONFIG.STATUS_AGENDAMENTO.AGENDADO ? 'selected' : ''}>
                                Agendado
                            </option>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.CONCLUIDO}" ${agendamento?.status === CONFIG.STATUS_AGENDAMENTO.CONCLUIDO ? 'selected' : ''}>
                                Concluído
                            </option>
                            <option value="${CONFIG.STATUS_AGENDAMENTO.CANCELADO}" ${agendamento?.status === CONFIG.STATUS_AGENDAMENTO.CANCELADO ? 'selected' : ''}>
                                Cancelado
                            </option>
                        </select>
                    </div>

                    <div class="campo">
                        <label for="observacoes">Observações</label>
                        <textarea id="observacoes" name="observacoes" rows="4">${agendamento?.observacoes || ''}</textarea>
                    </div>

                    <div class="acoes-formulario">
                        <button type="button" class="btn-secundario" onclick="app.agendamentos.cancelarEdicao()">Cancelar</button>
                        <button type="submit" class="btn-primario">${isEdicao ? 'Salvar' : 'Agendar'}</button>
                    </div>
                </form>
            </div>
        `;
    }

    // Inicializa eventos
    inicializarEventos() {
        const form = document.getElementById('form-agendamento');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarAgendamento();
            });
        }
    }

    // Abre formulário para novo agendamento
    novoAgendamento() {
        const container = document.getElementById('conteudo-pagina');
        container.innerHTML = this.renderizarFormulario();
        this.inicializarEventos();
    }

    // Abre formulário para editar agendamento
    editarAgendamento(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (agendamento) {
            const container = document.getElementById('conteudo-pagina');
            container.innerHTML = this.renderizarFormulario(agendamento);
            this.inicializarEventos();
        }
    }

    // Salva agendamento (novo ou edição)
    salvarAgendamento() {
        const form = document.getElementById('form-agendamento');
        const id = form.querySelector('#agendamento-id').value;
        const dados = {
            id: id ? parseInt(id) : Date.now(),
            clienteId: parseInt(form.querySelector('#cliente').value),
            servicoId: parseInt(form.querySelector('#servico').value),
            data: form.querySelector('#data').value,
            hora: form.querySelector('#hora').value,
            status: form.querySelector('#status').value,
            observacoes: form.querySelector('#observacoes').value
        };

        if (id) {
            const index = this.agendamentos.findIndex(a => a.id === parseInt(id));
            this.agendamentos[index] = dados;
        } else {
            this.agendamentos.push(dados);
        }

        Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos);
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Exclui agendamento
    excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            this.agendamentos = this.agendamentos.filter(a => a.id !== id);
            Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Altera status do agendamento
    alterarStatus(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (agendamento) {
            const statusAtual = agendamento.status;
            let novoStatus;

            switch (statusAtual) {
                case CONFIG.STATUS_AGENDAMENTO.AGENDADO:
                    novoStatus = CONFIG.STATUS_AGENDAMENTO.CONCLUIDO;
                    break;
                case CONFIG.STATUS_AGENDAMENTO.CONCLUIDO:
                    novoStatus = CONFIG.STATUS_AGENDAMENTO.CANCELADO;
                    break;
                default:
                    novoStatus = CONFIG.STATUS_AGENDAMENTO.AGENDADO;
            }

            agendamento.status = novoStatus;
            Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos);
            this.renderizar(document.getElementById('conteudo-pagina'));
        }
    }

    // Aplica filtros
    filtrar() {
        const filtros = {
            data: document.getElementById('filtro-data').value,
            clienteId: document.getElementById('filtro-cliente').value,
            status: document.getElementById('filtro-status').value
        };

        const container = document.getElementById('agendamentos-lista');
        container.innerHTML = this.renderizarLista(filtros);
    }

    // Cancela edição e volta para lista
    cancelarEdicao() {
        this.renderizar(document.getElementById('conteudo-pagina'));
    }

    // Formata data e hora para exibição
    formatarDataHora(data, hora) {
        if (!data) return '';
        const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
        return `${dataFormatada} ${hora}`;
    }

    // Formata valor para exibição
    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Adiciona o módulo de agendamentos à aplicação
App.prototype.agendamentos = new Agendamentos();
App.prototype.carregarAgendamentos = function(container) {
    this.agendamentos.renderizar(container);
}; 
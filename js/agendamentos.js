// Classe para gerenciamento de agendamentos
class Agendamentos {
    constructor() {
        this.agendamentos = Storage.carregar(CONFIG.STORAGE_KEYS.AGENDAMENTOS) || [];
        this.clientes = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES) || [];
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
        this.inicializarEventos();
    }

    inicializarEventos() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-novo-agendamento')) {
                this.abrirFormulario();
            } else if (e.target.matches('.btn-salvar-agendamento')) {
                this.salvarAgendamento();
            } else if (e.target.matches('.btn-cancelar-agendamento')) {
                this.fecharFormulario();
            } else if (e.target.matches('.btn-editar-agendamento') || e.target.closest('.btn-editar-agendamento')) {
                const button = e.target.matches('.btn-editar-agendamento') ? e.target : e.target.closest('.btn-editar-agendamento');
                const id = button.dataset.id;
                this.editarAgendamento(id);
            } else if (e.target.matches('.btn-excluir-agendamento') || e.target.closest('.btn-excluir-agendamento')) {
                const button = e.target.matches('.btn-excluir-agendamento') ? e.target : e.target.closest('.btn-excluir-agendamento');
                const id = button.dataset.id;
                this.excluirAgendamento(id);
            } else if (e.target.matches('.btn-concluir-agendamento') || e.target.closest('.btn-concluir-agendamento')) {
                const button = e.target.matches('.btn-concluir-agendamento') ? e.target : e.target.closest('.btn-concluir-agendamento');
                const id = button.dataset.id;
                this.concluirAgendamento(id);
            }
        });
    }

    renderizar(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2>Agendamentos</h2>
                <button class="btn btn-primary btn-novo-agendamento">
                    <i class="material-icons">add</i>
                    Novo Agendamento
                </button>
            </div>

            <div class="agendamentos-container">
                <div class="agendamentos-lista">
                    <table>
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
                            ${this.agendamentos.map(agendamento => `
                                <tr>
                                    <td>${this.formatarDataHora(agendamento.dataHora)}</td>
                                    <td>${this.getNomeCliente(agendamento.clienteId)}</td>
                                    <td>${this.getNomeServico(agendamento.servicoId)}</td>
                                    <td>
                                        <span class="status-badge ${agendamento.status.toLowerCase()}">
                                            ${agendamento.status}
                                        </span>
                                    </td>
                                    <td>
                                        ${agendamento.status !== 'Concluído' ? `
                                            <button class="btn-icon btn-concluir-agendamento" data-id="${agendamento.id}" title="Marcar como concluído">
                                                <i class="material-icons">check_circle</i>
                                            </button>
                                        ` : ''}
                                        <button class="btn-icon btn-editar-agendamento" data-id="${agendamento.id}" title="Editar">
                                            <i class="material-icons">edit</i>
                                        </button>
                                        <button class="btn-icon btn-excluir-agendamento" data-id="${agendamento.id}" title="Excluir">
                                            <i class="material-icons">delete</i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="agendamento-form" style="display: none;">
                    <h3>Cadastrar Agendamento</h3>
                    <form id="formAgendamento">
                        <input type="hidden" id="agendamentoId">
                        <div class="form-group">
                            <label for="clienteId">Cliente</label>
                            <select id="clienteId" required>
                                <option value="">Selecione um cliente</option>
                                ${this.clientes.map(cliente => 
                                    `<option value="${cliente.id}">${cliente.nome}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="servicoId">Serviço</label>
                            <select id="servicoId" required>
                                <option value="">Selecione um serviço</option>
                                ${this.servicos.map(servico => 
                                    `<option value="${servico.id}">${servico.nome} - ${servico.duracao}min - R$ ${servico.valor.toFixed(2)}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dataHora">Data e Hora</label>
                            <input type="datetime-local" id="dataHora" required>
                        </div>
                        <div class="form-group">
                            <label for="status">Status</label>
                            <select id="status" required>
                                ${Object.values(CONFIG.STATUS_AGENDAMENTO).map(status => 
                                    `<option value="${status}">${status}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="observacoes">Observações</label>
                            <textarea id="observacoes" rows="4"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary btn-cancelar-agendamento">Cancelar</button>
                            <button type="button" class="btn btn-primary btn-salvar-agendamento">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    abrirFormulario() {
        const lista = document.querySelector('.agendamentos-lista');
        const formulario = document.querySelector('.agendamento-form');
        
        if (lista && formulario) {
            lista.style.display = 'none';
            formulario.style.display = 'block';
            document.getElementById('formAgendamento').reset();
            document.getElementById('agendamentoId').value = '';
        }
    }

    fecharFormulario() {
        const lista = document.querySelector('.agendamentos-lista');
        const formulario = document.querySelector('.agendamento-form');
        
        if (lista && formulario) {
            lista.style.display = 'block';
            formulario.style.display = 'none';
        }
    }

    salvarAgendamento() {
        const form = document.getElementById('formAgendamento');
        if (!form) return;

        const agendamentoId = document.getElementById('agendamentoId').value;
        const agendamento = {
            id: agendamentoId || Date.now().toString(),
            clienteId: document.getElementById('clienteId').value,
            servicoId: document.getElementById('servicoId').value,
            dataHora: document.getElementById('dataHora').value,
            status: document.getElementById('status').value,
            observacoes: document.getElementById('observacoes').value,
            dataCadastro: agendamentoId ? this.agendamentos.find(a => a.id === agendamentoId)?.dataCadastro : new Date().toISOString()
        };

        if (agendamentoId) {
            const index = this.agendamentos.findIndex(a => a.id === agendamentoId);
            if (index !== -1) {
                this.agendamentos[index] = agendamento;
            }
        } else {
            this.agendamentos.push(agendamento);
        }

        if (Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos)) {
            this.fecharFormulario();
            this.renderizar(document.querySelector('.main-content'));
            alert('Agendamento salvo com sucesso!');
        } else {
            alert('Erro ao salvar agendamento. Tente novamente.');
        }
    }

    editarAgendamento(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (!agendamento) return;

        const lista = document.querySelector('.agendamentos-lista');
        const formulario = document.querySelector('.agendamento-form');
        
        if (lista && formulario) {
            lista.style.display = 'none';
            formulario.style.display = 'block';

            document.getElementById('agendamentoId').value = agendamento.id;
            document.getElementById('clienteId').value = agendamento.clienteId;
            document.getElementById('servicoId').value = agendamento.servicoId;
            document.getElementById('dataHora').value = agendamento.dataHora;
            document.getElementById('status').value = agendamento.status;
            document.getElementById('observacoes').value = agendamento.observacoes || '';
        }
    }

    concluirAgendamento(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (!agendamento) return;

        if (confirm('Deseja marcar este agendamento como concluído?')) {
            agendamento.status = 'Concluído';
            if (Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos)) {
                this.renderizar(document.querySelector('.main-content'));
                alert('Agendamento marcado como concluído!');
            } else {
                alert('Erro ao atualizar agendamento. Tente novamente.');
            }
        }
    }

    excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            this.agendamentos = this.agendamentos.filter(a => a.id !== id);
            if (Storage.salvar(CONFIG.STORAGE_KEYS.AGENDAMENTOS, this.agendamentos)) {
                this.renderizar(document.querySelector('.main-content'));
                alert('Agendamento excluído com sucesso!');
            } else {
                alert('Erro ao excluir agendamento. Tente novamente.');
            }
        }
    }

    getNomeCliente(clienteId) {
        const cliente = this.clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    }

    getNomeServico(servicoId) {
        const servico = this.servicos.find(s => s.id === servicoId);
        return servico ? servico.nome : 'Serviço não encontrado';
    }

    formatarDataHora(dataHora) {
        if (!dataHora) return '-';
        const data = new Date(dataHora);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Adiciona o módulo de agendamentos à aplicação
App.prototype.agendamentos = new Agendamentos();
App.prototype.carregarAgendamentos = function(container) {
    this.agendamentos.renderizar(container);
}; 
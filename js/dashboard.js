// Classe para gerenciamento do Dashboard
class Dashboard {
    constructor() {
        this.agendamentos = Storage.carregar(CONFIG.STORAGE_KEYS.AGENDAMENTOS) || [];
        this.servicos = Storage.carregar(CONFIG.STORAGE_KEYS.SERVICOS) || [];
        this.financeiro = Storage.carregar(CONFIG.STORAGE_KEYS.FINANCEIRO) || [];
    }

    // Renderiza a página do Dashboard
    renderizar(container) {
        container.innerHTML = `
            <div class="dashboard-container">
                <div class="resumo-cards">
                    <div class="card">
                        <span class="material-icons">event</span>
                        <div class="card-info">
                            <h4>Agendamentos Hoje</h4>
                            <p>${this.getAgendamentosHoje()}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">payments</span>
                        <div class="card-info">
                            <h4>Faturamento Mensal</h4>
                            <p>${this.formatarValor(this.getFaturamentoMensal())}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">people</span>
                        <div class="card-info">
                            <h4>Total de Clientes</h4>
                            <p>${this.getTotalClientes()}</p>
                        </div>
                    </div>
                    <div class="card">
                        <span class="material-icons">miscellaneous_services</span>
                        <div class="card-info">
                            <h4>Serviços Realizados</h4>
                            <p>${this.getServicosRealizados()}</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h3>Próximos Agendamentos</h3>
                        <div class="tabela-container">
                            ${this.renderizarProximosAgendamentos()}
                        </div>
                    </div>

                    <div class="dashboard-card">
                        <h3>Últimos Pagamentos</h3>
                        <div class="tabela-container">
                            ${this.renderizarUltimosPagamentos()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderiza próximos agendamentos
    renderizarProximosAgendamentos() {
        const hoje = new Date();
        const agendamentosFuturos = this.agendamentos
            .filter(a => new Date(a.data) >= hoje && a.status === CONFIG.STATUS_AGENDAMENTO.AGENDADO)
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5);

        if (agendamentosFuturos.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">event</span>
                    <p>Nenhum agendamento futuro</p>
                </div>
            `;
        }

        return `
            <table class="tabela">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Cliente</th>
                        <th>Serviço</th>
                    </tr>
                </thead>
                <tbody>
                    ${agendamentosFuturos.map(agendamento => {
                        const cliente = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES)
                            .find(c => c.id === agendamento.clienteId);
                        const servico = this.servicos.find(s => s.id === agendamento.servicoId);
                        return `
                            <tr>
                                <td>${this.formatarDataHora(agendamento.data, agendamento.hora)}</td>
                                <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                <td>${servico ? servico.nome : 'Serviço não encontrado'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Renderiza últimos pagamentos
    renderizarUltimosPagamentos() {
        const pagamentos = [...this.financeiro]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        if (pagamentos.length === 0) {
            return `
                <div class="sem-dados">
                    <span class="material-icons">payments</span>
                    <p>Nenhum pagamento registrado</p>
                </div>
            `;
        }

        return `
            <table class="tabela">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${pagamentos.map(pagamento => {
                        const cliente = Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES)
                            .find(c => c.id === pagamento.clienteId);
                        return `
                            <tr>
                                <td>${this.formatarData(pagamento.data)}</td>
                                <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                <td>${this.formatarValor(pagamento.valor)}</td>
                                <td>
                                    <span class="status-badge ${pagamento.status.toLowerCase()}">
                                        ${pagamento.status}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    // Obtém agendamentos do dia
    getAgendamentosHoje() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.agendamentos.filter(a => a.data === hoje).length;
    }

    // Obtém faturamento mensal
    getFaturamentoMensal() {
        const mesAtual = new Date().getMonth();
        const anoAtual = new Date().getFullYear();
        
        return this.financeiro
            .filter(p => {
                const data = new Date(p.data);
                return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
            })
            .reduce((total, p) => total + p.valor, 0);
    }

    // Obtém total de clientes
    getTotalClientes() {
        return Storage.carregar(CONFIG.STORAGE_KEYS.CLIENTES).length;
    }

    // Obtém serviços realizados
    getServicosRealizados() {
        return this.agendamentos.filter(a => a.status === CONFIG.STATUS_AGENDAMENTO.CONCLUIDO).length;
    }

    // Formata data
    formatarData(data) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Formata data e hora
    formatarDataHora(data, hora) {
        return `${this.formatarData(data)} ${hora}`;
    }

    // Formata valor
    formatarValor(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
}

// Adiciona o módulo de dashboard à aplicação
App.prototype.dashboard = new Dashboard();
App.prototype.carregarDashboard = function(container) {
    this.dashboard.renderizar(container);
}; 
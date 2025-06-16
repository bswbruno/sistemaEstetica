// Configurações do sistema
const CONFIG = {
    // Chaves do localStorage
    STORAGE_KEYS: {
        CLIENTES: 'sistema_estetica_clientes',
        AGENDAMENTOS: 'sistema_estetica_agendamentos',
        SERVICOS: 'sistema_estetica_servicos',
        PAGAMENTOS: 'sistema_estetica_pagamentos',
        CONFIGURACOES: 'sistema_estetica_configuracoes',
        ESTOQUE: 'sistema_estetica_estoque'
    },

    // Configurações padrão
    DEFAULT_CONFIG: {
        tema: 'claro',
        nomeEstabelecimento: 'Sistema Estética',
        endereco: '',
        telefone: '',
        email: '',
        horarioAbertura: '09:00',
        horarioFechamento: '18:00',
        intervaloAgendamento: 30
    },

    // Status de agendamentos
    STATUS_AGENDAMENTO: {
        AGENDADO: 'Agendado',
        CONFIRMADO: 'Confirmado',
        CANCELADO: 'Cancelado',
        CONCLUIDO: 'Concluído',
        FALTOU: 'Faltou'
    },

    // Categorias de serviços
    CATEGORIAS_SERVICOS: [
        'Facial',
        'Corporal',
        'Massagem',
        'Depilação',
        'Manicure/Pedicure',
        'Outros'
    ],

    // Formas de pagamento
    FORMAS_PAGAMENTO: [
        'Dinheiro',
        'Cartão de Crédito',
        'Cartão de Débito',
        'PIX',
        'Transferência'
    ]
};

// Classe para gerenciamento do armazenamento
class Storage {
    static salvar(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
            return true;
        } catch (erro) {
            console.error('Erro ao salvar dados:', erro);
            return false;
        }
    }

    static carregar(chave) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : null;
        } catch (erro) {
            console.error('Erro ao carregar dados:', erro);
            return null;
        }
    }

    static limpar(chave) {
        try {
            localStorage.removeItem(chave);
            return true;
        } catch (erro) {
            console.error('Erro ao limpar dados:', erro);
            return false;
        }
    }
} 
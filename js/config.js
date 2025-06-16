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
        nomeEstudio: 'Meu Estúdio de Estética',
        telefone: '',
        endereco: '',
        tema: 'claro',
        cores: {
            primaria: '#FF69B4',
            secundaria: '#E6A4E6'
        }
    },

    // Status de agendamento
    STATUS_AGENDAMENTO: {
        AGENDADO: 'Agendado',
        CONCLUIDO: 'Concluído',
        CANCELADO: 'Cancelado'
    },

    // Categorias de serviços
    CATEGORIAS_SERVICOS: [
        'Facial',
        'Corporal',
        'Depilação',
        'Massagem',
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

// Funções de utilidade para localStorage
const Storage = {
    salvar: (chave, dados) => {
        localStorage.setItem(chave, JSON.stringify(dados));
    },

    carregar: (chave) => {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : null;
    },

    remover: (chave) => {
        localStorage.removeItem(chave);
    },

    limpar: () => {
        localStorage.clear();
    }
}; 
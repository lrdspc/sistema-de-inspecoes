import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface Cliente {
  id: string;
  nome: string;
  documento: string; // CPF ou CNPJ
  tipo: 'residencial' | 'comercial' | 'industrial' | 'outro';
  tipoCustomizado?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number;
  longitude?: number;
  telefone: string;
  email?: string;
  responsavel?: string;
  telefoneSec?: string;
  observacoes?: string;
  dataCriacao: number;
  dataModificacao: number;
  sincronizado: boolean;
}

interface Vistoria {
  id: string;
  clienteId: string;
  data: number; // timestamp
  protocolo: string;
  tecnicoId: string;
  departamento: string;
  unidadeRegional: string;
  coordenadorId?: string;
  gerenteId?: string;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada';
  assunto: string;
  modeloTelha?: string;
  espessura?: string;
  tecnologia?: string;
  quantidadeTelhas?: number;
  areaCoberta?: number;
  naoConformidades?: NaoConformidade[];
  observacoes?: string;
  fotos?: string[];
  assinaturaTecnico?: string;
  assinaturaCliente?: string;
  relatorioId?: string;
  dataCriacao: number;
  dataModificacao: number;
  sincronizado: boolean;
}

interface NaoConformidade {
  id: string;
  vistoriaId: string;
  tipo: string;
  descricao: string;
  confirmada: boolean;
  observacoes?: string;
  fotos?: string[]; // Array of base64 encoded images
  dataCriacao: number;
  dataModificacao: number;
  sincronizado: boolean;
}

interface Relatorio {
  id: string;
  vistoriaId: string;
  titulo: string;
  introducao: string;
  analiseTecnica: string;
  conclusao: string;
  parecerFinal: 'procedente' | 'improcedente' | 'parcialmente_procedente';
  dataFinalizacao?: number;
  dataCriacao: number;
  dataModificacao: number;
  sincronizado: boolean;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  unidadeRegional: string;
  fotoPerfil?: string;
  token?: string;
  refreshToken?: string;
  tokenExpiracao?: number;
  ultimoLogin?: number;
}

interface SincronizacaoItem {
  id: string;
  tabela: string;
  operacao: 'inserir' | 'atualizar' | 'remover';
  dados: any;
  tentativas: number;
  dataModificacao: number;
  erro?: string;
}

interface BrasilitDB extends DBSchema {
  clientes: {
    key: string;
    value: Cliente;
    indexes: {
      por_nome: string;
      por_cidade: string;
      por_sincronizado: boolean;
    };
  };
  vistorias: {
    key: string;
    value: Vistoria;
    indexes: {
      por_cliente: string;
      por_data: number;
      por_status: string;
      por_tecnico: string;
      por_sincronizado: boolean;
    };
  };
  naoConformidades: {
    key: string;
    value: NaoConformidade;
    indexes: {
      por_vistoria: string;
      por_sincronizado: boolean;
    };
  };
  relatorios: {
    key: string;
    value: Relatorio;
    indexes: {
      por_vistoria: string;
      por_sincronizado: boolean;
    };
  };
  usuarios: {
    key: string;
    value: Usuario;
    indexes: {
      por_email: string;
    };
  };
  sincronizacao: {
    key: string;
    value: SincronizacaoItem;
    indexes: {
      por_tabela: string;
      por_data: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<BrasilitDB>> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<BrasilitDB>('brasilit-inspecoes', 1, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Clientes
        if (!db.objectStoreNames.contains('clientes')) {
          const clientesStore = db.createObjectStore('clientes', {
            keyPath: 'id',
          });
          clientesStore.createIndex('por_nome', 'nome');
          clientesStore.createIndex('por_cidade', 'cidade');
          clientesStore.createIndex('por_sincronizado', 'sincronizado');
        }

        // Vistorias
        if (!db.objectStoreNames.contains('vistorias')) {
          const vistoriasStore = db.createObjectStore('vistorias', {
            keyPath: 'id',
          });
          vistoriasStore.createIndex('por_cliente', 'clienteId');
          vistoriasStore.createIndex('por_data', 'data');
          vistoriasStore.createIndex('por_status', 'status');
          vistoriasStore.createIndex('por_tecnico', 'tecnicoId');
          vistoriasStore.createIndex('por_sincronizado', 'sincronizado');
        }

        // Não Conformidades
        if (!db.objectStoreNames.contains('naoConformidades')) {
          const ncStore = db.createObjectStore('naoConformidades', {
            keyPath: 'id',
          });
          ncStore.createIndex('por_vistoria', 'vistoriaId');
          ncStore.createIndex('por_sincronizado', 'sincronizado');
        }

        // Relatórios
        if (!db.objectStoreNames.contains('relatorios')) {
          const relatoriosStore = db.createObjectStore('relatorios', {
            keyPath: 'id',
          });
          relatoriosStore.createIndex('por_vistoria', 'vistoriaId');
          relatoriosStore.createIndex('por_sincronizado', 'sincronizado');
        }

        // Usuários
        if (!db.objectStoreNames.contains('usuarios')) {
          const usuariosStore = db.createObjectStore('usuarios', {
            keyPath: 'id',
          });
          usuariosStore.createIndex('por_email', 'email');
        }

        // Sincronização
        // Removido sistema de sincronização
      },
    });
  }

  return dbPromise;
};

export const getDB = async () => {
  if (!dbPromise) {
    return initDB();
  }
  return dbPromise;
};

// Export types for use throughout the application
export type {
  Cliente,
  Vistoria,
  NaoConformidade,
  Relatorio,
  Usuario,
  SincronizacaoItem,
};

export interface Usuario {
    id?: number;
    nome: string;
    email: string;
    senha?: string;
    cpf?: string;
    role: 'ROLE_ALUNO' | 'ROLE_PROFESSOR' | 'ROLE_ADMINISTRADOR';
  }
  
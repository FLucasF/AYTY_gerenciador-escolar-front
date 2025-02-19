export interface Administrador {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  setor: string;
  tipo: 'administrador';
}

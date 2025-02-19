import { Turma } from './turma.model';

export interface Aluno {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  curso: string;
  turmas?: Turma[];
  tipo: 'aluno';
}

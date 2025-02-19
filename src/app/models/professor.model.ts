import { Turma } from './turma.model';

export interface Professor {
  id?: number;
  nome: string;
  email: string;
  senha: string;
  departamento: string;
  turmas?: Turma[];
  tipo: 'professor';
}

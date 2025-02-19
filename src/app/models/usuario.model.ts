import { Administrador } from './administrador.model';
import { Professor } from './professor.model';
import { Aluno } from './aluno.model';

export type Usuario = Administrador | Professor | Aluno;

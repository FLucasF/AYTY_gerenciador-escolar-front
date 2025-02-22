import { Usuario } from "./usuario.model";
import { Turma } from "./turma.model";

export interface Aluno extends Usuario {
  curso: string;
  turmas?: Turma[];
}

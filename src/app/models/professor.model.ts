import { Usuario } from "./usuario.model";
import { Turma } from "./turma.model";

export interface Professor extends Usuario {
  departamento: string;
  siape: string;
  turmas?: Turma[];
}

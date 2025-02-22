import { Usuario } from "./usuario.model";

export interface Administrador extends Usuario {
  setor: string;
  siape: string;
}

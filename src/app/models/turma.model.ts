export interface Turma {
  id: number;
  nome: string;
  codigo?: string;
  semestre?: string;
  professorId?: number | null;
  alunos?: number[];
}

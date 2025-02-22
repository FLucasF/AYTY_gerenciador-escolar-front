export interface Turma {
  id: number;
  nome: string;
  codigo?: string;
  semestre?: string;
  professorId?: number | null;  // Indica explicitamente que pode ser null
  professorNome?: string;  // Opcional: já armazenar o nome do professor
  alunos?: number[];
}

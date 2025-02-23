export interface Turma {
  id: number;
  nome: string;
  codigo?: string;
  semestre?: string;
  professorId?: number | null;  // Agora tratamos como ID
  alunos?: number[];  // Lista de IDs dos alunos
}

export class Page<T> {
  content: Array<T> = [];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  } = { size: 10, number: 0, totalElements: 0, totalPages: 0 };
}

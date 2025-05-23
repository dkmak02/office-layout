export type Project ={
  id: number;
  code: string;
  name: string;
  color: string;
  taken: number;
  total: number;
  visibility: boolean;
}
export type SelectedProject = string | null;

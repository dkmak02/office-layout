export interface Project {
  id: number;
  code: string;
  name: string;
  color: string;
  taken: number;
  total: number;
}
export type SelectedProject = string | null;
export interface Project {
  code: string;
  name: string;
  color: string;
  taken: number;
  total: number;
}
export type SelectedProject = string | null;
export interface ProjectNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: ProjectNode[];
}

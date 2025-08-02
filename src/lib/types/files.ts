export type TreeItem = {
    id: string;
    name: string;
    type: 'folder' | 'file';
    hasChildren: boolean;
   };
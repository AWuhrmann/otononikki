export type TreeItem = {
    id: string;
    name: string;
    path: string;
    type: 'folder' | 'file';
    hasChildren: boolean;
    folderCategry?: string | null;
   };
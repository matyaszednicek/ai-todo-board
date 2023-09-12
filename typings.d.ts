interface Board {
  columns: Map<TypedColumn, Column>;
}

type TypedColumn = 'todo' | 'inprogress' | 'done';

interface Column {
  id: TypedColumn;
  todos: Todo[];
}

interface Todo {
  $id: string;
  $createdAt: string;
  title: string;
  status: TypedColumn;
  image?: Image | null;
}

interface Image {
  bucketId: string;
  fileId: string;
}

interface AIResponse {
  error?: string;
  action: string;
  column: string;
  title: string;
}

type AlertType = 'success' | 'danger' | 'warn';

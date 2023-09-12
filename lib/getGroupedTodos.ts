import { databases } from '@/appwrite';

export const getGroupedTodos = async () => {
  const data = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID!
  );

  const todos = data.documents;

  const columns = todos.reduce((columns, todo) => {
    if (!columns.get(todo.status)) {
      columns.set(todo.status, {
        id: todo.status,
        todos: [],
      });
    }

    columns.get(todo.status)!.todos.push({
      $id: todo.$id,
      $createdAt: todo.$createdAt,
      title: todo.title,
      status: todo.status,
      ...(todo.image && { image: JSON.parse(todo.image) }),
    });

    return columns;
  }, new Map<TypedColumn, Column>());

  const columnTypes: TypedColumn[] = ['todo', 'inprogress', 'done'];
  columnTypes.forEach((val) => {
    if (!columns.get(val)) {
      columns.set(val, {
        id: val,
        todos: [],
      });
    }
  });

  const sortedColumns = new Map(
    Array.from(columns.entries()).sort((a, b) => columnTypes.indexOf(a[0]) - columnTypes.indexOf(b[0]))
  );

  const board: Board = {
    columns: sortedColumns,
  };

  return board;
};

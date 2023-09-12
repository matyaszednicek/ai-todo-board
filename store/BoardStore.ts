import { ID, databases, storage } from '@/appwrite';
import { getGroupedTodos } from '@/lib/getGroupedTodos';
import uploadImage from '@/lib/uploadImage';
import { create } from 'zustand';

interface BoardState {
  board: Board;
  getBoard: () => void;
  setBoardState: (board: Board) => void;
  updateTodo: (todo: Todo, columnId: TypedColumn) => void;
  deleteTodo: (index: number, todoId: Todo, id: TypedColumn) => void;
  deleteAllInColumn: (column: TypedColumn) => void;
  addTodo: (todo: string, columnId: TypedColumn, image?: File | null) => void;

  newTodoInput: string;
  setNewTodoInput: (input: string) => void;
  newTodoType: TypedColumn;
  setNewTodoType: (type: TypedColumn) => void;
  image: File | null;
  setImage: (image: File | null) => void;

  searchString: string;
  setSearchString: (searchString: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumn, Column>(),
  },
  getBoard: async () => {
    const board = await getGroupedTodos();
    set({ board });
  },
  setBoardState: (board) => set({ board }),

  searchString: '',
  setSearchString: (searchString) => set({ searchString }),

  updateTodo: async (todo, columnId) => {
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
  deleteTodo: async (index: number, todo: Todo, id: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    newColumns.get(id)?.todos.splice(index, 1);
    set({ board: { columns: newColumns } });

    if (todo.image) {
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId);
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  deleteAllInColumn: async (column: TypedColumn) => {
    const newColumns = new Map(get().board.columns);

    const todos = newColumns.get(column)?.todos.map((todo) => todo.$id);
    newColumns.get(column)!.todos = [];

    set({ board: { columns: newColumns } });

    todos?.forEach(async (todoId) => {
      try {
        await databases.deleteDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID!,
          todoId
        );
      } catch (error: any) {
        console.log(error);
        console.log(error?.message);
      }
    });
  },
  addTodo: async (todo: string, columnId: TypedColumn, image?: File | null) => {
    let file: Image | undefined;

    if (image) {
      const fileUploaded = await uploadImage(image);
      if (fileUploaded) {
        file = {
          bucketId: fileUploaded.bucketId,
          fileId: fileUploaded.$id,
        };
      }
    }

    const { $id } = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_TODOS_COLLECTION_ID!,
      ID.unique(),
      {
        title: todo,
        status: columnId,
        ...(file && { image: JSON.stringify(file) }),
      }
    );

    set({ newTodoInput: '' });

    set((state) => {
      const newColumns = new Map(state.board.columns);

      const newTodo: Todo = {
        $id,
        $createdAt: new Date().toISOString(),
        title: todo,
        status: columnId,
        ...(file && { image: file }),
      };

      const column = newColumns.get(columnId);

      if (!column) {
        newColumns.set(columnId, {
          id: columnId,
          todos: [newTodo],
        });
      } else {
        newColumns.get(columnId)?.todos.push(newTodo);
      }

      return {
        board: {
          columns: newColumns,
        },
      };
    });
  },

  newTodoInput: '',
  setNewTodoInput: (input: string) => set({ newTodoInput: input }),
  newTodoType: 'todo',
  setNewTodoType: (type: TypedColumn) => set({ newTodoType: type }),
  image: null,
  setImage: (image: File | null) => set({ image }),
}));

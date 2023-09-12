import { create } from 'zustand';

interface AddModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}
interface RemoveModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  todo?: Todo;
  setTodo: (todo: Todo) => void;
  index: number;
  setIndex: (index: number) => void;
}
interface RemoveAllModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;

  column?: TypedColumn;
  setColumn: (column: TypedColumn) => void;
}

export const useAddTodoModalStore = create<AddModalState>()((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

export const useRemoveTodoModalStore = create<RemoveModalState>()((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),

  todo: undefined,
  setTodo: (todo: Todo) => set({ todo }),

  index: -1,
  setIndex: (index: number) => set({ index }),
}));

export const useRemoveAllModalStore = create<RemoveAllModalState>()((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),

  column: undefined,
  setColumn: (column: TypedColumn) => set({ column }),
}));

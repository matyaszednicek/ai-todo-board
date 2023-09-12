'use client';

import useTodoImagePreview from '@/hooks/useTodoImagePreview';
import { useRemoveTodoModalStore } from '@/store/ModalStore';
import { XCircleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from 'react-beautiful-dnd';

type Props = {
  todo: Todo;
  index: number;
  id: TypedColumn;
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
};

function TodoCard({ todo, index, id, innerRef, draggableProps, dragHandleProps }: Props) {
  const { imageUrl } = useTodoImagePreview(todo);
  const { openModal, setTodo, setIndex } = useRemoveTodoModalStore();

  const handleDeleteTodo = () => {
    setTodo(todo);
    setIndex(index);
    openModal();
  };

  return (
    <div
      {...draggableProps}
      {...dragHandleProps}
      ref={innerRef}
      className="space-y-2 bg-white rounded-md drop-shadow-md"
    >
      <div className="flex items-center justify-between p-5">
        <p>{todo.title}</p>
        <button type="button" onClick={handleDeleteTodo} className="text-red-500 hover:text-red-600">
          <XCircleIcon className="w-8 h-8 ml-5" />
        </button>
      </div>

      {imageUrl && (
        <div className="w-full h-full rounded-b-md">
          <Image
            src={imageUrl}
            alt={`${todo.title} - todo image`}
            width={400}
            height={200}
            className="object-contain w-full rounded-b-md"
          />
        </div>
      )}
    </div>
  );
}

export default TodoCard;

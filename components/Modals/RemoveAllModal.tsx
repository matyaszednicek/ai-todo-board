'use client';

import { Fragment, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRemoveAllModalStore } from '@/store/ModalStore';
import { useBoardStore } from '@/store/BoardStore';

function RemoveAllModal() {
  const { isOpen, closeModal, column } = useRemoveAllModalStore();
  const { deleteAllInColumn } = useBoardStore();

  const getColumnName: () => string = () => {
    if (column === 'todo') return 'To-Do';
    if (column === 'inprogress') return 'In Progress';
    if (column === 'done') return 'Done';
    return '';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    deleteAllInColumn(column!);

    closeModal();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="form" onSubmit={handleSubmit} className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title as="h3" className="pb-2 text-lg font-medium leading-6 text-gray-900">
                  Remove all Todos from {getColumnName()}
                </Dialog.Title>
                <div className="mt-2">Are you sure?</div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-red-900 bg-red-100 border border-transparent rounded-md hover:bg-red-200 focus:outline-none"
                  >
                    Remove Todos
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default RemoveAllModal;

'use client';

import Image from 'next/image';
import logo from '@/public/ai-todo-board-logo.png';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/solid';
import Avatar from 'react-avatar';
import { useBoardStore } from '@/store/BoardStore';
import { SparklesIcon as SparklesIconOutline } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useAddTodoModalStore, useRemoveAllModalStore, useRemoveTodoModalStore } from '@/store/ModalStore';
import { useAlertStore } from '@/store/AlertStore';

async function getAIReponse(aiInput: string): Promise<AIResponse> {
  const res = await fetch('/api/aiQuery', { method: 'POST', body: JSON.stringify({ message: aiInput }) });
  return res.json();
}

function Header() {
  const { showAlert, hideAlert, setType, setMessage } = useAlertStore();
  const { openModal: openAddModal } = useAddTodoModalStore();
  const { openModal: openRemoveModal, setIndex: setRemoveIndex, setTodo: setRemoveTodo } = useRemoveTodoModalStore();
  const { openModal: openRemoveAllModal, setColumn: setRemoveAllColumn } = useRemoveAllModalStore();
  const { searchString, setSearchString, setNewTodoInput, setNewTodoType, addTodo, updateTodo, board, setBoardState } =
    useBoardStore();
  const [aiInput, setAIInput] = useState('');
  const [aiHover, setAIHover] = useState(false);
  const [aiInputHover, setAIInputHover] = useState(false);
  const [aiLoading, setAILoading] = useState(false);

  const triggerAlert = (type: AlertType, message: string) => {
    setType(type);
    setMessage(message);
    showAlert();
    setTimeout(() => hideAlert(), 3000);
  };

  const handleAIError = (error: string) => {
    triggerAlert('danger', error);
  };

  const handleAddAction = (aiResponse: AIResponse) => {
    if (aiResponse.column && aiResponse.title) {
      addTodo(aiResponse.title, aiResponse.column as TypedColumn, null);
      triggerAlert('success', 'Todo successfully added!');
      return;
    }

    if (aiResponse.title) setNewTodoInput(aiResponse.title);
    if (aiResponse.column) setNewTodoType(aiResponse.column as TypedColumn);
    openAddModal();
  };
  const handleRemoveAction = (aiResponse: AIResponse) => {
    if (!aiResponse?.title) {
      handleAIError('Please specify which Todo to delete.');
      return;
    }

    let found = false;

    const columns = Array.from(board.columns.entries());
    columns.some((column) => {
      const columnToDeleteIndex = column[1].todos.findIndex((todo, index) => {
        return aiResponse.title.toLowerCase() === todo.title.toLowerCase();
      });

      if (columnToDeleteIndex != -1) {
        const todoToDelete = column[1].todos[columnToDeleteIndex];

        setRemoveIndex(columnToDeleteIndex);
        setRemoveTodo(todoToDelete);
        openRemoveModal();

        found = true;
        return true;
      }

      return false;
    });

    if (!found) handleAIError(`Todo "${aiResponse?.title}" not found!`);
  };
  const handleRemoveAllAction = (aiResponse: AIResponse) => {
    if (!aiResponse?.column) {
      handleAIError('Please provide which Todos should be deleted.');
      return;
    }

    if (!board.columns.get(aiResponse.column as TypedColumn)?.todos.length) {
      handleAIError('There are no Todos in ' + aiResponse?.column);
      return;
    }

    setRemoveAllColumn(aiResponse.column as TypedColumn);
    openRemoveAllModal();
  };
  const handleMoveAction = (aiResponse: AIResponse) => {
    if (!aiResponse?.column || !aiResponse?.title) {
      handleAIError('Please provide which Todo should be moved and where to.');
      return;
    }

    let found = false;

    const columns = Array.from(board.columns.entries());

    columns.some((column) => {
      const todoToMoveIndex = column[1].todos.findIndex(
        (todo, index) => aiResponse.title.toLowerCase() === todo.title.toLowerCase()
      );

      if (todoToMoveIndex != -1) {
        const todoToMove = column[1].todos[todoToMoveIndex];

        if (todoToMove.status === (aiResponse.column as TypedColumn)) {
          handleAIError(`Todo "${aiResponse.title}" is already in the correct column!`);
          found = true;
          return true;
        }

        const startColIndex = columns.findIndex((column) => column[0] === todoToMove.status);
        const startColTodos = columns[startColIndex][1].todos;
        startColTodos.splice(todoToMoveIndex, 1);

        const finishColIndex = columns.findIndex((column) => column[0] === (aiResponse.column as TypedColumn));
        const finishColTodos = columns[finishColIndex][1].todos;
        todoToMove.status = aiResponse.column as TypedColumn;
        finishColTodos.push(todoToMove);

        const newStartCol: Column = {
          id: todoToMove.status,
          todos: startColTodos,
        };
        const newFinishCol: Column = {
          id: aiResponse.column as TypedColumn,
          todos: finishColTodos,
        };

        const newColumns = new Map(board.columns);
        newColumns.set(newStartCol.id, newStartCol);
        newColumns.set(newFinishCol.id, newFinishCol);

        updateTodo(todoToMove, aiResponse.column as TypedColumn);

        setBoardState({ columns: newColumns });

        found = true;
        return true;
      }

      return false;
    });

    if (!found) handleAIError(`Todo "${aiResponse.title}" not found!`);
  };

  const handleAIClick = async () => {
    if (!aiInput || aiLoading) return;

    setAILoading(true);

    const res = await getAIReponse(aiInput);

    if (res?.error) {
      handleAIError(res.error);
      return;
    }
    if (res.action === 'none') handleAIError('Please use allowed actions only. (Add/Remove Todos)');

    if (res.action === 'add') handleAddAction(res);
    if (res.action === 'remove') handleRemoveAction(res);
    if (res.action === 'remove_all') handleRemoveAllAction(res);
    if (res.action === 'move') handleMoveAction(res);

    setAIInput('');
    setAILoading(false);
  };

  return (
    <header>
      <div className="flex flex-col items-center p-5 md:flex-row bg-gray-400/20 rounded-b-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-700 to-[#3073fe] rounded-md filter blur-3xl opacity-30 -z-40"></div>
        <Image
          src={logo}
          alt="AI Todo Board logo generated by AI"
          width={300}
          height={100}
          className="object-contain w-56 pb-2 md:pb-0"
        />

        <div className="flex items-center justify-end flex-1 space-x-5">
          <form className="flex items-center flex-1 p-2 space-x-5 bg-white rounded-md shadow-md md:flex-initial">
            <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="flex-1 p-2 outline-none"
            />
            <button type="submit" hidden></button>
          </form>
          <Avatar name="Matyas Zednicek" round color="#3073fe" size="50" />
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-2 transition-all md:py-5">
        <p
          className="flex items-center text-sm font-light p-3 rounded-xl shadow-xl w-fit bg-white italic max-w-3xl text-[#3073fe]"
          onMouseOver={(e) => setAIInputHover(true)}
          onMouseLeave={(e) => setAIInputHover(false)}
        >
          <input
            type="text"
            className={`outline-none transition-all duration-200 font-medium ease-out ${
              aiInputHover ? 'w-72 pl-3' : 'w-0'
            }`}
            value={aiInput}
            placeholder="Ex.: Add Bake cookies to Todo"
            onChange={(e) => setAIInput(e.target.value)}
          />
          <button
            onClick={handleAIClick}
            onMouseOver={(e) => setAIHover(true)}
            onMouseLeave={(e) => setAIHover(false)}
            title="Use AI Magic"
            className={`p-2 rounded-xl ${aiHover ? 'bg-gray-300/60' : ''}`}
          >
            {aiHover ? (
              <SparklesIcon className={`inline-block w-8 h-8 text-[#3073fe] ${aiLoading ? 'animate-spin' : ''}`} />
            ) : (
              <SparklesIconOutline
                className={`inline-block w-8 h-8 text-[#3073fe] ${aiLoading ? 'animate-spin' : ''}`}
              />
            )}
          </button>
        </p>
      </div>
    </header>
  );
}

export default Header;

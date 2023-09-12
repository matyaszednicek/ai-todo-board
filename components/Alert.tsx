'use client';

import { useAlertStore } from '@/store/AlertStore';

function Alert() {
  const { type, message, isShown } = useAlertStore();
  const getColorClasses = () => {
    if (type === 'success') return 'bg-green-100 text-green-700';
    if (type === 'danger') return 'bg-red-100 text-red-700';
    if (type === 'warn') return 'bg-yellow-100 text-yellow-700';
    return '';
  };

  return (
    <div
      className={`${
        isShown ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-400 fixed top-9 right-5 px-6 py-5 mb-4 text-base rounded-lg ${getColorClasses()}`}
      role="alert"
    >
      {message}
    </div>
  );
}

export default Alert;

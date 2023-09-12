import AddTodoModal from '@/components/Modals/AddTodoModal';
import './globals.css';
import type { Metadata } from 'next';
import RemoveTodoModal from '@/components/Modals/RemoveTodoModal';
import Alert from '@/components/Alert';
import RemoveAllModal from '@/components/Modals/RemoveAllModal';

export const metadata: Metadata = {
  title: 'AI Todo Board',
  description: 'by Matyas Zednicek',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F4F4F4]">
        {children}
        <AddTodoModal />
        <RemoveTodoModal />
        <RemoveAllModal />
        <Alert />
      </body>
    </html>
  );
}

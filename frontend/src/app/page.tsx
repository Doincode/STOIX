'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues with DnD
const KanbanBoard = dynamic(() => import('../components/KanbanBoard'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        <KanbanBoard />
        </div>
      </main>
  );
}

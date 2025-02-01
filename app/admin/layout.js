'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-gray-900 w-64 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-white text-2xl font-bold mb-8">Admin Panel</h2>
          <nav className="space-y-4">
            <Link href="/admin/tournaments" className="block text-gray-300 hover:text-white">
              Tournois
            </Link>
            <Link href="/admin/news" className="block text-gray-300 hover:text-white">
              Actualités
            </Link>
            <Link href="/admin/about" className="block text-gray-300 hover:text-white">
              À propos
            </Link>
            <Link href="/admin/schools" className="block text-gray-300 hover:text-white">
              Écoles
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-margin duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <header className="bg-white shadow">
          <div className="px-4 py-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 
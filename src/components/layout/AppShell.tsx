import { Outlet, Link } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link to="/" className="text-lg font-semibold text-indigo-900 hover:text-indigo-700">
            Breakout Intelligence
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-gray-400 py-4">
        Breakout Intelligence
      </footer>
    </div>
  );
}

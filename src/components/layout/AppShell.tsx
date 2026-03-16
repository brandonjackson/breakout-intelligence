import { Outlet, Link } from 'react-router-dom';
import { useSlug } from '../../hooks/useSlug';

export default function AppShell() {
  const slugResult = useSlug();
  const inEvent = slugResult.found;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-black">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="flex-shrink-0" aria-label="Home">
            <img src={new URL('../../bi-logo.png', import.meta.url).href} alt="Breakout Intelligence" className="h-7 w-auto" />
          </Link>
          {inEvent ? (
            <Link
              to={`/invite/${slugResult.slug}`}
              className="font-heading text-lg font-semibold text-white hover:text-white/80"
            >
              {slugResult.event.name}
            </Link>
          ) : (
            <Link to="/" className="font-heading text-lg font-semibold text-white hover:text-white/80">
              Breakout Intelligence
            </Link>
          )}
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

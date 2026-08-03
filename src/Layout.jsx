import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="bg-sky-300/90 backdrop-blur-sm py-4 text-center mt-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2">
          <Link to="/About" className="text-white text-xs sm:text-sm font-medium hover:underline">
            About
          </Link>
          <span className="text-white/50 text-xs">•</span>
          <Link to="/Contact" className="text-white text-xs sm:text-sm font-medium hover:underline">
            Contact
          </Link>
        </div>
        <p className="text-white text-xs sm:text-sm font-medium">
          © 2026 <Link to="/HeartPets" className="hover:underline decoration-white/60">Zoltan F.</Link> and AgfiNet. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
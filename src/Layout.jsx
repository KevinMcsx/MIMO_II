export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm py-2 text-center z-50">
        <p className="text-white/70 text-xs sm:text-sm">
          © 2026 Zoltan F. and Janos A. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
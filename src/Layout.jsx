export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-16">
        {children}
      </div>
      <footer className="fixed bottom-0 left-0 right-0 bg-sky-300/90 backdrop-blur-sm py-2 text-center z-50">
        <p className="text-slate-800 text-xs sm:text-sm font-medium">
          © 2026 Zoltan F. and Janos A. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
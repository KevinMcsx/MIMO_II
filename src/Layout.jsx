export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {children}
      </div>
      <footer className="bg-sky-300/90 backdrop-blur-sm py-3 text-center mt-8">
        <p className="text-white text-xs sm:text-sm font-medium">
          © 2026 Zoltan F. and Janos A. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
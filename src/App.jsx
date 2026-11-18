import School from './pages/School';
import RobotMission from './pages/RobotMission';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomTabBar from '@/components/BottomTabBar';
import Game from './pages/Game';
import PageNotFound from './lib/PageNotFound';
import About from './pages/About';
import Contact from './pages/Contact';
import HeartPets from './pages/HeartPets';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>
    <motion.div
      key={currentPageName}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  </Layout>
  : <>{children}</>;

const AppRoutes = () => {
  const location = useLocation();

  // Render the main app
  return (
    <>
      <BottomTabBar />
      <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname.split('/')[1] || 'home'}>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/School" element={<School />} />
      <Route path="/RobotMission" element={<RobotMission />} />
      <Route path="/About" element={<LayoutWrapper currentPageName="About"><About /></LayoutWrapper>} />
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />
      <Route path="/HeartPets" element={<LayoutWrapper currentPageName="HeartPets"><HeartPets /></LayoutWrapper>} />
      <Route path="/Game/*" element={<LayoutWrapper currentPageName="Game"><Game /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
      </Routes>
      </AnimatePresence>
    </>
  );
};


function App() {

  return (
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
  )
}

export default App
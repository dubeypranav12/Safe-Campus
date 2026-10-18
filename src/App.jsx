import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import RoleBar from './components/RoleBar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import ReportIncident from './pages/ReportIncident.jsx';
import Dashboard from './pages/Dashboard.jsx';
import IncidentDetail from './pages/IncidentDetail.jsx';
import MapPage from './pages/MapPage.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Architecture from './pages/Architecture.jsx';
import Prototype from './pages/Prototype.jsx';
import Impact from './pages/Impact.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <RoleBar />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportIncident />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/incident/:id" element={<IncidentDetail />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/architecture" element={<Architecture />} />
        <Route path="/prototype" element={<Prototype />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

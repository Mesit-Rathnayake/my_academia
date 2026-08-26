import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Startup from './pages/Startup';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';
import Performance from './pages/Performance';
import SplashCursor from './components/SplashCursor';

function AnimatedRoutes() {
  const location = useLocation();
  const isChat = location.pathname.toLowerCase().startsWith('/chat');
  
  return (
    <>
      {!isChat && (
        <SplashCursor
          SIM_RESOLUTION={128}
          DYE_RESOLUTION={1440}
          DENSITY_DISSIPATION={3.5}
          VELOCITY_DISSIPATION={2}
          PRESSURE={0.1}
          CURL={3}
          SPLAT_RADIUS={0.2}
          SPLAT_FORCE={6000}
          COLOR_UPDATE_SPEED={10}
        />
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Startup />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home/>}/>
          <Route path="/profile" element={<Profile />}/>
          <Route path="/chat" element={<Chat />}/>
          <Route path="/schedule" element={<Schedule />}/>
          <Route path="/academic-performance" element={<Performance />}/>
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
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

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Startup from './pages/Startup';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Schedule from './pages/Schedule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Startup />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/chat" element={<Chat/>}/>
        <Route path="/schedule" element={<Schedule/>}/>
      </Routes>
    </Router>
  );
}

export default App;
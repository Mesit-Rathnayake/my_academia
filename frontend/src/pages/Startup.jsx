import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/Startup.css";
import man1 from "../images/man1.png";
import Footer from "../components/Footer";

function Startup() {
  const navigate = useNavigate();

  return (
    <div className="Startup">
      <Header/>
      <div className="content-wrapper">
        <div className="Main">
          <h2 className="tagline">Your Study Life,<br/>
          Sorted and Simplified</h2>
          <p className="text">
          Tired of scrambling through notes and deadlines?<br/>
          My Academia is your personal academic tracker — here to help you plan, progress, and<br/>
          perform. Track lecture attendance, submit assessments, calculate grades, and make sure<br/>
          you're always exam-ready.
          </p>
          <div className="buttons">
            <button 
              className="button primary" 
              onClick={() => navigate('/login')}
            >
              Log In
            </button>
            <button 
              className="button primary" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
        <img src={man1} alt="Student illustration" className="man-image"/>
      </div>
      <Footer/>
    </div>
  );
}

export default Startup;
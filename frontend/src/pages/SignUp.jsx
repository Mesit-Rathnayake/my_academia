import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ useNavigate
import Header from "../components/Header";
import Footer from '../components/Footer';
import man2 from '../images/man2.png';
import '../styles/SignUp.css';

function SignUp() {
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const [regNumber, setRegNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // ✅ create navigate function

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: regNumber,
          fullName: fullName,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/Home'); // ✅ redirect to Home
      } else {
        alert(data.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
    }
  }

  return (
    <div className="signup">
      <Header />
      <div className="signup-wrapper">
        <div className="signup-image-container">
          <img src={man2} alt="Student illustration" className="signup-image" />
        </div>
        <div className="signup-form-container">
          <h2 className="title">Create an Account</h2>
          <form className="signform" onSubmit={handleSubmit}>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Registration Number (EG/20XX/XXXX)"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="sign button">
              <button type="submit">Sign Up</button>
            </div>
          </form>
          <p className="login-prompt">
            Already Have an Account? <Link to="/login">Log In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignUp;

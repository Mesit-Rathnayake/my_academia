import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ✅ useNavigate
import Header from "../components/Header";
import Footer from '../components/Footer';
import man3 from '../images/man3.png';
import '../styles/LogIn.css';

function LogIn() {
  const [regNumber, setRegNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // ✅ create navigate function


  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: regNumber,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/Home'); // ✅ redirect to Home
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  return (
    <div className="signup">
      <Header />
      <div className="login-wrapper">
        <div className="login-form-container">
          <h2 className="title">Welcome Back!</h2>
          <form className="loginform" onSubmit={handleSubmit}>
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="log button">
              <button type="submit">Log In</button>
            </div>
          </form>
          <p className="signup-prompt">
            Don't Have an Account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
        <div className="login-image-container">
          <img src={man3} alt="Student illustration" className="login-image" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LogIn;

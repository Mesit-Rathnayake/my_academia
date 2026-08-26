import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from '../components/Footer';
import man2 from '../images/man2.png';
import { FaUser } from 'react-icons/fa';

function SignUp() {
  const apiBaseUrl = process.env.REACT_APP_API_URL || '';
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: registrationNumber,
          firstName: firstName,
          lastName: lastName,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/Home');
      } else {
        setError(data.message || 'Sign up failed');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('An error occurred. Please try again later.');
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col font-sans relative overflow-hidden">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-center gap-12 py-12 relative z-10">
        <div className="flex-1 hidden md:flex justify-center items-center relative">
          <img src={man2} alt="Student illustration" className="max-w-full h-auto w-[80%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
        </div>
        <div className="flex-1 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.06)] border border-white/70 ring-1 ring-slate-900/5 relative z-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Create an Account</h2>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center justify-between shadow-sm">
              <span>⚠️ {error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-400 hover:text-red-600 px-2 py-1">✕</button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input
                id="signup-registration-number"
                type="text" 
                placeholder="Registration Number (EG/20XX/XXXX)"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              />
            </div>
            <div>
              <label htmlFor="signup-first-name" className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  id="signup-first-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label htmlFor="signup-last-name" className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  id="signup-last-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-8 text-center text-slate-600 font-medium">
            Already Have an Account? <Link to="/login" className="text-primary hover:text-secondary transition-colors font-bold">Log In</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignUp;

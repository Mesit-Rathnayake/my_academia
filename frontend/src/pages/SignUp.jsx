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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative z-50 overflow-hidden">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-center gap-12 py-12">
        <div className="flex-1 hidden md:flex justify-center items-center relative">
          {/* Decorative Rings */}
          <div className="absolute w-[550px] h-[550px] rounded-full border-[40px] border-primary/10 -z-10 animate-[spin_25s_linear_infinite] top-1/2 left-1/2 -translate-x-[52%] -translate-y-[45%]"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border-[28px] border-secondary/15 -z-10 animate-[spin_18s_linear_infinite_reverse] top-1/2 left-1/2 -translate-x-[48%] -translate-y-[55%]"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-secondary/5 to-primary/5 -z-20 blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          <img src={man2} alt="Student illustration" className="max-w-full h-auto w-[80%] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
        </div>
        <div className="flex-1 w-full max-w-md bg-white p-8 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 relative z-10">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">Create an Account</h2>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center justify-between shadow-sm">
              <span>⚠️ {error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 px-2 py-1">✕</button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <input 
                type="text" 
                placeholder="Registration Number (EG/20XX/XXXX)"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaUser />
                </div>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaUser />
                </div>
                <input
                  type="text"
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

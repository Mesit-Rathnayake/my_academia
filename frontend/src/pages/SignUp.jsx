import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from '../components/Footer';
import man3 from '../images/man3.png';

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
          registrationNumber,
          firstName,
          lastName,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        navigate('/home');
      } else {
        const detailMsg = data.errors?.[0]?.msg || data.message || 'Registration failed';
        setError(detailMsg);
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('Unable to reach server. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 flex flex-col font-sans">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm bg-white dark:bg-[#121215] p-7 rounded-xl border border-zinc-200/90 dark:border-zinc-800/90 border-t-[3px] border-t-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold block mb-1">Student Registration</span>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Create Academic Profile</h1>
            </div>
            <img
              src={man3}
              alt="Student Sign Up"
              className="w-12 h-12 rounded-lg object-contain bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-1 shrink-0"
            />
          </div>
          
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-red-500 hover:text-red-800 ml-2">✕</button>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="signup-registration-number" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Registration Number</label>
              <input
                id="signup-registration-number"
                type="text" 
                placeholder="EG/2022/5440"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-lg text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-first-name" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  id="signup-first-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="glass-input w-full px-3 py-2.5 rounded-lg text-xs"
                  placeholder="Mesith"
                />
              </div>
              <div>
                <label htmlFor="signup-last-name" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  id="signup-last-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="glass-input w-full px-3 py-2.5 rounded-lg text-xs"
                  placeholder="Rathnayake"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="Min 8 chars, 1 upper, 1 lower, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="glass-input w-full px-3.5 py-2.5 rounded-lg text-xs"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors mt-2 shadow-xs"
            >
              Register Account
            </button>
          </form>

          <p className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already registered? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Sign In</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default SignUp;

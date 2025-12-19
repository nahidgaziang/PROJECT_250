import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Our custom hook
import { toast, ToastContainer } from 'react-toastify'; 
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/'); // Redirect to the main app after login
      toast.success("Successfully logged in!", {
        position: "top-center",
        autoClose: 2000,
      }); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '5rem auto', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Log In to Readefy</h2>
      <form onSubmit={handleLogin}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />
        <button type="submit" className="primary" style={{ width: '100%' }}>Log In</button>
      </form>
      {error && <p style={{ color: 'var(--danger-color)', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>
        Need an account? <Link to="/signup">Sign Up</Link>
      </p>
      <ToastContainer />  
    </div>
  );
}
export default LoginPage;
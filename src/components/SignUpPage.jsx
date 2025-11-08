import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Our custom hook

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password);
      navigate('/'); // Redirect to the main app
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '5rem auto', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Sign Up for Readefy</h2>
      <form onSubmit={handleSignUp}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }} />
        <button type="submit" className="primary" style={{ width: '100%' }}>Sign Up</button>
      </form>
      {error && <p style={{ color: 'var(--danger-color)', marginTop: '1rem' }}>{error}</p>}
      <p style={{ marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}
export default SignUpPage;
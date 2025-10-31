import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService.js';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await authService.login(formData.email, formData.password);
      if (result.success) {
        setMessage('Login successful! Redirecting...');
        // Call the auth context login to update global state
        await login(formData.email, formData.password);
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear message when user starts typing
    if (message) setMessage('');
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card login-card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-primary">
                    <i className="fas fa-city me-2"></i>
                    CitizenConnect
                  </h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </div>
<div className="text-center mt-3">
  <Link to="/forgot-password" className="text-decoration-none">
    Forgot your password?
  </Link>
</div>

                  <div className="text-center">
                    <p className="text-muted">
                      Don't have an account?{' '}
                      <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Demo credentials info */}
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Note:</strong> Now using real authentication. Register a new account or use existing credentials from your database.
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard.js';
const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL;

// Mock service
const mockService = {
  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      user: {
        id: Date.now(),
        ...userData
      }
    };
  },
  login: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      user: {
        id: 1,
        name: 'Test User',
        email: email
      }
    };
  },
  getRecentRequests: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [];
  },
  createRequest: async (requestData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: 'Request submitted successfully' };
  },
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// ForgotPassword Component
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ If the email exists, a password reset link has been sent');
        setEmail('');
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-primary">
                    <i className="fas fa-key me-2"></i>
                    Forgot Password
                  </h2>
                  <p className="text-muted">Enter your email to reset your password</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <button 
                    className="btn btn-primary w-100 py-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Remember your password? <Link to="/login" className="text-decoration-none">Back to Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ResetPassword Component
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-primary">
                    <i className="fas fa-lock me-2"></i>
                    Reset Password
                  </h2>
                  <p className="text-muted">Enter your new password</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>

                  <button 
                    className="btn btn-primary w-100 py-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    <Link to="/login" className="text-decoration-none">Back to Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// EmailVerification Component
const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`);
      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Email verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setMessage('❌ Network error. Please try again.');
    }
  };

  return (
    <div className="email-verification-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-5 text-center">
                <h2 className="card-title fw-bold text-primary mb-4">
                  <i className="fas fa-envelope me-2"></i>
                  Email Verification
                </h2>
                
                {message ? (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`}>
                    {message}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Verifying your email...</p>
                  </div>
                )}

                <div className="mt-4">
                  <Link to="/login" className="btn btn-outline-primary">
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ChangePassword Component (for Profile page)
const ChangePassword = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('❌ New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage('❌ New password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage('✅ Password changed successfully!');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Change password error:', error);
      setMessage('❌ Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="fas fa-lock me-2"></i>
              Change Password
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {message && (
              <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="d-flex gap-2">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Component
const Navbar = ({ user, onLogout }) => (
  <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
    <div className="container">
      <Link className="navbar-brand fw-bold" to="/">
        <i className="fas fa-city me-2"></i>
        CitizenConnect
      </Link>
      <div className="navbar-nav ms-auto">
        {user ? (
          <>
            {/* Admin link - only show for admin users */}
            {user.role === 'admin' && (
              <Link className="nav-link" to="/admin">Admin</Link>
            )}
            <Link className="nav-link" to="/">Dashboard</Link>
            <Link className="nav-link" to="/service-request">Services</Link>
            <Link className="nav-link" to="/profile">Profile</Link>
            <button 
              className="nav-link btn btn-link text-light" 
              onClick={onLogout} 
              style={{border: 'none', background: 'none'}}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  </nav>
);
// Dashboard Component
const Dashboard = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching user requests...');
const response = await fetch(`${API_URL}/api/citizen/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Full API response:', data);

      // SAFE: Handle different response structures
      let requestsArray = [];

      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data && Array.isArray(data.requests)) {
        requestsArray = data.requests;
      } else if (data && Array.isArray(data.data)) {
        requestsArray = data.data;
      } else if (data && data.success && Array.isArray(data.requests)) {
        requestsArray = data.requests;
      } else {
        console.warn('⚠️ Unexpected API response structure. Available keys:', Object.keys(data));
        requestsArray = [];
      }

      console.log('✅ Final requests array:', requestsArray);
      setRequests(requestsArray);

    } catch (error) {
      console.error('❌ Error fetching requests:', error);
      setError('Failed to load requests: ' + error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  
  const totalRequests = safeRequests.length;
  const completedRequests = safeRequests.filter(req => req.status === 'completed').length;
  const inProgressRequests = safeRequests.filter(req => req.status === 'in_progress').length;
  const pendingRequests = safeRequests.filter(req => req.status === 'pending').length;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1>Citizen Dashboard</h1>
                <p className="text-muted">Welcome back, {user?.name}!</p>
              </div>
              <Link to="/service-request" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>
                New Service Request
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Requests</h5>
                <h2 className="mb-0">{totalRequests}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Completed</h5>
                <h2 className="mb-0">{completedRequests}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body">
                <h5 className="card-title">In Progress</h5>
                <h2 className="mb-0">{inProgressRequests}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <h2 className="mb-0">{pendingRequests}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Service Requests
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your requests...</p>
                  </div>
                ) : safeRequests.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5>No service requests yet</h5>
                    <p className="text-muted">Submit your first service request to get started</p>
                    <Link to="/service-request" className="btn btn-primary">
                      Create First Request
                    </Link>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Service Type</th>
                          <th>Location</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeRequests.map(request => (
                          <tr key={request.id || request._id}>
                            <td>#{request.id || request._id || 'N/A'}</td>
                            <td>
                              {request.service_type ? 
                                request.service_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                                : 'N/A'
                              }
                            </td>
                            <td>{request.location || 'N/A'}</td>
                            <td>
                              <span className={`badge bg-${
                                request.priority === 'urgent' ? 'danger' :
                                request.priority === 'high' ? 'warning' :
                                request.priority === 'medium' ? 'info' : 'secondary'
                              }`}>
                                {request.priority || 'medium'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${
                                request.status === 'completed' ? 'success' :
                                request.status === 'in_progress' ? 'primary' : 'warning'
                              }`}>
                                {request.status || 'pending'}
                              </span>
                            </td>
                            <td>
                              {request.created_at ? 
                                new Date(request.created_at).toLocaleDateString() 
                                : 'N/A'
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ServiceRequest Component
const ServiceRequest = () => {
  const [formData, setFormData] = useState({
    service_type: '',
    description: '',
    location: '',
    exact_location: '',
    priority: 'medium',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setMessage('');

  if (!formData.service_type || !formData.description || !formData.location) {
    setMessage('❌ Please fill in all required fields (Service Type, Description, Location)');
    setIsSubmitting(false);
    return;
  }

  try {
    console.log('🚀 Starting form submission...');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('❌ Please log in to submit a service request');
      setIsSubmitting(false);
      return;
    }

    // Use FormData to include image files
    const submitData = new FormData();
    
    // Append all form fields
    submitData.append('service_type', formData.service_type);
    submitData.append('description', formData.description);
    submitData.append('location', formData.location);
    submitData.append('priority', formData.priority);
    
    if (formData.exact_location) {
      submitData.append('exact_location', formData.exact_location);
    }
    
    // Append the image file if it exists
    if (formData.image && formData.image instanceof File) {
      submitData.append('image', formData.image);
      console.log('📸 Image file attached:', formData.image.name, formData.image.size);
    } else {
      console.log('ℹ️ No image file attached');
    }

    console.log('📤 Sending FormData with image support...');
    
const response = await fetch(`${API_URL}/api/citizen/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        //  REMOVE Content-Type header - let browser set it automatically with boundary
      },
      body: submitData  //  Send as FormData (not JSON)
    });

    console.log('📊 Response status:', response.status);
    
    const result = await response.json();
    console.log('📨 Server response:', result);

    if (response.ok) {
      const successMessage = '✅ Service request submitted successfully!' + 
        (result.request?.image_path ? ' Image uploaded successfully.' : '');
      
      setMessage(successMessage);
      
      // Reset form
      setFormData({
        service_type: '',
        description: '',
        location: '',
        exact_location: '',
        priority: 'medium',
        image: null
      });
      setImagePreview(null);
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } else {
      setMessage(`❌ ${result.message || 'Failed to submit service request'}`);
    }
  } catch (error) {
    console.error('❌ Submission error:', error);
    setMessage('❌ Network error. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage('❌ Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ Image size should be less than 5MB');
        return;
      }

      setFormData({
        ...formData,
        image: file
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setImagePreview(null);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setMessage('📍 Getting your current location...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
          
          setFormData({
            ...formData,
            exact_location: mapsUrl,
            location: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`
          });
          
          setMessage('✅ Location captured successfully!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMessage('❌ Could not get your location. Please enter it manually.');
        }
      );
    } else {
      setMessage('❌ Geolocation is not supported by your browser.');
    }
  };

  const openGoogleMaps = () => {
    if (formData.exact_location) {
      window.open(formData.exact_location, '_blank');
    } else {
      setMessage('❌ Please capture or enter a location first.');
    }
  };

  return (
    <div className="service-request">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>Submit Service Request</h1>
            <p className="text-muted">
              <i className="fas fa-info-circle me-2"></i>
              Report issues with photos and exact locations for faster resolution
            </p>
          </div>
        </div>
        
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card border-0 shadow">
              <div className="card-body p-4">
                {message && (
                  <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}
                
                <h5 className="card-title mb-4">
                  <i className="fas fa-edit me-2"></i>
                  New Service Request
                </h5>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-tools me-2"></i>
                      Service Type *
                    </label>
                    <select 
                      className="form-select" 
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a service type</option>
                      <option value="road_repair">Road Repair</option>
                      <option value="waste_management">Waste Management</option>
                      <option value="water_supply">Water Supply</option>
                      <option value="electricity">Electricity Issue</option>
                      <option value="public_safety">Public Safety</option>
                      <option value="park_maintenance">Park Maintenance</option>
                      <option value="street_light">Street Light</option>
                      <option value="drainage">Drainage Issue</option>
                      <option value="noise_complaint">Noise Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Location Details *
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter location description (e.g., 'Near Central Park, Main Street')"
                      required
                    />
                    <div className="form-text">
                      Describe the location where the issue exists
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-map me-2"></i>
                      Exact Location (Google Maps)
                    </label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        name="exact_location"
                        value={formData.exact_location}
                        onChange={handleChange}
                        placeholder="Google Maps link or coordinates"
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-primary"
                        onClick={getCurrentLocation}
                      >
                        <i className="fas fa-location-crosshairs me-1"></i>
                        Get My Location
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-success"
                        onClick={openGoogleMaps}
                        disabled={!formData.exact_location}
                      >
                        <i className="fas fa-external-link-alt me-1"></i>
                        View Map
                      </button>
                    </div>
                    <div className="form-text">
                      Capture your exact location or paste a Google Maps link
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Priority
                    </label>
                    <select 
                      className="form-select" 
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      <option value="low">Low - Minor issue</option>
                      <option value="medium">Medium - Needs attention</option>
                      <option value="high">High - Serious issue</option>
                      <option value="urgent">Urgent - Safety hazard</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="fas fa-camera me-2"></i>
                      Upload Photo (Optional)
                    </label>
                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <div className="form-text">
                      Upload a photo of the issue (Max 5MB, JPEG, PNG)
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center">
                          <span className="me-3">Preview:</span>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeImage}
                          >
                            <i className="fas fa-times me-1"></i>
                            Remove
                          </button>
                        </div>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="img-thumbnail mt-2"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <i className="fas fa-file-alt me-2"></i>
                      Detailed Description *
                    </label>
                    <textarea 
                      className="form-control" 
                      rows="6" 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={`Please describe the issue in detail. For example:
• What exactly is the problem?
• When did you first notice it?
• How is it affecting the area?
• Any safety concerns?
• Additional information that might help...`}
                      required
                    ></textarea>
                    <div className="form-text">
                      Character count: {formData.description.length}/2000
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary me-2"
                      onClick={() => window.history.back()}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Back to Dashboard
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting Request...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Submit Service Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Component
const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      console.log('🚀 Attempting login with REAL backend API...');
      
const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('📊 Login response status:', response.status);
      
      const result = await response.json();
      console.log('📨 Login API Response:', result);
      
      if (response.ok) {
        console.log('✅ Backend login successful!');
        
        if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          console.log('💾 Token and user stored in localStorage:', {
            token: result.token,
            user: result.user
          });
        } else {
          console.error('❌ Missing token or user in response');
        }
        
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          if (onLogin && typeof onLogin === 'function') {
            onLogin(result.user);
          }
        }, 1500);
      } else {
        console.log('❌ Backend login failed:', result.message);
        setMessage(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login network error:', error);
      setMessage('Login failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message) setMessage('');
  };

  return (
    <div className="login-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-primary">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Login
                  </h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button 
                    className="btn btn-primary w-100 py-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Forgot your password?
                  </Link>
                </div>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don't have an account? <Link to="/register" className="text-decoration-none">Sign up here</Link>
                  </p>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Note:</strong> Use your registered email and password
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

// Register Component
const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('✅ Register component MOUNTED!');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Form submitted:', formData);
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      console.log('🚀 Attempting registration with REAL backend API...');
      
const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('📊 Response status:', response.status);
      
      const result = await response.json();
      console.log('📨 API Response data:', result);
      
      if (response.ok) {
        console.log('✅ Backend registration successful!');
        
        if (result.token && result.user) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          console.log('💾 Token and user stored in localStorage:', {
            token: result.token,
            user: result.user
          });
        } else {
          console.error('❌ Missing token or user in response');
        }
        
        setMessage('Registration successful! Redirecting...');
        setTimeout(() => {
          if (onRegister && typeof onRegister === 'function') {
            onRegister(result.user);
          }
        }, 1500);
      } else {
        console.log('❌ Backend registration failed:', result.message);
        setMessage(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      setMessage('Registration failed. Please check if the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (message) setMessage('');
  };

  return (
    <div className="register-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="card-title fw-bold text-primary">
                    <i className="fas fa-user-plus me-2"></i>
                    Create Account
                  </h2>
                  <p className="text-muted">Join CitizenConnect today</p>
                </div>

                {message && (
                  <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email Address *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Address</label>
                    <textarea 
                      className="form-control" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your address"
                      rows="3"
                    ></textarea>
                  </div>

                  <button 
                    className="btn btn-primary w-100 py-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Already have an account? <Link to="/login" className="text-decoration-none">Sign in here</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Component
const Profile = ({ user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await mockService.delay(800);
      onUpdateProfile(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
    setMessage('');
  };

  if (!user) {
    return (
      <div className="container text-center py-5">
        <h3>Please log in to view your profile</h3>
        <Link to="/login" className="btn btn-primary mt-3">Login</Link>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1>My Profile</h1>
            <p className="text-muted">Manage your account information</p>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Personal Information</h5>
                  {!isEditing && (
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </button>
                  )}
                </div>

                {message && (
                  <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show`}>
                    {message}
                    <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Address</label>
                    <textarea 
                      className="form-control" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <button 
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={() => setShowChangePassword(true)}
                    >
                      <i className="fas fa-lock me-2"></i>
                      Change Password
                    </button>
                  </div>

                  {isEditing && (
                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>

        {showChangePassword && (
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        )}
      </div>
    </div>
  );
};


// Protected Route Component 
const ProtectedRoute = ({ children, user }) => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  
  const isAuthenticated = storedUser && storedToken;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Main App Component
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      console.log('🔑 Found stored user and token');
      setUser(JSON.parse(storedUser));
    } else {
      console.log('🔐 No stored authentication found');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleUpdateProfile = (profileData) => {
    setUser(prev => ({ ...prev, ...profileData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...profileData }));
  };

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <Routes>
            <Route path="/" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute user={user}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/service-request" element={
              <ProtectedRoute user={user}>
                <ServiceRequest />
              </ProtectedRoute>
            } />
<Route path="/admin" element={
  <ProtectedRoute user={user}>
    <AdminDashboard user={user} />
  </ProtectedRoute>
} />
            <Route path="/profile" element={
              <ProtectedRoute user={user}>
                <Profile user={user} onUpdateProfile={handleUpdateProfile} />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/" /> : <Register onRegister={handleRegister} />
            } />
            <Route path="/services" element={<Navigate to="/service-request" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
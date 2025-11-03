import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchAdminRequests();
    fetchAdminStats();
  }, [statusFilter, currentPage]);

  const fetchAdminRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔐 Token for admin request:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

let apiUrl = `${API_URL}/api/admin/requests?page=${currentPage}&limit=10`;
      
      if (statusFilter !== 'all') {
        apiUrl += `&status=${statusFilter}`;
      }

      console.log('📡 Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Admin request response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📨 Admin requests data:', data);
      setRequests(data.requests || []);

    } catch (error) {
      console.error('❌ Error fetching admin requests:', error);
      setError('Failed to load requests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

const response = await fetch(`${API_URL}/api/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Admin stats data:', data);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('❌ Error fetching admin stats:', error);
    }
  };

  const fetchRequestDetails = async (requestId) => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem('token');
      
const response = await fetch(`${API_URL}/api/admin/requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRequest(data.request);
        setShowDetailsModal(true);
      } else {
        throw new Error('Failed to fetch request details');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError('Failed to load request details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
const response = await fetch(`${API_URL}/api/admin/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Refresh both requests and stats
        fetchAdminRequests();
        fetchAdminStats();
        
        // If details modal is open, refresh the selected request
        if (selectedRequest && selectedRequest.id === requestId) {
          fetchRequestDetails(requestId);
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update request status');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'in_progress': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-danger';
      case 'high': return 'bg-warning text-dark';
      case 'medium': return 'bg-info';
      case 'low': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getStatusActions = (request) => {
    switch (request.status) {
      case 'pending':
        return (
          <>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => updateRequestStatus(request.id, 'in_progress')}
              title="Mark as In Progress"
            >
              <i className="fas fa-play me-1"></i>
              In Progress
            </button>
            <button 
              className="btn btn-outline-success btn-sm"
              onClick={() => updateRequestStatus(request.id, 'completed')}
              title="Mark as Completed"
            >
              <i className="fas fa-check me-1"></i>
              Complete
            </button>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={() => updateRequestStatus(request.id, 'rejected')}
              title="Reject Request"
            >
              <i className="fas fa-times me-1"></i>
              Reject
            </button>
          </>
        );
      case 'in_progress':
        return (
          <>
            <button 
              className="btn btn-outline-success btn-sm"
              onClick={() => updateRequestStatus(request.id, 'completed')}
              title="Mark as Completed"
            >
              <i className="fas fa-check me-1"></i>
              Complete
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => updateRequestStatus(request.id, 'pending')}
              title="Move back to Pending"
            >
              <i className="fas fa-undo me-1"></i>
              Reopen
            </button>
          </>
        );
      case 'completed':
        return (
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => updateRequestStatus(request.id, 'in_progress')}
            title="Reopen Request"
          >
            <i className="fas fa-undo me-1"></i>
            Reopen
          </button>
        );
      case 'rejected':
        return (
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => updateRequestStatus(request.id, 'pending')}
            title="Reopen Request"
          >
            <i className="fas fa-undo me-1"></i>
            Reopen
          </button>
        );
      default:
        return null;
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request); // Set basic info immediately
    setShowDetailsModal(true);
    // Can also fetch detailed info here if needed
    // fetchRequestDetails(request.id);
  };

  const formatServiceType = (serviceType) => {
    if (!serviceType) return 'N/A';
    return serviceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (user.role !== 'admin') {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You do not have permission to access the admin dashboard.</p>
          <Link to="/" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1>Admin Dashboard</h1>
                <p className="text-muted">Manage all service requests and system statistics</p>
              </div>
              <div className="text-end">
                <p className="mb-0">Welcome, <strong>{user.name}</strong></p>
                <small className="text-muted">Admin User</small>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <h5 className="card-title">Total Requests</h5>
                <h2 className="mb-0">{stats.total || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <h5 className="card-title">Pending</h5>
                <h2 className="mb-0">{stats.byStatus?.pending || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-info text-white">
              <div className="card-body">
                <h5 className="card-title">In Progress</h5>
                <h2 className="mb-0">{stats.byStatus?.in_progress || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-success text-white">
              <div className="card-body">
                <h5 className="card-title">Completed</h5>
                <h2 className="mb-0">{stats.byStatus?.completed || 0}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card bg-danger text-white">
              <div className="card-body">
                <h5 className="card-title">Rejected</h5>
                <h2 className="mb-0">{stats.byStatus?.rejected || 0}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Filter by Status:</label>
            <select 
              className="form-select" 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-6 d-flex align-items-end">
            <div className="text-muted">
              Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && ` (${statusFilter})`}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show">
            <strong>Error:</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Requests Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="fas fa-tasks me-2"></i>
                  Service Requests
                  {statusFilter !== 'all' && (
                    <span className="badge bg-secondary ms-2">{statusFilter}</span>
                  )}
                </h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5>No requests found</h5>
                    <p className="text-muted">
                      {statusFilter === 'all' 
                        ? 'There are no service requests in the system.' 
                        : `No ${statusFilter} requests found.`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Service Type</th>
                          <th>Location</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(request => (
                          <tr key={request.id}>
                            <td>
                              <strong>#{request.id}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{request.user_name || 'Unknown User'}</strong>
                                <br />
                                <small className="text-muted">{request.user_email || 'No email'}</small>
                              </div>
                            </td>
                            <td>
                              {formatServiceType(request.service_type)}
                            </td>
                            <td>
                              <small>{request.location}</small>
                              {request.exact_location && (
                                <><br /><a
                                  href={request.exact_location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary small"
                                >
                                  <i className="fas fa-map-marker-alt me-1"></i>
                                  View Map
                                </a></>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getPriorityBadgeClass(request.priority)}`}>
                                {request.priority || 'medium'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                {request.status || 'pending'}
                              </span>
                            </td>
                            <td>
                              {formatDate(request.created_at)}
                            </td>
                            <td>
                              <div className="btn-group-vertical btn-group-sm">
                                {getStatusActions(request)}
                                <button 
                                  className="btn btn-outline-info btn-sm"
                                  onClick={() => handleViewDetails(request)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  View Details
                                </button>
                              </div>
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

     {/* Request Details Modal */}
{showDetailsModal && selectedRequest && (
  <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="fas fa-info-circle me-2"></i>
            Request Details - #{selectedRequest.id}
          </h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setShowDetailsModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          {detailsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading details...</p>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2">Basic Information</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td width="40%"><strong>Request ID:</strong></td>
                      <td>#{selectedRequest.id}</td>
                    </tr>
                    <tr>
                      <td><strong>User:</strong></td>
                      <td>
                        {selectedRequest.user_name || 'Unknown User'}
                        <br />
                        <small className="text-muted">{selectedRequest.user_email || 'No email'}</small>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Service Type:</strong></td>
                      <td>{formatServiceType(selectedRequest.service_type)}</td>
                    </tr>
                    <tr>
                      <td><strong>Priority:</strong></td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(selectedRequest.priority)}`}>
                          {selectedRequest.priority || 'medium'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Status:</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(selectedRequest.status)}`}>
                          {selectedRequest.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2">Location & Timing</h6>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td width="40%"><strong>Location:</strong></td>
                      <td>{selectedRequest.location || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td><strong>Exact Location:</strong></td>
                      <td>
                        {selectedRequest.exact_location ? (
                          <a 
                            href={selectedRequest.exact_location} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-decoration-none"
                          >
                            <i className="fas fa-external-link-alt me-1"></i>
                            Open in Maps
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Created:</strong></td>
                      <td>{formatDate(selectedRequest.created_at)}</td>
                    </tr>
                    <tr>
                      <td><strong>Last Updated:</strong></td>
                      <td>{formatDate(selectedRequest.updated_at) || formatDate(selectedRequest.created_at)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Description Section */}
              <div className="col-12 mt-3">
                <h6 className="fw-bold border-bottom pb-2">Description</h6>
                <div className="card bg-light">
                  <div className="card-body">
                    <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedRequest.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>


{/* Image Section */}
{selectedRequest.image_path && (
  <div className="col-12 mt-4">
    <h6 className="fw-bold border-bottom pb-2">
      <i className="fas fa-image me-2"></i>
      Attached Image
    </h6>
    <div className="card">
      <div className="card-body text-center">
        <div className="mb-2">
          {/* <small className="text-muted">
            Image path: {selectedRequest.image_path}
          </small> */}
        </div>
        
        {/* Debug Info */}
        {/* <div className="alert alert-info small mb-3">
          <strong>Debug Info:</strong><br />
          Database Path: {selectedRequest.image_path}<br />
          Filename: {selectedRequest.image_path.split('/').pop()}<br />
          Full URL: http://localhost:5001/{selectedRequest.image_path}
        </div> */}

        <img 
  src={`${API_URL}/${selectedRequest.image_path}`}
          alt="Request attachment" 
          className="img-fluid rounded border"
          style={{ 
            maxHeight: '400px', 
            maxWidth: '100%',
            cursor: 'pointer'
          }}
  onClick={() => window.open(`${API_URL}/${selectedRequest.image_path}`, '_blank')}
          onError={(e) => {
            console.error('❌ Image failed to load:', selectedRequest.image_path);
            e.target.style.display = 'none';
            
            // Show detailed error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-warning';
            errorMsg.innerHTML = `
              <i class="fas fa-exclamation-triangle me-2"></i>
              <strong>Image not found on server</strong><br>
              <small>Server path: ${selectedRequest.image_path}</small><br>
              <small class="text-muted">The file might not exist in the uploads directory</small>
              <br>
              <!-- <a href="http://localhost:5001/api/debug-uploads" target="_blank" class="btn btn-sm btn-outline-info mt-2">
                Check Uploads Directory
              </a> -->
            `;
            e.target.parentNode.appendChild(errorMsg);
          }}
          onLoad={() => {
            console.log('✅ Image loaded successfully:', selectedRequest.image_path);
          }}
        />
        <div className="mt-2">
          <small className="text-muted">
            Click on the image to open in new tab
          </small>
        </div>
      </div>
    </div>
  </div>
)}

              {/* Show message when no image exists */}
              {!selectedRequest.image_path && (
                <div className="col-12 mt-4">
                  <h6 className="fw-bold border-bottom pb-2">
                    <i className="fas fa-image me-2"></i>
                    Attached Image
                  </h6>
                  <div className="card bg-light">
                    <div className="card-body text-center py-4">
                      <i className="fas fa-camera fa-2x text-muted mb-3"></i>
                      <p className="text-muted mb-0">No image attached to this request</p>
                    </div>
                  </div>
                </div>
                        )}      
            </div>
          )}
                </div>
                
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
          <div className="btn-group">
            {getStatusActions(selectedRequest)}
          </div>
        </div>
      </div>
    </div>
  </div>
        )}
        
      </div>
    </div>
    
  );
};

const debugImage = (imagePath) => {
  if (!imagePath) {
    console.log('❌ No image path provided');
    return null;
  }
  
const imageUrl = `${API_URL}/${imagePath}`;
  
  console.log('🖼️ Image Debug Info:');
  console.log('Original path:', imagePath);
  console.log('Filename:', imagePath.split('/').pop());
  console.log('Full URL:', imageUrl);
  
  return imageUrl;
};

const handleViewDetails = (request) => {
  setSelectedRequest(request);
  setShowDetailsModal(true);
  
  // Debug the image
  if (request.image_path) {
    const imageUrl = debugImage(request.image_path);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => console.log('✅ Image loads successfully');
    img.onerror = () => console.log('❌ Image failed to load');
    img.src = imageUrl;
  }
};

export default AdminDashboard;
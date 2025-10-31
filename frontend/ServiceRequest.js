import React, { useState, useEffect } from 'react';
import { citizenService } from '../../services/citizenService.js';
import { useAuth } from '../../context/AuthContext.js';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner.js';
import Modal from '../../components/common/Modal/Modal.js';
import './ServiceRequest.css';

const ServiceRequest = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [formData, setFormData] = useState({
    service_type: '',
    description: '',
    location: '',
    priority: 'medium'
  });
  const [requests, setRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'history') {
      loadRequests();
    }
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const requestsData = await citizenService.getRecentRequests(); 
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
      setMessage('Error loading service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      
      const result = await citizenService.createRequest(formData);
      setMessage('Service request submitted successfully!');
      setFormData({
        service_type: '',
        description: '',
        location: '',
        priority: 'medium'
      });
      // Refresh requests list and switch to history tab after successful submission
      setTimeout(() => {
        setActiveTab('history');
        loadRequests();
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage('Error submitting request: ' + (error.response?.data?.message || error.message || 'Please try again later.'));
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

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-badge-pending', text: 'Pending', icon: 'fa-clock' },
      in_progress: { class: 'status-badge-in-progress', text: 'In Progress', icon: 'fa-spinner' },
      resolved: { class: 'status-badge-resolved', text: 'Resolved', icon: 'fa-check-circle' },
      rejected: { class: 'status-badge-rejected', text: 'Rejected', icon: 'fa-times-circle' }
    };
    
    const config = statusConfig[status] || { class: 'status-badge-unknown', text: status, icon: 'fa-question' };
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleQuickAction = (action, requestId) => {
    // Implement quick actions like follow-up, cancel, etc.
    console.log(`${action} requested for request ${requestId}`);
    // Add API calls for different actions
  };

  return (
    <div className="service-request">
      <div className="row">
        <div className="col-12">
          <h1>Service Requests</h1>
          <p className="text-muted">Manage your service requests and submit new ones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'new' ? 'active' : ''}`}
                onClick={() => setActiveTab('new')}
              >
                <i className="fas fa-plus-circle me-2"></i>
                New Request
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="fas fa-history me-2"></i>
                Request History
                {requests.length > 0 && (
                  <span className="badge bg-primary ms-2">{requests.length}</span>
                )}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab Content */}
      <div className="row">
        <div className="col-12">
          {activeTab === 'new' ? (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0">
                  <i className="fas fa-edit me-2"></i>
                  Submit New Service Request
                </h5>
              </div>
              <div className="card-body">
                {message && (
                  <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`}>
                    <div className="d-flex align-items-center">
                      <i className={`fas ${message.includes('Error') ? 'fa-exclamation-triangle' : 'fa-check-circle'} me-2`}></i>
                      <span>{message}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setMessage('')}
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="service_type" className="form-label">
                        <i className="fas fa-tools me-2"></i>
                        Service Type *
                      </label>
                      <select
                        className="form-select"
                        id="service_type"
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
                        <option value="noise_complaint">Noise Complaint</option>
                        <option value="park_maintenance">Park Maintenance</option>
                        <option value="street_light">Street Light</option>
                        <option value="drainage">Drainage Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="priority" className="form-label">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Priority
                      </label>
                      <select
                        className="form-select"
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <div className="form-text">
                        {formData.priority === 'urgent' && (
                          <span className="text-danger">
                            <i className="fas fa-info-circle me-1"></i>
                            Use urgent only for emergency situations
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">
                      <i className="fas fa-map-marker-alt me-2"></i>
                      Location *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter the exact location of the issue (e.g., '123 Main Street, near the park')"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">
                      <i className="fas fa-file-alt me-2"></i>
                      Description *
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="6"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please describe the issue in detail. Include any relevant information that would help us address it quickly, such as:
• Specific nature of the problem
• When you first noticed it
• Any safety concerns
• Photos or additional details (if available)"
                      required
                    ></textarea>
                    <div className="form-text">
                      Character count: {formData.description.length}/1000
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary me-2"
                      onClick={() => setFormData({
                        service_type: '',
                        description: '',
                        location: '',
                        priority: 'medium'
                      })}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-undo me-2"></i>
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={isSubmitting || !formData.service_type || !formData.description || !formData.location}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Submit Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-list me-2"></i>
                    Your Service Requests
                  </h5>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={loadRequests}
                    disabled={loading}
                  >
                    <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-2`}></i>
                    Refresh
                  </button>
                </div>
              </div>
              <div className="card-body">
                {loading ? (
                  <LoadingSpinner text="Loading your requests..." />
                ) : requests.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No service requests found</h5>
                    <p className="text-muted mb-4">You haven't submitted any service requests yet.</p>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={() => setActiveTab('new')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Submit Your First Request
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Service Type</th>
                          <th>Location</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map(request => (
                          <tr key={request.id} className="request-row">
                            <td className="fw-bold text-primary">#{request.id}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className={`fas ${getServiceIcon(request.service_type)} text-primary me-2`}></i>
                                <span>{formatServiceType(request.service_type)}</span>
                              </div>
                            </td>
                            <td>
                              <div className="text-truncate request-location" style={{ maxWidth: '200px' }} title={request.location}>
                                {request.location}
                              </div>
                            </td>
                            <td>
                              <span className={`priority-badge priority-badge-${request.priority}`}>
                                {request.priority}
                              </span>
                            </td>
                            <td>{getStatusBadge(request.status)}</td>
                            <td>
                              <small className="text-muted">
                                {formatDate(request.created_at)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => viewRequestDetails(request)}
                                  title="View Details"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                {request.status === 'pending' && (
                                  <button 
                                    className="btn btn-outline-warning"
                                    onClick={() => handleQuickAction('followup', request.id)}
                                    title="Send Follow-up"
                                  >
                                    <i className="fas fa-envelope"></i>
                                  </button>
                                )}
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
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      <Modal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        title={`Request Details #${selectedRequest?.id}`}
        size="lg"
      >
        {selectedRequest && (
          <div className="request-details">
            <div className="row">
              <div className="col-md-6">
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="fas fa-info-circle me-2"></i>
                    Service Information
                  </h6>
                  <div className="detail-item">
                    <strong>Type:</strong> 
                    <span className="ms-2">
                      <i className={`fas ${getServiceIcon(selectedRequest.service_type)} text-primary me-2`}></i>
                      {formatServiceType(selectedRequest.service_type)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Priority:</strong> 
                    <span className={`priority-badge priority-badge-${selectedRequest.priority} ms-2`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong> 
                    <span className="ms-2">{getStatusBadge(selectedRequest.status)}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Timeline
                  </h6>
                  <div className="detail-item">
                    <strong>Submitted:</strong> 
                    <span className="ms-2">{formatDate(selectedRequest.created_at)}</span>
                  </div>
                  {selectedRequest.updated_at !== selectedRequest.created_at && (
                    <div className="detail-item">
                      <strong>Last Updated:</strong> 
                      <span className="ms-2">{formatDate(selectedRequest.updated_at)}</span>
                    </div>
                  )}
                </div>
                <div className="detail-section mt-3">
                  <h6 className="section-title">
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Location
                  </h6>
                  <div className="detail-item">
                    {selectedRequest.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <div className="detail-section">
                  <h6 className="section-title">
                    <i className="fas fa-file-alt me-2"></i>
                    Description
                  </h6>
                  <div className="card bg-light border-0">
                    <div className="card-body">
                      <p className="mb-0">{selectedRequest.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {selectedRequest.notes && (
              <div className="row mt-3">
                <div className="col-12">
                  <div className="detail-section">
                    <h6 className="section-title">
                      <i className="fas fa-sticky-note me-2"></i>
                      Admin Notes
                    </h6>
                    <div className="card border-warning bg-warning bg-opacity-10">
                      <div className="card-body">
                        <p className="mb-0">{selectedRequest.notes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const getServiceIcon = (serviceType) => {
  const icons = {
    road_repair: 'fa-road',
    waste_management: 'fa-trash',
    water_supply: 'fa-tint',
    electricity: 'fa-bolt',
    public_safety: 'fa-shield-alt',
    noise_complaint: 'fa-volume-up',
    park_maintenance: 'fa-tree',
    street_light: 'fa-lightbulb',
    drainage: 'fa-water',
    other: 'fa-cog'
  };
  return icons[serviceType] || 'fa-cog';
};

const formatServiceType = (serviceType) => {
  return serviceType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const getPriorityColor = (priority) => {
  const colors = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    urgent: 'dark'
  };
  return colors[priority] || 'secondary';
};

export default ServiceRequest;
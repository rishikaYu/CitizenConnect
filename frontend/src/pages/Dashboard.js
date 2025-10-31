import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { citizenService } from '../../services/citizenService.js';
import { useAuth } from '../../context/AuthContext.js';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner.js';
import ErrorMessage from '../../components/common/ErrorMessage/ErrorMessage';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_requests: 0,
    resolved_requests: 0,
    in_progress_requests: 0,
    avg_resolution_time: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      const [statsData, requestsData] = await Promise.all([
        citizenService.getStats(),
        citizenService.getRecentRequests() 
      ]);
      
      setStats(statsData);
      setRecentRequests(requestsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleViewRequest = (requestId) => {
    navigate(`/services/${requestId}`);
  };

  const handleCreateRequest = () => {
    navigate('/services', { state: { showQuickCreate: true } });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatResolutionTime = (days) => {
    if (days === 0) return 'Same day';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { class: 'priority-badge-high', text: 'High' },
      medium: { class: 'priority-badge-medium', text: 'Medium' },
      low: { class: 'priority-badge-low', text: 'Low' }
    };
    
    const config = priorityConfig[priority] || { class: 'priority-badge-unknown', text: 'Normal' };
    return <span className={`priority-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  return (
    <div className="dashboard">
      {/* Header with Welcome and Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="welcome-card card border-0 shadow-sm">
            <div className="card-body py-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <div className="welcome-avatar me-3">
                      <i className="fas fa-user-circle fa-2x text-primary"></i>
                    </div>
                    <div>
                      <h1 className="h3 mb-1">Welcome back, {user?.name}! 👋</h1>
                      <p className="text-muted mb-0">
                        {stats.total_requests === 0 
                          ? "Ready to submit your first service request?"
                          : `You have ${stats.pending_requests || 0} pending requests`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 text-md-end">
                  <div className="d-flex flex-column flex-md-row justify-content-md-end gap-2">
                    <button 
                      className="btn btn-outline-secondary btn-refresh"
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''} me-2`}></i>
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleCreateRequest}
                    >
                      <i className="fas fa-plus me-2"></i>
                      New Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <ErrorMessage 
              message={error} 
              onRetry={() => loadDashboardData()}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-5">
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-primary mb-3">
                <i className="fas fa-clipboard-list fa-2x"></i>
              </div>
              <h3 className="text-primary">{stats.total_requests || 0}</h3>
              <p className="text-muted mb-0">Total Requests</p>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-warning mb-3">
                <i className="fas fa-clock fa-2x"></i>
              </div>
              <h3 className="text-warning">{stats.pending_requests || 0}</h3>
              <p className="text-muted mb-0">Pending</p>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-success mb-3">
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
              <h3 className="text-success">{stats.resolved_requests || 0}</h3>
              <p className="text-muted mb-0">Resolved</p>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-info mb-3">
                <i className="fas fa-tasks fa-2x"></i>
              </div>
              <h3 className="text-info">{stats.in_progress_requests || 0}</h3>
              <p className="text-muted mb-0">In Progress</p>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-secondary mb-3">
                <i className="fas fa-chart-line fa-2x"></i>
              </div>
              <h3 className="text-secondary">{stats.avg_resolution_time || 0}</h3>
              <p className="text-muted mb-0">Avg. Resolution Days</p>
            </div>
          </div>
        </div>
        <div className="col-xl-2 col-md-4 col-6 mb-3">
          <div className="card stat-card h-100 border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-danger mb-3">
                <i className="fas fa-times-circle fa-2x"></i>
              </div>
              <h3 className="text-danger">{stats.rejected_requests || 0}</h3>
              <p className="text-muted mb-0">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Recent Service Requests
                </h5>
                <div className="d-flex gap-2">
                  <Link to="/services" className="btn btn-outline-primary btn-sm">
                    View All
                  </Link>
                </div>
              </div>
            </div>
            <div className="card-body">
              {recentRequests.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No service requests yet</h5>
                  <p className="text-muted mb-4">Submit your first service request to get started.</p>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleCreateRequest}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create First Request
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Service Type</th>
                        <th>Description</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map(request => (
                        <tr key={request.id} className="request-row">
                          <td className="fw-bold text-primary">#{request.id}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <i className={`fas ${getServiceIcon(request.service_type)} text-primary me-2`}></i>
                              <span>{formatServiceType(request.service_type)}</span>
                            </div>
                          </td>
                          <td>
                            <div 
                              className="text-truncate request-description" 
                              style={{ maxWidth: '250px' }} 
                              title={request.description}
                            >
                              {request.description}
                            </div>
                          </td>
                          <td>
                            {getPriorityBadge(request.priority)}
                          </td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <small className="text-muted">
                              {formatDate(request.created_at)}
                            </small>
                          </td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewRequest(request.id)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
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

export default Dashboard;
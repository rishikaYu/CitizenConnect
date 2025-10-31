import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5 className="fw-bold">
              <i className="fas fa-city me-2"></i>
              CitizenConnect
            </h5>
            <p className="mb-0">
              Your trusted platform for city services and community engagement.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              &copy; 2025 CitizenConnect. All rights reserved.
            </p>
            <small>
              Built with <i className="fas fa-heart text-danger"></i> for better communities
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

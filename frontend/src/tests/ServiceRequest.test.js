import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServiceRequest from '../pages/ServiceRequest/ServiceRequest';
import { citizenService } from '../services/citizenService';
import { useAuth } from '../context/AuthContext';

// Mock the services
jest.mock('../services/citizenService');
jest.mock('../context/AuthContext');

describe('ServiceRequest Component', () => {
  const mockUser = { id: 1, name: 'John Doe' };
  const mockRequests = [
    {
      id: 1,
      service_type: 'road_repair',
      description: 'Pothole issue',
      location: 'Main Street',
      priority: 'high',
      status: 'pending',
      created_at: '2024-01-15T10:30:00Z'
    }
  ];

  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    citizenService.createRequest.mockResolvedValue({ 
      message: 'Request created successfully' 
    });
    citizenService.getRecentRequests.mockResolvedValue(mockRequests);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders service request form', () => {
    render(
      <BrowserRouter>
        <ServiceRequest />
      </BrowserRouter>
    );

    expect(screen.getByText('Service Requests')).toBeInTheDocument();
    expect(screen.getByText('New Request')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(
      <BrowserRouter>
        <ServiceRequest />
      </BrowserRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Service Type/i), {
      target: { value: 'road_repair' }
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: '123 Main St' }
    });
    fireEvent.change(screen.getByLabelText(/Priority/i), {
      target: { value: 'high' }
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Large pothole causing traffic issues' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(citizenService.createRequest).toHaveBeenCalledWith({
        service_type: 'road_repair',
        location: '123 Main St',
        priority: 'high',
        description: 'Large pothole causing traffic issues'
      });
    });
  });

  test('displays success message after submission', async () => {
    render(
      <BrowserRouter>
        <ServiceRequest />
      </BrowserRouter>
    );

    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText(/Service Type/i), {
      target: { value: 'road_repair' }
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: '123 Main St' }
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Test description' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(screen.getByText(/Request submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('switches to history tab and displays requests', async () => {
    render(
      <BrowserRouter>
        <ServiceRequest />
      </BrowserRouter>
    );

    // Switch to history tab
    fireEvent.click(screen.getByText(/Request History/i));

    await waitFor(() => {
      expect(citizenService.getRecentRequests).toHaveBeenCalled();
      expect(screen.getByText('Pothole issue')).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    render(
      <BrowserRouter>
        <ServiceRequest />
      </BrowserRouter>
    );

    // Try to submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Submit Request/i }));

    await waitFor(() => {
      expect(citizenService.createRequest).not.toHaveBeenCalled();
    });
  });
});
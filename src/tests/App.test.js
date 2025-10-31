import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import App from '../App';

// Mock the services
jest.mock('../services/authService', () => ({
  authService: {
    verifyToken: jest.fn(),
    login: jest.fn(),
    register: jest.fn()
  }
}));

jest.mock('../services/citizenService', () => ({
  citizenService: {
    getStats: jest.fn(),
    getRecentRequests: jest.fn(),
    createRequest: jest.fn()
  }
}));

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  test('renders login page by default when not authenticated', async () => {
    renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    });
  });

  test('renders app name in navbar', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByText(/CitizenConnect/i)).toBeInTheDocument();
  });

  test('has all main navigation links', () => {
    renderWithProviders(<App />);
    
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
  });
});
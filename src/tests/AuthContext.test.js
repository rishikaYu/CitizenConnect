import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

// Mock the authService
jest.mock('../services/authService');

const TestComponent = () => {
  const { user, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.name : 'No user'}</span>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => register({ name: 'Test', email: 'test@example.com' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides initial null user', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user').textContent).toBe('No user');
  });

  test('login function updates user state', async () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
    const mockToken = 'mock-jwt-token';
    
    authService.login.mockResolvedValue({
      user: mockUser,
      token: mockToken
    });

    const { getByTestId, getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Login').click();
    });

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(getByTestId('user').textContent).toBe('Test User');
    expect(localStorage.getItem('token')).toBe(mockToken);
  });

  test('logout function clears user state and token', async () => {
    // First set a user and token
    const mockUser = { id: 1, name: 'Test User' };
    localStorage.setItem('token', 'mock-token');

    const { getByTestId, getByText } = render(
      <AuthProvider value={{ user: mockUser }}>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      getByText('Logout').click();
    });

    expect(getByTestId('user').textContent).toBe('No user');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('handles token verification on mount', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    localStorage.setItem('token', 'mock-token');
    authService.verifyToken.mockResolvedValue(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(authService.verifyToken).toHaveBeenCalled();
  });
});
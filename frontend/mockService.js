// Mock service for frontend functionality
export const mockService = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock login
  login: async (email, password) => {
    await mockService.delay(1000);
    if (email && password) {
      return {
        success: true,
        user: {
          id: 1,
          name: 'Test User',
          email: email,
          phone: '+1234567890',
          address: '123 Test Street'
        },
        token: 'mock-jwt-token'
      };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  // Mock register
  register: async (userData) => {
    await mockService.delay(1000);
    if (userData.email && userData.password) {
      return {
        success: true,
        user: {
          id: 1,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          address: userData.address
        },
        token: 'mock-jwt-token'
      };
    }
    return { success: false, message: 'Registration failed' };
  },

  // Mock service requests data
  getRecentRequests: async () => {
    await mockService.delay(600);
    return [
      {
        id: 1,
        service_type: 'road_repair',
        description: 'Large pothole on Main Street',
        location: '123 Main Street',
        priority: 'high',
        status: 'pending',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        service_type: 'waste_management',
        description: 'Garbage not collected for 3 days',
        location: '456 Oak Avenue',
        priority: 'medium',
        status: 'in_progress',
        created_at: '2024-01-14T09:15:00Z'
      },
      {
        id: 3,
        service_type: 'water_supply',
        description: 'Low water pressure in building',
        location: '789 Pine Road',
        priority: 'high',
        status: 'resolved',
        created_at: '2024-01-12T14:20:00Z'
      }
    ];
  },

  // Mock create service request
  createRequest: async (requestData) => {
    await mockService.delay(1000);
    return {
      message: 'Service request submitted successfully!',
      request: {
        id: Math.floor(Math.random() * 1000),
        ...requestData,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    };
  }
};
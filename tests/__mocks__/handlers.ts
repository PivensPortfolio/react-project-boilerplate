import { http, HttpResponse } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user' as const,
        },
        token: 'mock-jwt-token',
      },
      message: 'Login successful',
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      data: null,
      message: 'Logout successful',
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      },
      message: 'User retrieved successfully',
    });
  }),

  // User endpoints
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user' as const,
        },
        {
          id: '2',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as const,
        },
      ],
      message: 'Users retrieved successfully',
    });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      success: true,
      data: {
        id,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user' as const,
      },
      message: 'User retrieved successfully',
    });
  }),

  // Generic API error handler
  http.get('/api/error', () => {
    return HttpResponse.json(
      {
        success: false,
        data: null,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }),

  // Network error simulation
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),
];
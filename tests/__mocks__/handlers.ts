import { http, HttpResponse } from 'msw';

// Types for API responses
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    emailVerified: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
];

// Helper function to create API responses
const createApiResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => ({
  data,
  message,
  success: true,
});

const createApiError = (message: string, status: number = 400, errors?: ValidationError[]) => {
  return HttpResponse.json(
    {
      data: null,
      message,
      success: false,
      errors,
    },
    { status }
  );
};

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (!body.email || !body.password) {
      return createApiError('Email and password are required', 400, [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password is required' },
      ]);
    }

    if (body.email === 'invalid@example.com') {
      return createApiError('Invalid credentials', 401);
    }

    const user = mockUsers.find(u => u.email === body.email) || mockUsers[0];
    
    return HttpResponse.json(createApiResponse({
      user,
      token: 'mock-jwt-token',
    }, 'Login successful'));
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(createApiResponse(null, 'Logout successful'));
  }),

  http.post('/api/auth/refresh', () => {
    return HttpResponse.json(createApiResponse({
      token: 'new-mock-jwt-token',
    }, 'Token refreshed'));
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createApiError('Unauthorized', 401);
    }

    return HttpResponse.json(createApiResponse(mockUsers[0], 'User retrieved successfully'));
  }),

  // User endpoints
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');

    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json(createApiResponse({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
      },
    }, 'Users retrieved successfully'));
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);
    
    if (!user) {
      return createApiError('User not found', 404);
    }

    return HttpResponse.json(createApiResponse(user, 'User retrieved successfully'));
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json() as Partial<User>;
    
    if (!body.name || !body.email) {
      return createApiError('Name and email are required', 400, [
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Email is required' },
      ]);
    }

    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      isActive: body.isActive ?? true,
      emailVerified: body.emailVerified ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    };

    mockUsers.push(newUser);
    return HttpResponse.json(createApiResponse(newUser, 'User created successfully'), { status: 201 });
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<User>;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return createApiError('User not found', 404);
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(createApiResponse(mockUsers[userIndex], 'User updated successfully'));
  }),

  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const userIndex = mockUsers.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return createApiError('User not found', 404);
    }

    mockUsers.splice(userIndex, 1);
    return HttpResponse.json(createApiResponse(null, 'User deleted successfully'));
  }),

  // Error simulation endpoints
  http.get('/api/error/400', () => {
    return createApiError('Bad Request', 400);
  }),

  http.get('/api/error/401', () => {
    return createApiError('Unauthorized', 401);
  }),

  http.get('/api/error/403', () => {
    return createApiError('Forbidden', 403);
  }),

  http.get('/api/error/404', () => {
    return createApiError('Not Found', 404);
  }),

  http.get('/api/error/500', () => {
    return createApiError('Internal Server Error', 500);
  }),

  // Network error simulation
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),

  // Slow response simulation
  http.get('/api/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json(createApiResponse({ message: 'Slow response' }));
  }),

  // Validation error simulation
  http.post('/api/validate', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    const errors: ValidationError[] = [];

    if (!body.email) {
      errors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(body.email)) {
      errors.push({ field: 'email', message: 'Email is invalid' });
    }

    if (!body.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (body.password.length < 8) {
      errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (errors.length > 0) {
      return createApiError('Validation failed', 400, errors);
    }

    return HttpResponse.json(createApiResponse({ message: 'Validation passed' }));
  }),
];
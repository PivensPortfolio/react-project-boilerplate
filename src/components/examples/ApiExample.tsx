/**
 * API Service Example Component
 * Demonstrates how to use the API service layer with hooks
 */

import React, { useState } from 'react';
import { useApiService, usePaginatedApi, useMutation } from '../../hooks/useApi';
import { userService, authService, User, CreateUserRequest } from '../../services';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Loading } from '../ui/Loading';

const ApiExample: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Example: Get current user
  const {
    data: currentUser,
    loading: currentUserLoading,
    error: currentUserError,
    execute: fetchCurrentUser,
  } = useApiService(() => authService.getCurrentUser(), {
    immediate: false,
  });

  // Example: Paginated users list
  const {
    data: users,
    meta: usersMeta,
    loading: usersLoading,
    error: usersError,
    nextPage,
    prevPage,
    updateParams,
    refetch: refetchUsers,
  } = usePaginatedApi(
    (params) => userService.getUsers(params),
    { limit: 5 }
  );

  // Example: Get single user
  const {
    data: selectedUser,
    loading: selectedUserLoading,
    error: selectedUserError,
    execute: fetchUser,
  } = useApiService((id: string) => userService.getUserById(id), {
    immediate: false,
  });

  // Example: Create user mutation
  const {
    data: createdUser,
    loading: createUserLoading,
    error: createUserError,
    mutate: createUser,
  } = useMutation((userData: CreateUserRequest) => userService.createUser(userData), {
    onSuccess: (user) => {
      console.log('User created successfully:', user);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      refetchUsers(); // Refresh the users list
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });

  // Example: Delete user mutation
  const {
    loading: deleteUserLoading,
    error: deleteUserError,
    mutate: deleteUser,
  } = useMutation((id: string) => userService.deleteUser(id), {
    onSuccess: () => {
      console.log('User deleted successfully');
      refetchUsers(); // Refresh the users list
    },
  });

  const handleFetchUser = () => {
    if (selectedUserId) {
      fetchUser(selectedUserId);
    }
  };

  const handleCreateUser = () => {
    if (newUser.name && newUser.email) {
      createUser(newUser);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  const handleSearch = (searchTerm: string) => {
    updateParams({ search: searchTerm } as any);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Service Layer Examples</h2>

      {/* Current User Section */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Current User</h3>
        <Button onClick={fetchCurrentUser} disabled={currentUserLoading}>
          {currentUserLoading ? 'Loading...' : 'Fetch Current User'}
        </Button>
        
        {currentUserError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {currentUserError}
          </div>
        )}
        
        {currentUser && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Name:</strong> {currentUser.name}<br />
            <strong>Email:</strong> {currentUser.email}<br />
            <strong>Role:</strong> {currentUser.role}
          </div>
        )}
      </section>

      {/* Users List Section */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Users List (Paginated)</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <Input
            placeholder="Search users..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <Button onClick={refetchUsers}>Refresh</Button>
        </div>

        {usersLoading && <Loading />}
        
        {usersError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Error: {usersError}
          </div>
        )}

        {users && users.length > 0 && (
          <div>
            <div style={{ marginBottom: '15px' }}>
              {users.map((user: User) => (
                <div
                  key={user.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong>{user.name}</strong> ({user.email}) - {user.role}
                  </div>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deleteUserLoading}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {usersMeta && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={prevPage} disabled={!usersMeta.hasPrev}>
                  Previous
                </Button>
                <span>
                  Page {usersMeta.page} of {usersMeta.totalPages} 
                  ({usersMeta.total} total users)
                </span>
                <Button onClick={nextPage} disabled={!usersMeta.hasNext}>
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {deleteUserError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Delete Error: {deleteUserError}
          </div>
        )}
      </section>

      {/* Single User Section */}
      <section style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Get Single User</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <Input
            placeholder="Enter user ID"
            value={selectedUserId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedUserId(e.target.value)}
          />
          <Button onClick={handleFetchUser} disabled={selectedUserLoading || !selectedUserId}>
            {selectedUserLoading ? 'Loading...' : 'Fetch User'}
          </Button>
        </div>

        {selectedUserError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            Error: {selectedUserError}
          </div>
        )}

        {selectedUser && (
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>ID:</strong> {selectedUser.id}<br />
            <strong>Name:</strong> {selectedUser.name}<br />
            <strong>Email:</strong> {selectedUser.email}<br />
            <strong>Role:</strong> {selectedUser.role}<br />
            <strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}
          </div>
        )}
      </section>

      {/* Create User Section */}
      <section style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Create New User</h3>
        <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
          />
          <Input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'user' | 'moderator' }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>

        <Button
          onClick={handleCreateUser}
          disabled={createUserLoading || !newUser.name || !newUser.email || !newUser.password}
        >
          {createUserLoading ? 'Creating...' : 'Create User'}
        </Button>

        {createUserError && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {createUserError}
          </div>
        )}

        {createdUser && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
            User created successfully: {createdUser.name} ({createdUser.email})
          </div>
        )}
      </section>
    </div>
  );
};

export default ApiExample;
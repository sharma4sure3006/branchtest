import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'user'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.list();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!newUser.username.trim()) errors.username = 'Username is required';
    if (!newUser.email.trim()) errors.email = 'Email is required';
    if (!newUser.password) errors.password = 'Password is required';
    if (!newUser.full_name.trim()) errors.full_name = 'Full name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await usersAPI.create(newUser);
      setNewUser({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'user'
      });
      setShowCreateForm(false);
      setFormErrors({});
      fetchUsers();
    } catch (err) {
      setFormErrors({ submit: err.message || 'Failed to create user' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn btn-primary"
        >
          {showCreateForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Create User Form */}
      {showCreateForm && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create New User</h2>

          {formErrors.submit && (
            <div className="mb-4 rounded-md bg-error-50 dark:bg-error-900/20 p-4">
              <p className="text-sm text-error-800 dark:text-error-200">{formErrors.submit}</p>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username *
              </label>
              <input
                name="username"
                type="text"
                value={newUser.username}
                onChange={handleInputChange}
                className={`input ${formErrors.username ? 'border-error-500' : ''}`}
                placeholder="johndoe"
              />
              {formErrors.username && (
                <p className="mt-1 text-sm text-error-600">{formErrors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
                className={`input ${formErrors.email ? 'border-error-500' : ''}`}
                placeholder="john@company.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-error-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                name="full_name"
                type="text"
                value={newUser.full_name}
                onChange={handleInputChange}
                className={`input ${formErrors.full_name ? 'border-error-500' : ''}`}
                placeholder="John Doe"
              />
              {formErrors.full_name && (
                <p className="mt-1 text-sm text-error-600">{formErrors.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password *
              </label>
              <input
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
                className={`input ${formErrors.password ? 'border-error-500' : ''}`}
                placeholder="••••••••"
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-error-600">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                className="input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormErrors({});
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-error-50 dark:bg-error-900/20 p-4">
          <p className="text-sm text-error-800 dark:text-error-200">{error}</p>
        </div>
      )}

      {/* Users List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active
                        ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                        : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
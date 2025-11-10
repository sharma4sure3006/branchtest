import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { driftsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriftList = () => {
  const { user } = useAuth();
  const [drifts, setDrifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assigned_to: '',
    search: ''
  });

  useEffect(() => {
    fetchDrifts();
  }, [filters]);

  const fetchDrifts = async () => {
    try {
      setLoading(true);
      const params = {};

      // Add filters if they have values
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key];
        }
      });

      const response = await driftsAPI.list(params);
      setDrifts(response.drifts || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch drifts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Drifts</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage issues</p>
        </div>
        <Link
          to="/drifts/new"
          className="btn btn-primary"
        >
          New Drift
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search drifts..."
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assigned_to}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              className="input"
            >
              <option value="">All Assignees</option>
              <option value={user?.id}>Assigned to me</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-error-50 dark:bg-error-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-error-800 dark:text-error-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Drifts List */}
      {drifts.length === 0 ? (
        <div className="card p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No drifts found</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {Object.values(filters).some(v => v)
              ? 'Try adjusting your filters or search terms'
              : 'Get started by creating your first drift'
            }
          </p>
          {!Object.values(filters).some(v => v) && (
            <Link
              to="/drifts/new"
              className="mt-4 inline-flex btn btn-primary"
            >
              Create Drift
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {drifts.map((drift) => (
                  <tr key={drift.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <Link
                        to={`/drifts/${drift.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        {drift.title}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {drift.description}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-${drift.status}`}>
                        {drift.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`priority-${drift.priority}`}>
                        {drift.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                      {drift.assigned_to ? (
                        <div className="flex items-center">
                          <div className="h-6 w-6 bg-primary-500 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-white">
                              {drift.assigned_to.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          {drift.assigned_to.full_name || drift.assigned_to.username}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(drift.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link
                        to={`/drifts/${drift.id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriftList;
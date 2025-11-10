import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driftsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DriftForm = ({ editMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to_id: ''
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (editMode && id) {
      fetchDrift();
    }
  }, [editMode, id]);

  const fetchDrift = async () => {
    try {
      setLoading(true);
      const drift = await driftsAPI.get(id);
      setFormData({
        title: drift.title || '',
        description: drift.description || '',
        priority: drift.priority || 'medium',
        assigned_to_id: drift.assigned_to_id || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch drift');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        assigned_to_id: formData.assigned_to_id || null
      };

      if (editMode) {
        await driftsAPI.update(id, submitData);
      } else {
        await driftsAPI.create(submitData);
      }

      navigate('/drifts');
    } catch (err) {
      setError(err.message || `Failed to ${editMode ? 'update' : 'create'} drift`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (loading && editMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {editMode ? 'Edit Drift' : 'Create New Drift'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {editMode ? 'Update the drift details below' : 'Fill in the details to create a new drift'}
        </p>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-4 rounded-md bg-error-50 dark:bg-error-900/20 p-4">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleInputChange}
              className={`mt-1 input ${validationErrors.title ? 'border-error-500 focus:ring-error-500' : ''}`}
              placeholder="Brief description of the issue"
              disabled={loading}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{validationErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 input"
              placeholder="Detailed description of the issue, steps to reproduce, etc."
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="mt-1 input"
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign to
              </label>
              <select
                id="assigned_to_id"
                name="assigned_to_id"
                value={formData.assigned_to_id}
                onChange={handleInputChange}
                className="mt-1 input"
                disabled={loading}
              >
                <option value="">Unassigned</option>
                <option value={user?.id}>Assign to me</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate('/drifts')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editMode ? 'Update Drift' : 'Create Drift'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriftForm;
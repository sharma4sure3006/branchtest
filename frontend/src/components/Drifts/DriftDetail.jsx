import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { driftsAPI, commentsAPI } from '../../services/api';

const DriftDetail = () => {
  const { id } = useParams();
  const [drift, setDrift] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDrift();
    fetchComments();
  }, [id]);

  const fetchDrift = async () => {
    try {
      const data = await driftsAPI.get(id);
      setDrift(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch drift');
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentsAPI.list(id);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-error-600 dark:text-error-400">{error}</div>
        <Link to="/drifts" className="mt-4 inline-flex btn btn-primary">
          Back to Drifts
        </Link>
      </div>
    );
  }

  if (!drift) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Drift not found</h1>
        <Link to="/drifts" className="mt-4 inline-flex btn btn-primary">
          Back to Drifts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {drift.title}
          </h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`status-${drift.status}`}>
              {drift.status.replace('_', ' ')}
            </span>
            <span className={`priority-${drift.priority}`}>
              {drift.priority}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/drifts/${drift.id}/edit`}
            className="btn btn-secondary"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drift Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {drift.description || 'No description provided'}
            </p>
          </div>

          {/* Comments */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Comments ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {comment.author?.full_name || comment.author?.username}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Details
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created by</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {drift.created_by?.full_name || drift.created_by?.username}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned to</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {drift.assigned_to?.full_name || drift.assigned_to?.username || 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(drift.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last updated</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(drift.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Actions
            </h2>
            <div className="space-y-3">
              <button className="w-full btn btn-secondary">
                Add Comment
              </button>
              <select className="w-full input">
                <option value="">Change Status</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Back Navigation */}
      <div className="mt-6">
        <Link
          to="/drifts"
          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
        >
          ← Back to Drifts
        </Link>
      </div>
    </div>
  );
};

export default DriftDetail;
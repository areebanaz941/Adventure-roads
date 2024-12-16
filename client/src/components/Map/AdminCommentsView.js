import React, { useState, useEffect } from 'react';
import axios from '../Forms/axiosconfig';

const AdminCommentsDashboard = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sort function to ensure latest comments are first
  const sortCommentsByDate = (comments) => {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA; // Most recent first
    });
  };

  useEffect(() => {
    fetchAllComments();
  }, []);

  const fetchAllComments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/comments');
      
      if (response.data.success) {
        // Sort comments with the latest first
        const sortedComments = sortCommentsByDate(response.data.data);
        setComments(sortedComments);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/comments/${commentId}`);

      if (response.data.success) {
        // Remove the deleted comment and ensure sort order is maintained
        setComments(prevComments => {
          const updatedComments = prevComments.filter(c => c._id !== commentId);
          return sortCommentsByDate(updatedComments);
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError('Failed to delete comment');
      console.error('Error deleting comment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">User Comments</h2>
      <div className="grid gap-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-lg">{comment.routeName}</h3>
                  <p className="text-sm text-gray-500">by {comment.username}</p>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-700">{comment.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No comments to review</p>
        )}
      </div>
    </div>
  );
};

export default AdminCommentsDashboard;
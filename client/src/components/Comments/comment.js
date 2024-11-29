import React, { useState, useEffect } from 'react';
import axios from '../Forms//axiosconfig';  // Adjust the path based on your file structure


const CommentSection = ({ routeName }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (routeName) {
      fetchComments();
    }
  }, [routeName]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching comments for route:', routeName);
      const response = await axios.get(`/api/comments/${encodeURIComponent(routeName)}`);
      
      if (response.data.success) {
        setComments(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setError(null);
      const response = await axios.post('/api/comments', {
        routeName,
        username: user.username,
        content: newComment.trim()
      });

      if (response.data.success) {
        setNewComment('');
        fetchComments();
      } else {
        throw new Error(response.data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comments here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          disabled={!user}
        />
        <button 
          type="submit"
          className={`w-full py-2 rounded-md ${
            user 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!user || !newComment.trim()}
        >
          {user ? 'Submit Comment' : 'Please login to comment'}
        </button>
      </form>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded-md">
              <div className="font-medium text-blue-600">{comment.username}</div>
              <div className="text-gray-600 text-sm">
                {new Date(comment.timestamp).toLocaleDateString()}
              </div>
              <div className="mt-2">{comment.content}</div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
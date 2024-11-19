import React, { useState, useEffect } from 'react';
import axios from './axiosconfig';

const CommentSection = ({ routeName }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchComments();
  }, [routeName]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments/${routeName}`);
      if (response.data.success) {
        setComments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to comment');
      return;
    }

    try {
      const response = await axios.post('/api/comments', {
        routeName,
        username: user.username,
        content: newComment
      });

      if (response.data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comments here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Submit Comment
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment._id} className="bg-gray-50 p-4 rounded-md">
            <div className="font-medium text-blue-600">{comment.username}</div>
            <div className="text-gray-600 text-sm">
              {new Date(comment.timestamp).toLocaleDateString()}
            </div>
            <div className="mt-2">{comment.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
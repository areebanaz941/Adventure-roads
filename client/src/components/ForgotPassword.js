import React, { useState } from 'react';
import axios from './Forms/axiosconfig';

const ForgotPassword = ({ onClose }) => {
  const [resetEmail, setResetEmail] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/user/forgot-password', { email: resetEmail });
      if (response.data.success) {
        setNotification({
          show: true,
          message: 'Password reset instructions sent to your email',
          type: 'success'
        });
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Failed to send reset instructions',
        type: 'error'
      });
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <input
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border border-gray-300 rounded-md"
          required
        />
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
        >
          Send Reset Instructions
        </button>
      </form>
      
      {notification.show && (
        <div className={`mt-4 p-4 rounded-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
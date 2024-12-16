// components/ResetPassword.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from './Forms/axiosconfig';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setNotification({
        show: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    try {
      const response = await axios.post(`/api/user/reset-password/${token}`, {
        newPassword
      });

      if (response.data.success) {
        setNotification({
          show: true,
          message: 'Password reset successful!',
          type: 'success'
        });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Failed to reset password',
        type: 'error'
      });
    }
    const handleForgotPassword = async (e) => {
  e.preventDefault();
  try {
    // Make sure this matches your backend route exactly
    const response = await axios.post('/api/user/reset-password', { email: resetEmail });
    if (response.data.success) {
      setNotification({
        show: true,
        message: 'Password reset instructions sent to your email',
        type: 'success'
      });
      setShowForgotPassword(false);
    }
  } catch (error) {
    setNotification({
      show: true,
      message: error.response?.data?.message || 'Failed to send reset instructions',
      type: 'error'
    });
  }
};
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-md"
            required
          />
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600"
          >
            Reset Password
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
    </div>
  );
};

export default ResetPassword;
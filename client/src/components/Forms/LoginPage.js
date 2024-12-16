import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../Forms/axiosconfig';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    vehicleInfo: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value
    });
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({
      ...signupData,
      [name]: value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
       const response = await axios.post('/api/user/login', loginData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        setNotification({
          show: true,
          message: 'Login successful!',
          type: 'success'
        });
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Invalid credentials',
        type: 'error'
      });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('/api/user', signupData);
      if (response.data.success) {
        setNotification({
          show: true,
          message: 'Account created successfully! Please log in.',
          type: 'success'
        });
        setShowSignup(false);
      }
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Registration failed',
        type: 'error'
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        <form onSubmit={handleLogin}>
          <input
            type="text"
            name="emailOrUsername"
            placeholder="Email address or username"
            value={loginData.emailOrUsername}
            onChange={handleLoginChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="mt-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-500 text-white py-3 mt-6 rounded-md hover:bg-blue-600 transition-colors"
          >
            Log in
          </button>
        </form>
        <div className="text-center">
          <button 
            onClick={() => setShowSignup(true)}
            className="bg-green-500 text-white px-8 py-3 rounded-md hover:bg-green-600 transition-colors"
          >
            Create new account
          </button>
        </div>
        <div className="text-center mt-4">
  <button 
    onClick={() => setShowForgotPassword(true)}
    className="text-blue-500 hover:text-blue-600 text-sm"
  >
    Forgot your password?
  </button>
</div>

      </div>

      {showSignup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signupData.email}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={signupData.username}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signupData.password}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={signupData.confirmPassword}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={signupData.firstName}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={signupData.lastName}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Where do you live?"
                value={signupData.location}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="vehicleInfo"
                placeholder="What are you riding?"
                value={signupData.vehicleInfo}
                onChange={handleSignupChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex space-x-4">
                <button 
                  type="button"
                  onClick={() => setShowSignup(false)}
                  className="w-1/2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForgotPassword && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <p className="text-gray-600 mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
        <input
          type="email"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="flex space-x-4">
          <button 
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-1/2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="w-1/2 bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600"
          >
            Send Instructions
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {notification.show && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg ${
  notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
} text-white z-50`}>
  {notification.message}
</div>
      )}
    </div>
  );
};

export default LoginPage;
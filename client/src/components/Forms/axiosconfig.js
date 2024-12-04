// src/utils/axios-config.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://adventure-roads-backend.onrender.com', // or your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
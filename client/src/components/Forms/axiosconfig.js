// src/utils/axios-config.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
   // or your backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
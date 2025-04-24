import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://142.93.0.157:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 

import axios from 'axios';

// Configuración base de Axios (en caso se necesite consumir una API externa además de Firebase)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores para añadir tokens u otras lógicas globales
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
  },
  (error) => Promise.reject(error)
);

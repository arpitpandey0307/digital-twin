import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);
export const getMe = () => api.get('/api/auth/me');

// Dashboard
export const getDashboardOverview = () => api.get('/api/dashboard/overview');

// Complaints
export const getComplaints = (params) => api.get('/api/complaints', { params });
export const createComplaint = (data) => api.post('/api/complaints', data);
export const updateComplaint = (id, data) => api.patch(`/api/complaints/${id}`, data);
export const analyzeImage = (formData) => api.post('/api/complaints/analyze-image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Weather / AQI / Traffic
export const getCurrentWeather = () => api.get('/api/weather/current');
export const getWeatherHistory = (params) => api.get('/api/weather/history', { params });
export const getCurrentAQI = () => api.get('/api/aqi/current');
export const getAQIHistory = (params) => api.get('/api/aqi/history', { params });
export const getCurrentTraffic = () => api.get('/api/traffic/current');

// Predictions & Alerts
export const getPredictions = (params) => api.get('/api/predictions', { params });
export const getAlerts = (params) => api.get('/api/alerts', { params });
export const acknowledgeAlert = (id) => api.patch(`/api/alerts/${id}/acknowledge`);
export const resolveAlert = (id) => api.patch(`/api/alerts/${id}/resolve`);

// AI Chat
export const sendChatMessage = (question) => api.post('/api/chat', { question });
export const getChatHistory = () => api.get('/api/chat/history');
export const getChatSuggestions = () => api.get('/api/chat/suggestions');

// Simulation
export const runSimulation = (params) => api.post('/api/simulation/run', params);
export const getSimulationHistory = () => api.get('/api/simulation/history');
export const getSimulationPresets = () => api.get('/api/simulation/presets');

// Map
export const getMapComplaints = () => api.get('/api/map/complaints');
export const getMapInfrastructure = () => api.get('/api/map/infrastructure');
export const getMapWards = () => api.get('/api/map/wards');

export default api;

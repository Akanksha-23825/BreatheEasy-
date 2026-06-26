import axios from 'axios';

const BASE = 'http://127.0.0.1:5000';

export const getAQI = (city) =>
    axios.get(`${BASE}/api/aqi/${city}`);

export const getExposure = (userId) =>
    axios.get(`${BASE}/api/exposure/${userId}`);

export const getAdvisory = (userId) =>
    axios.get(`${BASE}/api/advisory/${userId}`);

export const getTrend = (userId) =>
    axios.get(`${BASE}/api/trend/${userId}`);

export const getForecast = (city) =>
    axios.get(`${BASE}/api/forecast/${city}`);

export const registerUser = (data) =>
    axios.post(`${BASE}/api/register`, data);

export const getAlerts = (userId) =>
    axios.get(`${BASE}/api/alerts/${userId}`);

export const getHeatmap = (city) =>
    axios.get(`${BASE}/api/heatmap/${city}`);

export const getMLAdvisory = (userId) =>
    axios.get(`${BASE}/api/ml-advisory/${userId}`);

export const loginUser = (data) =>
    axios.post(`${BASE}/api/login`, data);

// Admin endpoints
export const adminLogin = (data) =>
    axios.post(`${BASE}/api/admin/login`, data);

export const adminRegister = (data) =>
    axios.post(`${BASE}/api/admin/register`, data);

export const getUserProfile = (userId) =>
    axios.get(`${BASE}/api/user/${userId}`);

export const updateUserProfile = (userId, data) =>
    axios.put(`${BASE}/api/user/${userId}`, data);


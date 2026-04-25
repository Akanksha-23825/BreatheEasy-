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
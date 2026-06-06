import axios from 'axios';
import type { WeatherData, ForecastData, TrendsData, UsageData, HealthData } from '../types/weather';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({

  baseURL: BASE_URL,
  timeout: 10000,
});

export { fetchCurrentWeather, fetchForecast, fetchTrends, fetchUsage, fetchHealth };

async function fetchCurrentWeather(): Promise<WeatherData> {
  const response = await apiClient.get<WeatherData>('/weather/current');
  return response.data;
}

async function fetchForecast(): Promise<ForecastData> {
  const response = await apiClient.get<ForecastData>('/weather/forecast');
  return response.data;
}

async function fetchTrends(days: 7 | 14 | 30 = 7): Promise<TrendsData> {
  const response = await apiClient.get<TrendsData>(`/weather/trends?days=${days}`);
  return response.data;
}

async function fetchUsage(): Promise<UsageData> {
  const response = await apiClient.get<UsageData>('/system/usage');
  return response.data;
}

async function fetchHealth(): Promise<HealthData> {
  const response = await apiClient.get<HealthData>('/health');
  return response.data;
}
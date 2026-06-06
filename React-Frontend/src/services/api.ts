import axios from 'axios';
import type { WeatherData, ForecastData, TrendsData, UsageData, HealthData } from '../types/weather';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({

  baseURL: BASE_URL,
timeout: 30000,
});

export { fetchCurrentWeather, fetchForecast, fetchTrends, fetchUsage, fetchHealth };

type Coords = { lat: number; lon: number };

async function fetchCurrentWeather(coords?: Partial<Coords>): Promise<WeatherData> {
  const { lat, lon } = coords || {};
  const response = await apiClient.get<WeatherData>(
    lat != null && lon != null
      ? `/weather/current?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      : '/weather/current'
  );
  return response.data;
}

async function fetchForecast(coords?: Partial<Coords>): Promise<ForecastData> {
  const { lat, lon } = coords || {};
  const response = await apiClient.get<ForecastData>(
    lat != null && lon != null
      ? `/weather/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      : '/weather/forecast'
  );
  return response.data;
}

async function fetchTrends(days: 7 | 14 | 30 = 7, coords?: Partial<Coords>): Promise<TrendsData> {
  const { lat, lon } = coords || {};

  // Backend currently only uses days + historical records; location is optional for filtering.
  // We only send lat/lon if your backend supports it in the future.
  // For now, keep behavior unchanged when coords are not provided.
  const response = await apiClient.get<TrendsData>(
    coords && lat != null && lon != null
      ? `/weather/trends?days=${days}&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`
      : `/weather/trends?days=${days}`
  );
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
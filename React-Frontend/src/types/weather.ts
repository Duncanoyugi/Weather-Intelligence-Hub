export interface Risk {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  score: number;
  factors: string[];
}

export interface Recommendations {
  recommendations: string[];
  priority: 'URGENT' | 'IMPORTANT' | 'INFORMATIONAL';
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rain_probability: number;
  wind_speed: number;
  risk: Risk;
  recommendations: Recommendations;
  source: 'api' | 'cache';
  fetched_at: string;
}

export interface ForecastDay {
  date: string;
  temperature_high: number;
  temperature_low: number;
  rain_probability: number;
  wind_speed: number;
  risk: Risk;
}

export interface ForecastData {
  location: string;
  forecast: ForecastDay[];
  fetched_at: string;
}

export interface TrendsData {
  records_found: number;
  daily_data: Array<{
    date: string;
    temperature: number;
    humidity: number;
    rain_probability: number;
    risk_score: string;
  }>;
  date_range: {
    from: string;
    to: string;
  };
  averages: {
    temperature: number | null;
    humidity: number | null;
    rain_probability: number | null;
  };
  extremes: {
    max_temperature: number | null;
    min_temperature: number | null;
  };
  risk_distribution: Array<{
    risk_score: string;
    count: number;
  }>;
}

export interface UsageData {
  status: string;
  usage: {
    quota_total: number;
    quota_used: number;
    quota_remaining: number;
    quota_remaining_percent: number;
  };
  warning: boolean;
}

export interface HealthData {
  status: string;
  timestamp: string;
  services: {
    database: string;
    cache: string;
  };
}
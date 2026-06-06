import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import CurrentWeather from './components/CurrentWeather';
import Forecast from './components/Forecast';
import Trends from './components/Trends';
import Usage from './components/Usage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchCurrentWeather, fetchForecast, fetchTrends, fetchUsage, fetchHealth } from './services/api';
import type { WeatherData, ForecastData, TrendsData, UsageData, HealthData } from './types/weather';
import { useGeolocation } from './hooks/useGeolocation';


type TabType = 'current' | 'forecast' | 'trends' | 'usage';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('current');

  const { lat, lon, error: geoError, loading: geoLoading, permissionAsked, askForLocation } =
    useGeolocation();

  const [manualCoords, setManualCoords] = useState<{ lat: string; lon: string }>(() => ({
    lat: '',
    lon: '',
  }));
  const [useManualCoords, setUseManualCoords] = useState(false);

  const resolvedLat = useManualCoords ? parseFloat(manualCoords.lat) : lat;
  const resolvedLon = useManualCoords ? parseFloat(manualCoords.lon) : lon;

  const hasResolvedCoords =
    Number.isFinite(resolvedLat) && Number.isFinite(resolvedLon) && resolvedLat != null && resolvedLon != null;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);


  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const [usage, setUsage] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['current']));
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const loadCurrentWeather = useCallback(async () => {
    try {
      setWeatherLoading(true);
      setWeatherError(null);
      const data = await fetchCurrentWeather(
        hasResolvedCoords ? { lat: resolvedLat as number, lon: resolvedLon as number } : undefined
      );
      setWeather(data);
      setLoadedTabs((prev) => new Set(prev).add('current'));
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT') {
          setRateLimitMessage('Rate limit hit — retry in 60s');
        } else if (err.message === 'SERVICE_UNAVAILABLE') {
          setWeatherError('Weather service temporarily unavailable');
        } else {
          setWeatherError(err.message);
        }
      }
    } finally {
      setWeatherLoading(false);
    }
  }, [hasResolvedCoords, resolvedLat, resolvedLon]);


  const loadForecast = useCallback(async () => {
    try {
      setForecastLoading(true);
      setForecastError(null);
      const data = await fetchForecast(
        hasResolvedCoords ? { lat: resolvedLat as number, lon: resolvedLon as number } : undefined
      );
      setForecast(data);
      setLoadedTabs((prev) => new Set(prev).add('forecast'));
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT') {
          setRateLimitMessage('Rate limit hit — retry in 60s');
        } else if (err.message === 'SERVICE_UNAVAILABLE') {
          setForecastError('Weather service temporarily unavailable');
        } else {
          setForecastError(err.message);
        }
      }
    } finally {
      setForecastLoading(false);
    }
  }, [hasResolvedCoords, resolvedLat, resolvedLon]);


  const loadTrends = useCallback(
    async (days: 7 | 14 | 30 = 7) => {
      try {
        setTrendsLoading(true);
        setTrendsError(null);
        const data = await fetchTrends(days, hasResolvedCoords ? { lat: resolvedLat as number, lon: resolvedLon as number } : undefined);
        setTrends(data);
        setLoadedTabs((prev) => new Set(prev).add('trends'));
      } catch (err) {
        if (err instanceof Error) {
          if (err.message === 'RATE_LIMIT') {
            setRateLimitMessage('Rate limit hit — retry in 60s');
          } else if (err.message === 'SERVICE_UNAVAILABLE') {
            setTrendsError('Weather service temporarily unavailable');
          } else {
            setTrendsError(err.message);
          }
        }
      } finally {
        setTrendsLoading(false);
      }
    },
    [hasResolvedCoords, resolvedLat, resolvedLon]
  );


  const loadUsage = useCallback(async () => {
    try {
      setUsageLoading(true);
      setUsageError(null);
      const data = await fetchUsage();
      setUsage(data);
      setLoadedTabs(prev => new Set(prev).add('usage'));
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'RATE_LIMIT') {
          setRateLimitMessage('Rate limit hit — retry in 60s');
        } else if (err.message === 'SERVICE_UNAVAILABLE') {
          setUsageError('Weather service temporarily unavailable');
        } else {
          setUsageError(err.message);
        }
      }
    } finally {
      setUsageLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      setHealthLoading(true);
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't fetch weather until we have coords OR user explicitly decided to use manual coords.
    if (geoLoading) return;

    if (useManualCoords && !hasResolvedCoords) return;

    loadCurrentWeather();
    const interval = setInterval(loadCurrentWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [geoLoading, useManualCoords, hasResolvedCoords, loadCurrentWeather]);


  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    if (activeTab === 'usage' && !loadedTabs.has('usage')) {
      loadUsage();
      return;
    }

    // For forecast/trends, wait until geolocation attempt resolved or manual coords chosen.
    if (geoLoading) return;
    if (!hasResolvedCoords && !useManualCoords) return;

    if (activeTab === 'forecast' && !loadedTabs.has('forecast')) {
      loadForecast();
    } else if (activeTab === 'trends' && !loadedTabs.has('trends')) {
      loadTrends();
    }
  }, [activeTab, loadedTabs, geoLoading, hasResolvedCoords, useManualCoords, loadForecast, loadTrends, loadUsage]);


  const handleRefresh = useCallback(async () => {
    setRateLimitMessage(null);
    if (activeTab === 'current') await loadCurrentWeather();
    else if (activeTab === 'forecast') await loadForecast();
    else if (activeTab === 'trends') await loadTrends();
    else if (activeTab === 'usage') await loadUsage();
  }, [activeTab, loadCurrentWeather, loadForecast, loadTrends, loadUsage]);


  const tabIndicatorStyle = useMemo(() => {
    const tabIndex = { current: 0, forecast: 1, trends: 2, usage: 3 }[activeTab];
    const baseLeft = 8;
    const tabWidth = 120;
    return { left: `${baseLeft + tabIndex * tabWidth}px`, width: `${tabWidth - 16}px` };
  }, [activeTab]);

  if (geoLoading && !weather) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="skeleton-loader h-12 w-3/4 mx-auto rounded-lg" />
          <div className="text-sm text-gray-400 text-center">📍 Detecting your location...</div>
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="skeleton-loader h-32 rounded-xl" />
            <div className="skeleton-loader h-32 rounded-xl" />
            <div className="skeleton-loader h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const showGeoDeniedUI = permissionAsked && geoError && !useManualCoords;
  if (showGeoDeniedUI) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-cyan" />
            <h2 className="text-lg font-semibold text-white">Location needed</h2>
          </div>
          <p className="text-sm text-gray-300 mb-4">{geoError}</p>

          <button
            onClick={askForLocation}
            className="w-full p-2 mb-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white text-sm"
          >
            Try Again
          </button>

          <div className="border-t border-white/10 my-4" />

          <div className="text-sm text-gray-400 mb-2">Or enter coordinates manually</div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUseManualCoords(true);
              // if invalid, backend will still fall back; user can correct
            }}
            className="space-y-3"
          >
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={manualCoords.lat}
              onChange={(e) => setManualCoords((p) => ({ ...p, lat: e.target.value }))}
              className="w-full p-2 border rounded bg-white/5 text-white"
              required
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={manualCoords.lon}
              onChange={(e) => setManualCoords((p) => ({ ...p, lon: e.target.value }))}
              className="w-full p-2 border rounded bg-white/5 text-white"
              required
            />
            <button type="submit" className="w-full p-2 bg-cyan text-navy font-semibold rounded">
              Use My Coordinates
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (weatherLoading && !weather) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="skeleton-loader h-12 w-3/4 mx-auto rounded-lg" />
          <div className="skeleton-loader h-6 w-1/2 mx-auto rounded" />
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="skeleton-loader h-32 rounded-xl" />
            <div className="skeleton-loader h-32 rounded-xl" />
            <div className="skeleton-loader h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 glass-card p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-blue-500 flex items-center justify-center" aria-label="Weather Intelligence Hub logo">
              <span className="text-white text-lg">🌤️</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sora">Weather Intelligence Hub</h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 text-cyan" aria-hidden="true" />
            <span>{weather?.location || 'Detecting...'}</span>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-label="Live indicator" />
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            {lastUpdated && <span>Updated: {formatDate(lastUpdated)}</span>}
            <button
              onClick={handleRefresh}
              disabled={weatherLoading || forecastLoading || trendsLoading || usageLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${(weatherLoading || forecastLoading || trendsLoading || usageLoading) ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-rose'}`} aria-label="API health" />
              <span className="hidden sm:inline">
                {healthLoading ? 'Checking...' : health?.status || 'Unknown'}
              </span>
            </div>
          </div>
        </header>

        {/* Rate Limit Warning */}
        {rateLimitMessage && (
          <div className="glass-card bg-amber-risk/20 border-amber-risk/50 p-4 rounded-xl text-center mb-5 animate-slideUp">
            <span className="text-amber-risk font-semibold">⚠️ {rateLimitMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {(weatherError || forecastError || trendsError || usageError) && (
          <div className="glass-card bg-rose/20 border-rose/50 p-4 rounded-xl text-center mb-5">
            <span className="text-rose font-semibold">
              Error: {weatherError || forecastError || trendsError || usageError}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="relative mb-6" role="tablist">
          <div className="flex gap-2 sm:gap-4 px-2 sm:px-4 overflow-x-auto scrollbar-hide">
            {(['current', 'forecast', 'trends', 'usage'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 sm:px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-cyan bg-white/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                role="tab"
                aria-selected={activeTab === tab}
                aria-label={`${tab} tab`}
              >
                {tab === 'current' && '📍 Current'}
                {tab === 'forecast' && '📅 Forecast'}
                {tab === 'trends' && '📈 Trends'}
                {tab === 'usage' && '📊 Usage'}
              </button>
            ))}
          </div>
          <div 
            className="absolute bottom-0 h-0.5 bg-cyan rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,212,255,0.5)]"
            style={tabIndicatorStyle}
          />
        </nav>

        {/* Tab Content */}
        <main className="space-y-6">
          {activeTab === 'current' && weather && (
            <ErrorBoundary>
              <CurrentWeather data={weather} loading={weatherLoading} />
            </ErrorBoundary>
          )}
          
          {activeTab === 'forecast' && (forecastLoading || forecast) && (
            <ErrorBoundary>
              <Forecast data={forecast} loading={forecastLoading} error={forecastError} />
            </ErrorBoundary>
          )}

          {activeTab === 'trends' && (trendsLoading || trends) && (
            <ErrorBoundary>
              <Trends data={trends} loading={trendsLoading} error={trendsError} onDaysChange={loadTrends} />
            </ErrorBoundary>
          )}

          {activeTab === 'usage' && (usageLoading || usage) && (
            <ErrorBoundary>
              <Usage data={usage} loading={usageLoading} error={usageError} />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
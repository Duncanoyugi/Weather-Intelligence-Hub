const API_BASE_URL = 'http://localhost:8000/api';

// Track current active tab
let currentTab = 'current';

// Show selected tab
function showTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Fetch data for the selected tab if needed
    if (tabName === 'forecast' && !window.forecastLoaded) {
        fetchForecast();
    } else if (tabName === 'trends' && !window.trendsLoaded) {
        fetchTrends();
    } else if (tabName === 'usage' && !window.usageLoaded) {
        fetchUsage();
    }
}

// Refresh all data
async function refreshAllData() {
    window.forecastLoaded = false;
    window.trendsLoaded = false;
    window.usageLoaded = false;
    
    await fetchWeather();
    await fetchForecast();
    await fetchTrends();
    await fetchUsage();
}

// Fetch current weather
async function fetchWeather() {
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const weatherCard = document.getElementById('weatherCard');
    const rateLimitWarning = document.getElementById('rateLimitWarning');

    if (currentTab === 'current') {
        loading.style.display = 'block';
    }
    errorDiv.style.display = 'none';
    rateLimitWarning.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/weather/current`);
        
        if (response.status === 429) {
            rateLimitWarning.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const weatherData = await response.json();
        displayWeather(weatherData);

        loading.style.display = 'none';
        weatherCard.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        console.error('Fetch error:', error);
    }
}

// Display current weather
function displayWeather(data) {
    document.getElementById('location').textContent = data.location || 'Unknown';
    document.getElementById('temperature').textContent = data.temperature || '--';
    document.getElementById('humidity').textContent = data.humidity ? `${data.humidity}%` : '--%';
    document.getElementById('rainProb').textContent = data.rain_probability ? `${data.rain_probability}%` : '--%';
    document.getElementById('windSpeed').textContent = data.wind_speed ? `${data.wind_speed} km/h` : '-- km/h';
    
    const risk = data.risk || { level: 'LOW', score: 0, factors: [] };
    const riskLevel = risk.level;
    const riskScore = risk.score;
    
    const riskLevelElement = document.getElementById('riskLevel');
    riskLevelElement.textContent = riskLevel;
    
    let riskColor;
    if (riskLevel === 'HIGH') riskColor = '#dc2626';
    else if (riskLevel === 'MEDIUM') riskColor = '#f59e0b';
    else riskColor = '#10b981';
    riskLevelElement.style.backgroundColor = riskColor;
    
    document.getElementById('riskScore').textContent = `Score: ${riskScore}/100`;
    
    const riskBadge = document.getElementById('riskBadge');
    riskBadge.textContent = `⚠️ ${riskLevel} RISK`;
    riskBadge.style.backgroundColor = riskColor;
    
    const riskFactorsList = document.getElementById('riskFactors');
    riskFactorsList.innerHTML = '';
    if (risk.factors && risk.factors.length > 0) {
        risk.factors.forEach(factor => {
            const li = document.createElement('li');
            li.textContent = factor;
            riskFactorsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No significant risk factors';
        riskFactorsList.appendChild(li);
    }
    
    const recommendations = data.recommendations || { recommendations: [], priority: 'INFORMATIONAL' };
    const recommendationsList = document.getElementById('recommendations');
    recommendationsList.innerHTML = '';
    
    if (recommendations.recommendations && recommendations.recommendations.length > 0) {
        recommendations.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.innerHTML = `💡 ${rec}`;
            recommendationsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No specific recommendations at this time';
        recommendationsList.appendChild(li);
    }
    
    const priorityBadge = document.getElementById('priorityBadge');
    const priority = recommendations.priority || 'INFORMATIONAL';
    priorityBadge.textContent = `${priority} Priority`;
    priorityBadge.className = 'priority-badge';
    priorityBadge.classList.add(priority.toLowerCase());
    
    document.getElementById('source').textContent = `Source: ${data.source || 'API'}`;
    document.getElementById('timestamp').textContent = data.fetched_at ? `Updated: ${new Date(data.fetched_at).toLocaleString()}` : '';
}

// Fetch 3-day forecast
async function fetchForecast() {
    const forecastContainer = document.getElementById('forecastContainer');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const rateLimitWarning = document.getElementById('rateLimitWarning');

    if (currentTab === 'forecast') {
        loading.style.display = 'block';
    }
    errorDiv.style.display = 'none';
    rateLimitWarning.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/weather/forecast`);
        
        if (response.status === 429) {
            rateLimitWarning.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status}`);
        }

        const forecastData = await response.json();
        displayForecast(forecastData);
        window.forecastLoaded = true;

        loading.style.display = 'none';
        forecastContainer.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error loading forecast: ${error.message}`;
        console.error('Forecast error:', error);
    }
}

// Display 3-day forecast
function displayForecast(data) {
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';
    
    if (data.forecast && data.forecast.length > 0) {
        data.forecast.forEach(day => {
            const card = document.createElement('div');
            card.className = 'forecast-card';
            
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            
            let riskColor;
            if (day.risk?.level === 'HIGH') riskColor = '#dc2626';
            else if (day.risk?.level === 'MEDIUM') riskColor = '#f59e0b';
            else riskColor = '#10b981';
            
            card.innerHTML = `
                <div class="date">${dayName}</div>
                <div class="temp">${Math.round(day.temperature_high || 0)}°C</div>
                <div class="temp-range">↓ ${Math.round(day.temperature_low || 0)}°C</div>
                <div class="rain">🌧️ ${day.rain_probability || 0}% rain</div>
                <div class="wind">💨 ${day.wind_speed || 0} km/h</div>
                <div class="risk" style="background: ${riskColor}20; color: ${riskColor}">
                    ⚠️ ${day.risk?.level || 'LOW'} Risk (${day.risk?.score || 0}/100)
                </div>
            `;
            forecastGrid.appendChild(card);
        });
    } else {
        forecastGrid.innerHTML = '<p>No forecast data available</p>';
    }
    
    document.getElementById('forecastTimestamp').textContent = data.fetched_at ? `Updated: ${new Date(data.fetched_at).toLocaleString()}` : '';
}

// Fetch historical trends
async function fetchTrends() {
    const days = document.getElementById('trendsDays')?.value || 7;
    const trendsContainer = document.getElementById('trendsContainer');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const rateLimitWarning = document.getElementById('rateLimitWarning');

    if (currentTab === 'trends') {
        loading.style.display = 'block';
    }
    errorDiv.style.display = 'none';
    rateLimitWarning.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/weather/trends?days=${days}`);
        
        if (response.status === 429) {
            rateLimitWarning.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Trends API error: ${response.status}`);
        }

        const trendsData = await response.json();
        displayTrends(trendsData);
        window.trendsLoaded = true;

        loading.style.display = 'none';
        trendsContainer.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error loading trends: ${error.message}`;
        console.error('Trends error:', error);
    }
}

// Display historical trends
function displayTrends(data) {
    // Summary
    const summaryDiv = document.getElementById('trendsSummary');
    if (data.message) {
        summaryDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        summaryDiv.innerHTML = `
            <p>📊 Showing data for the last ${data.days_requested} days</p>
            <p>📝 ${data.records_found} weather records found</p>
        `;
    }
    
    // Averages
    const averagesGrid = document.getElementById('averagesGrid');
    if (data.averages) {
        averagesGrid.innerHTML = `
            <div class="average-item"><div class="label">Avg Temperature</div><div class="value">${data.averages.temperature || '--'}°C</div></div>
            <div class="average-item"><div class="label">Avg Humidity</div><div class="value">${data.averages.humidity || '--'}%</div></div>
            <div class="average-item"><div class="label">Avg Rain Probability</div><div class="value">${data.averages.rain_probability || '--'}%</div></div>
        `;
    }
    
    // Extremes
    const extremesGrid = document.getElementById('extremesGrid');
    if (data.extremes) {
        extremesGrid.innerHTML = `
            <div class="extreme-item"><div class="label">Max Temperature</div><div class="value">${data.extremes.max_temperature || '--'}°C</div></div>
            <div class="extreme-item"><div class="label">Min Temperature</div><div class="value">${data.extremes.min_temperature || '--'}°C</div></div>
        `;
    }
    
    // Risk Distribution
    const riskDistDiv = document.getElementById('riskDistribution');
    if (data.risk_distribution && data.risk_distribution.length > 0) {
        let high = 0, medium = 0, low = 0;
        data.risk_distribution.forEach(item => {
            if (item.risk_score === 'HIGH') high = item.count;
            else if (item.risk_score === 'MEDIUM') medium = item.count;
            else if (item.risk_score === 'LOW') low = item.count;
        });
        const total = high + medium + low;
        
        riskDistDiv.innerHTML = `
            <div class="risk-bars">
                <div class="risk-bar">
                    <div class="bar"><div class="fill high" style="width: ${total ? (high/total*100) : 0}%"></div></div>
                    <div>HIGH (${high})</div>
                </div>
                <div class="risk-bar">
                    <div class="bar"><div class="fill medium" style="width: ${total ? (medium/total*100) : 0}%"></div></div>
                    <div>MEDIUM (${medium})</div>
                </div>
                <div class="risk-bar">
                    <div class="bar"><div class="fill low" style="width: ${total ? (low/total*100) : 0}%"></div></div>
                    <div>LOW (${low})</div>
                </div>
            </div>
        `;
    } else {
        riskDistDiv.innerHTML = '<p>No risk distribution data available yet</p>';
    }
    
    // Daily Data Table
    const tableBody = document.getElementById('dailyDataBody');
    if (data.daily_data && data.daily_data.length > 0) {
        tableBody.innerHTML = '';
        data.daily_data.slice().reverse().forEach(record => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = new Date(record.date).toLocaleString();
            row.insertCell(1).textContent = record.temperature;
            row.insertCell(2).textContent = `${record.humidity}%`;
            row.insertCell(3).textContent = `${record.rain_probability}%`;
            const riskCell = row.insertCell(4);
            riskCell.textContent = record.risk_score;
            if (record.risk_score === 'HIGH') riskCell.style.color = '#dc2626';
            else if (record.risk_score === 'MEDIUM') riskCell.style.color = '#f59e0b';
            else riskCell.style.color = '#10b981';
        });
    } else {
        tableBody.innerHTML = '<tr><colspan="5">No daily records available</td></tr>';
    }
}

// Fetch API usage
async function fetchUsage() {
    const usageCard = document.getElementById('usageCard');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const rateLimitWarning = document.getElementById('rateLimitWarning');

    if (currentTab === 'usage') {
        loading.style.display = 'block';
    }
    errorDiv.style.display = 'none';
    rateLimitWarning.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/system/usage`);
        
        if (response.status === 429) {
            rateLimitWarning.style.display = 'block';
            loading.style.display = 'none';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Usage API error: ${response.status}`);
        }

        const usageData = await response.json();
        displayUsage(usageData);
        window.usageLoaded = true;

        loading.style.display = 'none';
        usageCard.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Error loading usage: ${error.message}`;
        console.error('Usage error:', error);
    }
}

// Display API usage
function displayUsage(data) {
    if (!data || !data.usage) {
        document.getElementById('usageCard').style.display = 'none';
        return;
    }
    
    const usage = data.usage;
    document.getElementById('quotaRemaining').textContent = usage.quota_remaining || '--';
    document.getElementById('quotaUsed').textContent = usage.quota_used || '--';
    document.getElementById('quotaTotal').textContent = usage.quota_total || '--';
    document.getElementById('quotaPercent').textContent = `${usage.quota_remaining_percent || 0}%`;
    
    const remainingPercent = usage.quota_remaining_percent || 0;
    const usedPercent = 100 - remainingPercent;
    document.getElementById('progressFill').style.width = `${usedPercent}%`;
}

// Initialize - load all data
async function init() {
    await fetchWeather();
    await fetchForecast();
    await fetchTrends();
    await fetchUsage();
}

// Auto-refresh every 5 minutes
setInterval(() => {
    refreshAllData();
}, 300000);

// Initial load
init();
// DOM Elements
const elements = {
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    locationBtn: document.getElementById('location-btn'),
    weatherCard: document.getElementById('weather-card'),
    loading: document.getElementById('loading'),
    weatherInfo: document.getElementById('weather-info'),
    errorMessage: document.getElementById('error-message'),
    recentList: document.getElementById('recent-list'),
    forecast: document.getElementById('forecast'),
    themeToggle: document.getElementById('theme-toggle')
};

// عناصر اطلاعات آب و هوا
const infoElements = {
    cityName: document.getElementById('city-name'),
    dateTime: document.getElementById('date-time'),
    temperature: document.getElementById('temperature'),
    weatherDescription: document.getElementById('weather-description'),
    feelsLike: document.getElementById('feels-like'),
    windSpeed: document.getElementById('wind-speed'),
    humidity: document.getElementById('humidity'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset'),
    weatherIcon: document.getElementById('weather-icon')
};

// داده‌های نمونه (Mock Data) برای زمانی که API کار نمی‌کند
const mockWeatherData = {
    'تهران': {
        name: 'تهران',
        temp: 18,
        description: 'آفتابی',
        feels_like: 17,
        wind_speed: '12 کیلومتر/ساعت',
        humidity: '45%',
        pressure: '1013 hPa',
        visibility: '10 کیلومتر',
        sunrise: '06:15',
        sunset: '18:45',
        icon: '01d'
    },
    'مشهد': {
        name: 'مشهد',
        temp: 22,
        description: 'نیمه ابری',
        feels_like: 21,
        wind_speed: '8 کیلومتر/ساعت',
        humidity: '38%',
        pressure: '1015 hPa',
        visibility: '12 کیلومتر',
        sunrise: '06:10',
        sunset: '18:40',
        icon: '02d'
    },
    'اصفهان': {
        name: 'اصفهان',
        temp: 20,
        description: 'آفتابی',
        feels_like: 19,
        wind_speed: '10 کیلومتر/ساعت',
        humidity: '42%',
        pressure: '1012 hPa',
        visibility: '15 کیلومتر',
        sunrise: '06:20',
        sunset: '18:50',
        icon: '01d'
    },
    'شیراز': {
        name: 'شیراز',
        temp: 25,
        description: 'آفتابی',
        feels_like: 24,
        wind_speed: '5 کیلومتر/ساعت',
        humidity: '35%',
        pressure: '1010 hPa',
        visibility: '20 کیلومتر',
        sunrise: '06:05',
        sunset: '18:35',
        icon: '01d'
    },
    'تبریز': {
        name: 'تبریز',
        temp: 15,
        description: 'ابری',
        feels_like: 14,
        wind_speed: '15 کیلومتر/ساعت',
        humidity: '50%',
        pressure: '1018 hPa',
        visibility: '8 کیلومتر',
        sunrise: '06:25',
        sunset: '18:55',
        icon: '03d'
    }
};

// داده‌های پیش‌بینی نمونه
const mockForecastData = [
    { day: 'شنبه', high: 20, low: 12, icon: '01d', desc: 'آفتابی' },
    { day: 'یکشنبه', high: 22, low: 14, icon: '02d', desc: 'نیمه ابری' },
    { day: 'دوشنبه', high: 19, low: 13, icon: '03d', desc: 'ابری' },
    { day: 'سه‌شنبه', high: 18, low: 11, icon: '09d', desc: 'بارانی' },
    { day: 'چهارشنبه', high: 21, low: 13, icon: '02d', desc: 'نیمه ابری' }
];

// ذخیره شهرهای جستجو شده
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// تنظیمات اولیه
function init() {
    console.log('برنامه در حال راه‌اندازی...');
    loadTheme();
    updateDateTime();
    loadRecentSearches();
    
    // نمایش آب و هوای تهران به صورت پیش‌فرض
    getWeather('تهران');
    
    // رویدادها
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    elements.locationBtn.addEventListener('click', getLocationWeather);
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // رویداد شهرهای پرجستجو
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            getWeather(e.target.dataset.city);
        });
    });
    
    console.log('برنامه آماده است!');
}

// مدیریت جستجو
function handleSearch() {
    const city = elements.cityInput.value.trim();
    if (city) {
        getWeather(city);
        elements.cityInput.value = '';
    } else {
        showError('لطفاً نام شهر را وارد کنید');
    }
}

// دریافت اطلاعات آب و هوا (با داده‌های نمونه)
async function getWeather(city) {
    showLoading();
    
    // تاخیر برای شبیه‌سازی درخواست شبکه
    setTimeout(() => {
        try {
            // بررسی اگر شهر در داده‌های نمونه وجود دارد
            if (mockWeatherData[city]) {
                const weatherData = mockWeatherData[city];
                processWeatherData(weatherData);
                addToRecentSearches(city);
            } else {
                // اگر شهر پیدا نشد، از یک شهر پیش‌فرض استفاده کن
                const defaultCity = Object.keys(mockWeatherData)[0];
                showError(`شهر "${city}" یافت نشد. نمایش اطلاعات ${defaultCity}`);
                getWeather(defaultCity);
            }
        } catch (error) {
            console.error('خطا:', error);
            showError('خطا در دریافت اطلاعات');
        }
    }, 1000); // تاخیر ۱ ثانیه‌ای برای واقعی‌تر شدن
}

// پردازش داده‌های آب و هوا
function processWeatherData(data) {
    console.log('دریافت داده‌های آب و هوا:', data);
    
    // آپدیت اطلاعات
    infoElements.cityName.textContent = data.name;
    infoElements.temperature.textContent = data.temp;
    infoElements.weatherDescription.textContent = data.description;
    infoElements.feelsLike.textContent = data.feels_like;
    infoElements.windSpeed.textContent = data.wind_speed;
    infoElements.humidity.textContent = data.humidity;
    infoElements.pressure.textContent = data.pressure;
    infoElements.visibility.textContent = data.visibility;
    infoElements.sunrise.textContent = data.sunrise;
    infoElements.sunset.textContent = data.sunset;
    
    // آپدیت آیکون آب و هوا
    updateWeatherIcon(data.icon);
    
    // آپدیت تاریخ و زمان
    updateDateTime();
    
    // نمایش پیش‌بینی
    displayForecast();
    
    // نمایش اطلاعات
    showWeatherInfo();
}

// نمایش پیش‌بینی
function displayForecast() {
    let forecastHTML = '<h3>پیش‌بینی ۵ روز آینده</h3><div class="forecast-days">';
    
    mockForecastData.forEach(day => {
        forecastHTML += `
            <div class="forecast-day">
                <div class="day-name">${day.day}</div>
                <div class="forecast-icon">${getWeatherIconHTML(day.icon)}</div>
                <div class="weather-desc">${day.desc}</div>
                <div class="temp-range">
                    <span class="high">${day.high}°</span>
                    <span class="low">${day.low}°</span>
                </div>
            </div>
        `;
    });
    
    forecastHTML += '</div>';
    elements.forecast.innerHTML = forecastHTML;
}

// آپدیت آیکون آب و هوا
function updateWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    infoElements.weatherIcon.className = iconMap[iconCode] || 'fas fa-cloud';
    console.log('آیکون به‌روز شد:', iconMap[iconCode]);
}

function getWeatherIconHTML(iconCode) {
    const iconMap = {
        '01d': '☀️',
        '01n': '🌙',
        '02d': '⛅',
        '02n': '☁️',
        '03d': '☁️',
        '03n': '☁️',
        '04d': '☁️',
        '04n': '☁️',
        '09d': '🌧️',
        '09n': '🌧️',
        '10d': '🌦️',
        '10n': '🌧️',
        '11d': '⛈️',
        '11n': '⛈️',
        '13d': '❄️',
        '13n': '❄️',
        '50d': '🌫️',
        '50n': '🌫️'
    };
    
    return iconMap[iconCode] || '☁️';
}

// دریافت آب و هوا بر اساس موقعیت مکانی
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        // شبیه‌سازی درخواست موقعیت مکانی
        setTimeout(() => {
            // در حالت واقعی اینجا مختصات دریافت می‌شود
            // اما برای نمونه از تهران استفاده می‌کنیم
            getWeather('تهران');
            showWeatherInfo();
        }, 1500);
    } else {
        showError('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند');
    }
}

// مدیریت حالت نمایش
function showLoading() {
    console.log('نمایش حالت لودینگ...');
    elements.loading.style.display = 'flex';
    elements.weatherInfo.style.display = 'none';
    elements.errorMessage.style.display = 'none';
}

function showWeatherInfo() {
    console.log('نمایش اطلاعات آب و هوا...');
    elements.loading.style.display = 'none';
    elements.weatherInfo.style.display = 'block';
    elements.errorMessage.style.display = 'none';
}

function showError(message) {
    console.error('خطا:', message);
    elements.loading.style.display = 'none';
    elements.weatherInfo.style.display = 'none';
    elements.errorMessage.style.display = 'block';
    elements.errorMessage.querySelector('p').textContent = message;
}

// مدیریت تاریخچه جستجوها
function addToRecentSearches(city) {
    // حذف اگر قبلاً وجود دارد
    recentSearches = recentSearches.filter(item => item !== city);
    
    // اضافه کردن به ابتدای لیست
    recentSearches.unshift(city);
    
    // محدود کردن به ۵ مورد آخر
    if (recentSearches.length > 5) {
        recentSearches.pop();
    }
    
    // ذخیره در localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    
    // آپدیت نمایش
    loadRecentSearches();
}

function loadRecentSearches() {
    elements.recentList.innerHTML = '';
    
    recentSearches.forEach(city => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        item.textContent = city;
        item.addEventListener('click', () => getWeather(city));
        elements.recentList.appendChild(item);
    });
}

// مدیریت تاریخ و زمان
function updateDateTime() {
    const now = new Date();
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    
    infoElements.dateTime.textContent = now.toLocaleDateString('fa-IR', options);
    console.log('تاریخ به‌روز شد:', infoElements.dateTime.textContent);
}

// مدیریت تم تاریک/روشن
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    const icon = elements.themeToggle.querySelector('i');
    const text = elements.themeToggle.querySelector('span') || document.createElement('span');
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        text.textContent = ' حالت روشن';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = ' حالت تاریک';
    }
    
    if (!elements.themeToggle.contains(text)) {
        elements.themeToggle.appendChild(text);
    }
    
    console.log('تم تغییر کرد:', isDark ? 'تاریک' : 'روشن');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = elements.themeToggle.querySelector('i');
        const text = document.createElement('span');
        icon.className = 'fas fa-sun';
        text.textContent = ' حالت روشن';
        elements.themeToggle.appendChild(text);
    }
    console.log('تم بارگذاری شد:', savedTheme);
}

// راه‌اندازی برنامه
document.addEventListener('DOMContentLoaded', init);

// آپدیت زمان هر دقیقه
setInterval(() => {
    if (elements.weatherInfo.style.display === 'block') {
        updateDateTime();
    }
}, 60000);

// نمایش پیام کنسول برای دیباگ
console.log('فایل JavaScript بارگذاری شد');
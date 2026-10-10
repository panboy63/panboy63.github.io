// 天氣查詢 - 台灣 22 縣市
// 資料來源：Open-Meteo（免費、免金鑰、免註冊）
// 文件：https://open-meteo.com/en/docs

// 每個縣市的名稱、緯度（lat）、經度（lon）
// lat = 緯度（北緯為正數），lon = 經度（東經為正數）
const CITIES = [
  { name: "台北市",       lat: 25.0330, lon: 121.5654 },
  { name: "新北市",       lat: 25.0169, lon: 121.4627 },
  { name: "基隆市",       lat: 25.1276, lon: 121.7392 },
  { name: "桃園市",       lat: 24.9937, lon: 121.3010 },
  { name: "新竹市",       lat: 24.8138, lon: 120.9675 },
  { name: "新竹縣",       lat: 24.8387, lon: 121.0177 },
  { name: "苗栗縣",       lat: 24.5602, lon: 120.8214 },
  { name: "台中市",       lat: 24.1477, lon: 120.6736 },
  { name: "彰化縣",       lat: 24.0518, lon: 120.5161 },
  { name: "南投縣",       lat: 23.9609, lon: 120.9719 },
  { name: "雲林縣",       lat: 23.7092, lon: 120.4313 },
  { name: "嘉義市",       lat: 23.4801, lon: 120.4493 },
  { name: "嘉義縣",       lat: 23.4518, lon: 120.2555 },
  { name: "台南市",       lat: 22.9999, lon: 120.2270 },
  { name: "高雄市",       lat: 22.6273, lon: 120.3014 },
  { name: "屏東縣",       lat: 22.5519, lon: 120.5487 },
  { name: "宜蘭縣",       lat: 24.7021, lon: 121.7378 },
  { name: "花蓮縣",       lat: 23.9911, lon: 121.6111 },
  { name: "台東縣",       lat: 22.7583, lon: 121.1444 },
  { name: "澎湖縣",       lat: 23.5711, lon: 119.5793 },
  { name: "金門縣",       lat: 24.4321, lon: 118.3186 },
  { name: "連江縣",       lat: 26.1608, lon: 119.9497 }
];

// WMO 天氣代碼 → 中文說明 + 圖示
// 這是國際通用的天氣代碼，Open-Meteo 回傳的就是這種數字
const WEATHER_CODES = {
  0:  { text: "晴朗",           icon: "☀️" },
  1:  { text: "大致晴朗",       icon: "🌤️" },
  2:  { text: "局部多雲",       icon: "⛅" },
  3:  { text: "陰天",           icon: "☁️" },
  45: { text: "有霧",           icon: "🌫️" },
  48: { text: "霧淞",           icon: "🌫️" },
  51: { text: "毛毛雨",         icon: "🌦️" },
  53: { text: "毛毛雨",         icon: "🌦️" },
  55: { text: "密集毛毛雨",     icon: "🌧️" },
  56: { text: "凍雨",           icon: "🌧️" },
  57: { text: "凍雨",           icon: "🌧️" },
  61: { text: "小雨",           icon: "🌦️" },
  63: { text: "下雨",           icon: "🌧️" },
  65: { text: "大雨",           icon: "🌧️" },
  66: { text: "凍雨",           icon: "🌧️" },
  67: { text: "凍雨",           icon: "🌧️" },
  71: { text: "小雪",           icon: "🌨️" },
  73: { text: "下雪",           icon: "🌨️" },
  75: { text: "大雪",           icon: "❄️" },
  77: { text: "雪粒",           icon: "❄️" },
  80: { text: "陣雨",           icon: "🌦️" },
  81: { text: "強陣雨",         icon: "🌧️" },
  82: { text: "暴力陣雨",       icon: "⛈️" },
  85: { text: "陣雪",           icon: "🌨️" },
  86: { text: "強陣雪",         icon: "❄️" },
  95: { text: "雷雨",           icon: "⛈️" },
  96: { text: "雷雨夾冰雹",     icon: "⛈️" },
  99: { text: "雷雨夾大冰雹",   icon: "⛈️" }
};

// 取得目前選到的縣市
function getSelectedCity() {
  const select = document.getElementById("citySelect");
  return CITIES[parseInt(select.value, 10)];
}

// 查詢天氣
async function getWeather() {
  const button = document.getElementById("searchBtn");
  const result = document.getElementById("resultArea");

  button.disabled = true;
  button.textContent = "查詢中...";
  result.innerHTML = '<p class="loading">正在取得天氣資料...</p>';

  const city = getSelectedCity();

  // 組出 API 的網址
  // current = 目前的天氣；daily = 未來幾天的預報
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + city.lat +
    "&longitude=" + city.lon +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=Asia%2FTaipei" +
    "&forecast_days=4";

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("伺服器回應錯誤：" + response.status);
    const data = await response.json();

    drawCurrentWeather(city, data);
    drawForecast(data);

  } catch (error) {
    result.innerHTML =
      '<div class="error">❌ 查詢失敗：' + error.message +
      '<br><br>可能原因：<br>' +
      '• 網路連線中斷<br>' +
      '• 電腦沒有連上網路<br><br>' +
      '請檢查網路後按「重新查詢」再試一次。</div>';
  } finally {
    button.disabled = false;
    button.textContent = "重新查詢";
  }
}

// 顯示「現在」的天氣
function drawCurrentWeather(city, data) {
  const c = data.current;
  const w = WEATHER_CODES[c.weather_code] || { text: "未知", icon: "❓" };

  // ISO 時間格式 "2026-10-10T16:45" → 只取日期部分
  const dateText = c.time.split("T")[0];

  document.getElementById("resultArea").innerHTML =
    '<div class="weather-now">' +
      '<div class="city">' + city.name + '</div>' +
      '<div class="update">資料時間：' + dateText + '</div>' +
      '<div class="big-icon">' + w.icon + '</div>' +
      '<div class="big-temp">' + c.temperature_2m + '°C</div>' +
      '<div class="weather-text">' + w.text + '</div>' +
      '<table class="info">' +
        '<tr><th>體感溫度</th><td>' + c.apparent_temperature + '°C</td></tr>' +
        '<tr><th>相對濕度</th><td>' + c.relative_humidity_2m + '%</td></tr>' +
        '<tr><th>風速</th><td>' + c.wind_speed_10m + ' km/h</td></tr>' +
        '<tr><th>海拔高度</th><td>' + data.elevation + ' 公尺</td></tr>' +
      '</table>' +
    '</div>';
}

// 顯示未來幾天的預報
function drawForecast(data) {
  const d = data.daily;
  let html = '<h2 class="forecast-title">未來幾天預報</h2><div class="forecast">';

  for (let i = 0; i < d.time.length; i++) {
    const w = WEATHER_CODES[d.weather_code[i]] || { text: "未知", icon: "❓" };
    const rain = d.precipitation_probability_max[i];

    // "2026-10-11" 取出「月-日」
    const parts = d.time[i].split("-");
    const label = parts[1] + "/" + parts[2];

    html +=
      '<div class="day-card">' +
        '<div class="day-date">' + label + '</div>' +
        '<div class="day-icon">' + w.icon + '</div>' +
        '<div class="day-desc">' + w.text + '</div>' +
        '<div class="day-temp"><span class="high">' + d.temperature_2m_max[i] +
          '°</span> <span class="low">' + d.temperature_2m_min[i] + '°</span></div>' +
        '<div class="day-rain">💧 降雨機率 ' + rain + '%</div>' +
      '</div>';
  }

  html += '</div>';
  document.getElementById("forecastArea").innerHTML = html;
}
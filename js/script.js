// Global variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = '9ae6067b6076694363fd7394d517c6a1';

// DOM element references
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);


// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  // Store response data from our fetch request in variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
  var iconDescription = weather.weather[0].description || weather[0].main;

  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');
  card.append(cardBody);

  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;
  cardBody.append(heading, tempEl, windEl, humidityEl);

  todayContainer.innerHTML = '';
  todayContainer.append(card);
}

// Function to display a forecast card given an object from open weather api
// daily forecast.
function renderForecastCard(forecast) {
  // variables for data from api
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
  var iconDescription = forecast.weather[0].description;
  var tempF = forecast.main.temp;
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // Create elements for a card
  var col = document.createElement('div');
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var cardTitle = document.createElement('h5');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.setAttribute('class', 'col-md');
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // Add content to elements
  cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast) {
  // Create unix timestamps for start and end of 5 day forecast
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      // Then filters through the data and returns only data captured at noon for each day.
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  // Don't continue if there is nothing in the search form
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = '';
}


searchForm.addEventListener('submit', handleSearchFormSubmit);








// var fetchButton = document.querySelector('#modalBody');
// var ApiKey = '727d458d3fefaab6cbf8a836d5e77c33';
// var city='philadelphia';
// var forcast = document.querySelector('p');
// console.log(forcast);


// function currWeather() {
//     var currWeatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + ApiKey + '&units=imperial';
    
//     fetch(currWeatherUrl)
//     .then(function (response) {
//         return response.json();
//     })
//     .then(function (data) {
//         var modal = fetchButton.textContent.cloneNode(true)
//         // console.log(data)
//         // console.log(data.main.temp);
//         // var mainTemp = document.createElement('h3');
//         // console.log(mainTemp);
//         // mainTemp.textContent = data.main.temp;
//         // forcast.appendChild(mainTemp);
//     })


// }
// currWeather();

// function fiveDay() {
//     var fiveDayUrl = "api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=" + ApiKey + '&units=imperial';

//     fetch(fiveDayUrl)
//     .then(function (response) {
//         return response.json();
//     })
//     .then(function (data) {

//     })

// }
// fiveDay();

// var myModal = document.getElementById('myModal')
// var myInput = document.getElementById('myInput')

// myModal.addEventListener('shown.bs.modal', function fiveDay() {
//   myInput.focus()
// })

// fetchButton.addEventListener('click', getApi());

// $('a').on('click', function (event) {
//     event.preventDefault();
//     $('#weatherModals')
//     .append('default' + event.type + 'prevented')
//     .appendTo('#log');
// });




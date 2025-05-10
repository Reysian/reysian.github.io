/*
  File: conditions.js
  Description: Fetches current weather data and conditions from open-meteo API and
  creates a table to display the data clearly. Takes user input in the form of latitude
  and longitude coordinates, and fetches corresponding weather data from open-mateo API.
*/

const submit = document.querySelector("#submit");
const latField = document.getElementById('latitude');
const lonField = document.getElementById('longitude');
const tableBody = document.querySelector("#content");
const tableHeader = document.querySelector("#header");

// Set values of latitude and longitude when submit button clicked or upon submission (ENTER key).
submit.onclick = function() {

  // If there is input in the latitude field, update the value of latitude in session storage.
  if (latField.value)
    sessionStorage.setItem('lat', latField.value);

  // If there is input in the longitude field, update the value of longitude in session storage.
  if (lonField.value)
    sessionStorage.setItem('lon', lonField.value);
};

// Reset values of latitude and longitude to their default values (Berlin), and reload the page.
reset.onclick = function() {
  sessionStorage.setItem('lat', '52.52')
  sessionStorage.setItem('lon', '13.41')
  location.reload();
}

// Once the entire HTML file has loaded, begin script.
document.addEventListener("DOMContentLoaded", () => {
  fetchWeatherData();
});
  
// Fetch weather (current conditions) data from open-meteo and display it properly onscreen.
async function fetchWeatherData() { 
  
  // Get latitude and longitude values from session storage, or set them to their default values (Berlin) if they are not in session storage.
  lat = sessionStorage.getItem('lat') || '52.52';
  lon = sessionStorage.getItem('lon') || '13.41';

  // If invalid coordinates are entered, restore latitude and/or longitude to default values (Berlin).
  if (Math.abs(lat) > 90)
    lat = 52.52;
  if (Math.abs(lon) > 180)
    lon = 13.41;

  // Display coordinates in the header.
  tableHeader.innerText += " at " + lat + ", " + lon;

  try {

    // Get current weather conditions from open-meteo.
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,snowfall,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m";
    const response = await fetch(url);
    const data = await response.json();

    // Store units of measurement in a list and conditions in a map.
    const units = data.current_units;
    const conditions = data.current;

    // For each key-value pair in conditions map, create an entry in the table.
    for (const [key, value] of Object.entries(conditions)) {

      // Create a row.
      const row = document.createElement("tr");

      // Format and record the key (name) of the current weather condition.
      const keyCell = document.createElement("td");
      keyCell.textContent = formatKey(key);

      // Format and record the measurement of the current weather condition, concatenating the unit of measurement.
      const valueCell = document.createElement("td");
      valueCell.textContent = formatValue(value, units[key]);

      // Replace the time condition's unit of measurement (iso8601) with (UTC) to indicate global time.
      if (units[key] === "iso8601")
        valueCell.textContent = formatValue(value, "(UTC)");

      // Convert value of is_day to Yes/No instead of 1/0, and disregard the unit of measurement.
      if (key === "is_day")
        valueCell.textContent = value === 1 ? "Yes" : "No";

      // Translate weather_code's numeric value to a description of the current weather condition, and concatenate the description after the value.
      if (key === "weather_code")
        valueCell.textContent = value + " (" + getCondition(value) + ")";

      // // Populate the row with the formated data, and add it to the table body.
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      tableBody.appendChild(row);
    }
  } catch (error) {

    // Throw a console error and show an error message in the table body if the data cannot be fetched/displayed.
    console.error('Error fetching weather data:', err);
    tableBody.textContent = "Error fetching weather data.";
  }
}

// Format the condition key by replacing underscores with spaces and capitalizing the first letter of every word.
function formatKey(key) {
  return key
  .replace(/_/g, ' ')
  .replace(/\b\w/g, char => char.toUpperCase());
}

// Format the condition value by replacing 'T' with a space (date/time), and concatenate the unit of measurement.
function formatValue(value, unit) {
  return value
  .toString()
  .replace(/T/g, ' ')
  + ' ' + unit;
}

// Given a weather code, return the corresponding weather condition.
function getCondition(wmoCode) {

  let condition = "";

  switch(wmoCode) {
    case 0:
      condition = "Clear Sky";
      break;
    case 1:
      condition = "Mostly Clear Sky";
      break;
    case 2:
      condition = "Partly Cloudy";
      break;
    case 3:
      condition = "Overcast";
      break;
    case 45:
      condition = "Foggy";
      break;
    case 48:
      condition = "Foggy with Rime Fog";
      break;
    case 51:
      condition = "Light Drizzle";
      break;
    case 53:
      condition = "Moderate Drizzle";
      break;
    case 55:
      condition = "Dense Drizzle";
      break;
    case 56:
      condition = "Light Freezing Drizzle";
      break;
    case 57:
      condition = "Dense Freezing Drizzle";
      break;
    case 61:
      condition = "Light Rain";
      break;
    case 63:
      condition = "Moderate Rain";
      break;
    case 65:
      condition = "Heavy Rain";
      break;
    case 66:
      condition = "Light Freezing Rain";
      break;
    case 67:
      condition = "Heavy Freezing Rain";
      break;
    case 71:
      condition = "Light Snow";
      break;
    case 73:
      condition = "Moderate Snow";
      break;
    case 75:
      condition = "Heavy Snow";
      break;
    case 77:
      condition = "Snow Grains";
      break;
    case 80:
      condition = "Light Rain Showers";
      break;
    case 81:
      condition = "Moderate Rain Showers";
      break;
    case 82:
      condition = "Violent Rain Showers";
      break;
    case 85:
      condition = "Light Snow Showers";
      break;
    case 86:
      condition = "Heavy Snow Showers";
      break;
    case 95:
      condition = "Thunderstorm";
      break;
    case 96:
      condition = "Thunderstorm with Light Hail";
      break;
    case 99:
      condition = "Thunderstorm with Heavy Hail";
      break;
    default:
      condition = "Classification Unavailable";
  }
  return condition;
}
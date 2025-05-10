/*
  File: temperature.js
  Description: Fetches 7-day hourly temperature forcast from open-meteo API and
  creates a line chart and a time table to display the data clearly. Takes user
  input in the form of latitude and longitude coordinates, and fetches corresponding
  weather data from open-mateo API.
*/

const submit = document.querySelector("#submit");
const reset = document.querySelector("#reset");
const latField = document.getElementById('latitude');
const lonField = document.getElementById('longitude');
const tableBody = document.querySelector("#content");
const chartHeader = document.querySelector("#header");
const ctx = document.querySelector("#chart").getContext("2d");

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

// Fetch weather (temperature) data from open-meteo and display it properly onscreen.
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
  chartHeader.innerText += " at " + lat + ", " + lon;

  try {

    // Get 7-day hourly temperature predictions from open-meteo.
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&hourly=temperature_2m";
    const response = await fetch(url);
    const data = await response.json();

    // Store each prediction's time and temperature in two lists.
    const times = data.hourly.time;
    const temperatures = data.hourly.temperature_2m;

    // For times displayed on the chart labels, replace 'T' with a space, and remove the year.
    let chartTimes = times.map(function(x){return x.replace(/T/g, '\n').slice(5)});

    // For times displayed in the table, replace 'T' with a space.
    let tableTimes = times.map(function(x){return x.replace(/T/g, ' ');});

    // Create a line plot that shows the predicted hourly change in temperature over 7 days.
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartTimes,
        datasets: [{
          label: "Temperature (°C)",
          data: temperatures,
          backgroundColor: "rgba(1, 164, 205, 0.42)",
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          xAxes: [{
            ticks: {
              // Limit the visible number of x-axis labels to 7, one for each day.
              maxTicksLimit: 7
            }
          }]
        }
      }
    });

    // Populate the table with the hourly temperature predictions.
    for (let i = 0; i < times.length; i++) {

      // Create a row.
      const row = document.createElement("tr");

      // Record the predicted time.
      const timeCell = document.createElement("td");
      timeCell.textContent = tableTimes[i];

      // Record the predicted temperature with unit (degrees celcius) at the corresponding time.
      const tempCell = document.createElement("td");
      tempCell.textContent = temperatures[i] + " °C";

      // Populate the row with the recorded data, and add it to the table body.
      row.appendChild(timeCell);
      row.appendChild(tempCell);
      tableBody.appendChild(row);
    }
  } catch (error) {

    // Throw a console error and show an error message in the table body if the data cannot be fetched/displayed.
    console.error("Error fetching weather data:", error);
    tableBody.textContent = "Error fetching weather data.";
  }
}
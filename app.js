// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCNfrhUGCEktM-emBGQ1Be-w_qJ9dtvFsI",
  authDomain: "letsgrowdp2-52e1b.firebaseapp.com",
  databaseURL: "https://letsgrowdp2-52e1b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "letsgrowdp2-52e1b",
  storageBucket: "letsgrowdp2-52e1b.appspot.com",
  messagingSenderId: "806511276840",
  appId: "1:806511276840:web:79458226d8c4d89eb9961d"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();

// Create separate charts for each sensor reading
var temperatureChart = createChart("temperatureContainer", "Temperature", "#dc3545");
var humidityChart = createChart("humidityContainer", "Humidity", "#007bff");
var pHValueChart = createChart("pHValueContainer", "pHValue", "#ffa500");
var soilMoistureChart = createChart("soilMoistureContainer", "SoilMoisture", "#28a745");
var lightSensorChart = createChart("lightSensorContainer", "LightSensor", "#ffc107");

// Set up the initial chart options
function createChart(containerId, name, color) {
  return new CanvasJS.Chart(containerId, {
    title: {
      text: name,
      fontSize: 20,
      fontWeight: "bold"
    },
    axisX: {
      title: "Time",
      labelAngle: -45,
      labelFontColor: "#777",
      interval: 1, // Display labels for every hour
      intervalType: "hour", // Set the interval type to "hour"
      valueFormatString: "HH:mm", // Display the timestamp in "HH:mm" format
    },
    axisY: {
      title: "Value",
      labelFontColor: "#777"
    },
    data: [{
      type: "spline",
      dataPoints: [],
      color: color,
      markerSize: 7,
    }]
  });
}

// Fetch the sensor data and populate the charts
function fetchSensorData(currdate) {
  database.ref(currdate).once('value', function(snapshot) {
    var data = []; // Array to store the sensor data

    snapshot.forEach(function(childSnapshot) {
      var timestamp = childSnapshot.key;
      var sensorData = childSnapshot.val();

      // Parse the timestamp in hh:mm format
      var [hours, minutes] = timestamp.split(":");
      var date = new Date(currdate);
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));

        // Push the data point to the array
        data.push({
          x: date,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          pH: sensorData.pH,
          soilMoisture: sensorData.soilMoisture,
          luminosity: sensorData.luminosity
        });

    });

    // Sort the data array based on the x (timestamp) values
    data.sort(function(a, b) {
      return a.x - b.x;
    });

    // Populate the charts with the sorted data
    data.forEach(function(dataPoint) {
      temperatureChart.options.data[0].dataPoints.push({
        x: dataPoint.x,
        y: dataPoint.temperature
      });

      humidityChart.options.data[0].dataPoints.push({
        x: dataPoint.x,
        y: dataPoint.humidity
      });

      pHValueChart.options.data[0].dataPoints.push({
        x: dataPoint.x,
        y: dataPoint.pH
      });

      soilMoistureChart.options.data[0].dataPoints.push({
        x: dataPoint.x,
        y: dataPoint.soilMoisture
      });

      lightSensorChart.options.data[0].dataPoints.push({
        x: dataPoint.x,
        y: dataPoint.luminosity
      });
    });

    // Render the charts with the updated data
    temperatureChart.render();
    humidityChart.render();
    pHValueChart.render();
    soilMoistureChart.render();
    lightSensorChart.render();
  });
}

// Fetch sensor data when the page loads
window.addEventListener('load', function() {
  var dateInput = document.getElementById('dateInput');

  dateInput.addEventListener('change', function() {
    var selectedDate = dateInput.value;
    var regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])$/; // Regular expression for MM/DD format

    if (!regex.test(selectedDate)) {
      alert('Please enter the date in an MM/DD format.');
      return;
    }
    clearChart(temperatureChart);
    clearChart(humidityChart);
    clearChart(pHValueChart);
    clearChart(soilMoistureChart);
    clearChart(lightSensorChart);
    fetchSensorData(selectedDate);
  });

  // Set the initial date to 06/25
  dateInput.value = "05/01";
  fetchSensorData(dateInput.value);
});

function clearChart(chart) {
  chart.options.data[0].dataPoints = [];
  chart.render();
}
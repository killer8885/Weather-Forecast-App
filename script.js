function dateFormat(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
}

async function fetchAQIData(lat, lon) {
    let fetchAQIData = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=e006d39f1cabcf4b6e7f0b8cf2d59de5`)
    let formattedData = await fetchAQIData.json();
    console.log('AQI Data: ', formattedData);
    let list = formattedData.list[0].components;
    console.log("Line 242: ", list);

    $("#no2Value")[0].innerText = list.no2
    $("#o3Value")[0].innerText = list.o3
    $("#coValue")[0].innerText = list.co
    $("#so2Value")[0].innerText = list.so2
}

async function nextFiveDays(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=e006d39f1cabcf4b6e7f0b8cf2d59de5&units=metric`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();

        let dailyForecasts = {};

        data.list.forEach(item => {
            let date = item.dt_txt.split(" ")[0];
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temp: item.main.temp.toFixed(1),
                    icon: item.weather[0].icon,
                    day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
                };
            }
        });

        let forecastHtml = "";
        Object.keys(dailyForecasts).slice(0, 5).forEach(date => {
            let forecast = dailyForecasts[date];
            forecastHtml += `
                <div class="forecastRow d-flex align-items-center justify-content-between">
                    <div class="d-flex gap-1 align-items-center">
                        <img src="./images/cloud.png" alt="" width="35px">
                        <h6 class="m-0">${forecast.temp} &deg;C</h6>
                    </div>
                    <h6 class="m-0">${forecast.day}</h6>
                    <h6 class="m-0">${date}</h6>
                </div>
            `;
        });

        document.getElementById("forecastContainer").innerHTML = forecastHtml;

    } catch (error) {
        console.error(error);
        alert("Failed to retrieve weather data. Please check your API key.");
    }
}

async function todayTemps(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=e006d39f1cabcf4b6e7f0b8cf2d59de5&units=metric`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();

        let todayDate = new Date().toISOString().split("T")[0];
        let todayForecasts = data.list.filter(item => item.dt_txt.startsWith(todayDate));

        let selectedHours = todayForecasts.slice(0, 6);

        let todayHtml = "";
        selectedHours.forEach(item => {
            let time = new Date(item.dt_txt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
            let temp = item.main.temp.toFixed(1);
            let icon = item.weather[0].icon;

            todayHtml += `
                <div class="todayTemp">
                    <h6 class="m-0">${time}</h6>
                    <img src="./images/cloudy.png" alt="" width="35px">
                    <h5>${temp}&deg;C</h5>
                </div>
            `;
        });

        document.getElementById("todayTempContainer").innerHTML = todayHtml;

    } catch (error) {
        console.error(error);
        alert("Failed to retrieve weather data. Please check your API key.");
    }
}

async function fetchData() {
    let cityName = document.getElementsByClassName('inputfield')[0].value;
    let requestData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=e006d39f1cabcf4b6e7f0b8cf2d59de5&units=metric`)
    let formattedData = await requestData.json();
    console.log("Formatted Data: ", formattedData);

    let responseCityName = formattedData.name
    let responseTemp = formattedData.main.temp
    let skyDescription = formattedData.weather[0].description

    $('#cityName')[0].innerText = responseCityName;
    $("#cityTemp")[0].innerText = responseTemp
    $("#skyDesc")[0].innerText = skyDescription
    $("#humidity")[0].innerText = formattedData.main.humidity
    $("#pressure")[0].innerText = formattedData.main.pressure
    $("#feelsLike")[0].innerText = formattedData.main.feels_like
    $("#visiblity")[0].innerText = formattedData.visibility

    let properDate = dateFormat(formattedData.dt);
    let date = properDate.split(',')[0]
    let time = properDate.split(',')[1]
    $("#date")[0].innerText = date;
    $("#time")[0].innerText = time

    let sunriseTimeStamp = formattedData.sys.sunrise;
    let sunsetTimeStamp = formattedData.sys.sunset;
    let properSunriseTime = dateFormat(sunriseTimeStamp).split(',')[1]
    let properSunsetTime = dateFormat(sunsetTimeStamp).split(',')[1];

    $("#sunriseTime")[0].innerText = properSunriseTime
    $("#sunsetTime")[0].innerText = properSunsetTime

    let lat = formattedData.coord.lat;
    let lon = formattedData.coord.lon;

    fetchAQIData(lat, lon);
    nextFiveDays(lat, lon);
    todayTemps(lat, lon);
}

document.getElementById("cityInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        fetchData();
    }
});

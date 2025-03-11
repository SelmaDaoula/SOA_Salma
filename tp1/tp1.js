const request = require("request");

const API_KEY = "38f9264b8e345e5059d64b5e08c19663"; // Ta clé API
const BASE_URL = "http://api.openweathermap.org/data/2.5/weather?appid=" + API_KEY + "&q=";

function getWeatherData(city, callback) {
    const url = BASE_URL + city;
    request(url, function (error, response, body) {
        if (error) {
            callback(error, null);
        } else {
            const weatherData = JSON.parse(body);
            if (weatherData.cod === 200) {  // Si la réponse est réussie
                const description = weatherData.weather[0].description;
                const temperature = weatherData.main.temp;
                const humidity = weatherData.main.humidity;
                callback(null, { description, temperature, humidity });
            } else {
                callback("Erreur API: " + weatherData.message, null);
            }
        }
    });
}

// Appel de la fonction pour Sousse
getWeatherData("Tunis", function (error, data) {
    if (error) {
        console.error("❌ Erreur :", error);
    } else {
        console.log("🌤️      Description :", data.description);
        console.log("🌡️      Température :", data.temperature, "°C");
        console.log("💧      Humidité :", data.humidity, "%");
    }
});

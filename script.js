$(document).ready(function() {
    // search button function that will process city name input
    $("#search-button").on("click", function() {
        //get user input
        var userInput = $("#search-value").val();
        //clear user input
        $("#search-value").val("");
        loadWeatherData(userInput);
    });

    // ****** get current history, if any
    $(".history").on("click", "li", function() {
        loadWeatherData($(this).text());
    });

    function makeRow(text) {
        var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
        $(".history").append(li);
    }
    var history = JSON.parse(window.localStorage.getItem("history")) || [];

    if (history.length > 0) {
        loadWeatherData(history[history.length - 1]);
    }

    for (var i = 0; i < history.length; i++) {
        makeRow(history[i]);
    }

    //load weather data
    function loadWeatherData(cityName) {
        //build url link
        var queryURL = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=abea8c198be08a98a25f51dd94240c1c`;
        //get the data necessary for today
        $.ajax({
            type: "GET",
            url: queryURL,
            dataType: "json",
            success: function(data) {
                console.log("data:", data);
                // ********* create history link for this search
                if (history.indexOf(cityName) === -1) {
                    history.push(cityName);
                    window.localStorage.setItem("history", JSON.stringify(history));

                    makeRow(cityName);
                }
                //clear the previous element load
                $("#today").empty();
                //******store search in localstorage as history */
                var weatherElements = `
                <div class="card">
                    <div class="card-body">
                        <h3 class="card-title">
                            ${data.name} (${new Date().toLocaleDateString()})
                            <img src="http://openweathermap.org/img/w/${
                            data.weather[0].icon
                            }.png"/>
                        </h3>
                        <p class="card-text">Temperature: ${data.main.temp} °F</p>
                        <p class="card-text">Humidity: ${data.main.humidity} %</p>
                        <p class="card-text">Wind Speed: ${
                        data.wind.speed
                        } MPH</p>
                    </div>
                </div>
                `;
                $("#today").html(weatherElements);

                //********** alternative code 
                // // create html content for current weather
                // var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
                // var card = $("<div>").addClass("card");
                // var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
                // var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
                // var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
                // var cardBody = $("<div>").addClass("card-body");
                // var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

                // // merge and add to page
                // title.append(img);
                // cardBody.append(title, temp, humid, wind);
                // card.append(cardBody);
                // $("#today").append(card);

                //show five day forcast
                loadForcastData(cityName);
            },
        });

        //get the data necessary for forcast
        function loadForcastData(cityName) {
            var forcastURl = `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=abea8c198be08a98a25f51dd94240c1c`;
            $.ajax({
                type: "GET",
                url: forcastURl,
                dataType: "json",
                success: function(data) {
                    console.log("forcast data:", data);
                    //clear previous forcast elements
                    $("#forecast").html(`
                        <h4 class="mt-3">
                            5-Day Forcast:
                        </h4>
                        <div class="row">
                        </div>
                    `);
                    //loop through data list for day forcast
                    var combinedForcastElements = "";
                    for (i = 0; i < data.list.length; i++) {
                        if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                            var weatherElements = `
                                <div class="col-md-2">
                                    <div class="card bg-primary text-white">
                                        <div class="card-body p-2">
                                            <h5 class="card-title">${new Date(data.list[i].dt_txt).toLocaleDateString()}</h5>
                                            <img src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png" />
                                            <p class="card-text">Temp: ${ data.list[i].main.temp_max} °F</p>
                                            <p class="card-text">Humidity: ${data.list[i].main.humidity} %</p>
                                        </div>
                                    </div>
                                </div>
                            `;
                            combinedForcastElements += weatherElements;
                        }
                    }
                    $("#forecast .row").html(combinedForcastElements);
                }
            });
        }
    }
});
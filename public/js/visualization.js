/**
 * Created by jin on 23/07/15.
 */
$(".alert-success").hide();
$(".alert-danger").hide();

google.load("visualization", "1.1", {packages: ["corechart", "bar"]});
//google.setOnLoadCallback(drawChart);

function drawChart() {
    var all_condition         = {};
    var user_id               = $('#user_id').text();
    all_condition['mov_name'] = $('#movie_name').text();
    all_condition['ageLevel'] = $('#age_level').text();
    all_condition['gender']   = $('#gender').text();
    all_condition['emoLevel'] = $('#emotion_range').text();
    all_condition['agrLevel'] = $('#agreeableness').text();
    all_condition['extLevel'] = $('#extraversion').text();
    all_condition['conLevel'] = $('#conscientiousness').text();
    all_condition['opeLevel'] = $('#openness').text();
    var all_categories        = '';

    //load gender picture
    function loadGenderPic() {
        if ($('#gender').text() == "female") {
            $("img.gender-pic").attr('src', "images/women.png");
        } else if (($('#gender').text() == "male")) {
            $("img.gender-pic").attr('src', "images/men.png");
        }
    }


    /*
     * ----------------------------------------Draw ad explain canvas--------------------------------------------------------
     * */

    $("#explain-canvas").attr('width', $('.ad-explanation').width());
    $("#explain-canvas").attr('height', 230);

    var canvas  = $("#explain-canvas")[0];
    var context = canvas.getContext("2d");

    function Rect(x1, y1, w, h, text) {
        this.x1   = x1;
        this.y1   = y1;
        this.w    = w;
        this.h    = h;
        this.text = text;
    }

    Rect.prototype.drawWithText = function (ctx) {

        ctx.strokeStyle = "black";
        ctx.fillStyle   = "black";
        ctx.lineWidth   = 1;
        ctx.font        = "13px Arial";

        ctx.beginPath();
        ctx.rect(this.x1, this.y1, this.w, this.h);
        ctx.stroke();
        ctx.fillText(this.text, this.x1 + 10, this.y1 + this.h / 1.5);
    }

    function Line(x1, y1, x2, y2, text) {
        this.x1   = x1;
        this.y1   = y1;
        this.x2   = x2;
        this.y2   = y2;
        this.text = text;
    }

    Line.prototype.drawWithArrowheads = function (ctx) {

        // arbitrary styling
        ctx.strokeStyle = "gray";
        ctx.fillStyle   = "#0052CC";
        ctx.lineWidth   = 1;
        ctx.font        = "12px Arial";

        // draw the line
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        ctx.fillText(this.text, this.x1 + 10, this.y1 + 20);


        // draw the ending arrowhead
        var endRadians = Math.atan((this.y2 - this.y1) / (this.x2 - this.x1));
        endRadians += ((this.x2 > this.x1) ? 90 : -90) * Math.PI / 180;
        this.drawArrowhead(ctx, this.x2, this.y2, endRadians);

    }
    Line.prototype.drawArrowhead      = function (ctx, x, y, radians) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.rotate(radians);
        ctx.moveTo(0, 0);
        ctx.lineTo(5, 20);
        ctx.lineTo(-5, 20);
        ctx.closePath();
        ctx.restore();
        ctx.fill();
    }

    function drawExplaination(x, y, w, h, movie, category, age, gender, brand, persona, ad) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        var rect = new Rect(x, y, w, h, "Ad Repository");
        rect.drawWithText(context);
        // create a new line object
        var line = new Line(x + 5, y + h, (x + 5) + 0.1, (y + 2 * h) + 5, movie + " (movie)");
        // draw the line
        line.drawWithArrowheads(context);
        var rect = new Rect(x, (y + 2 * h) + 5, w, h, category);
        rect.drawWithText(context);
        var line = new Line(x + 5, (y + 3 * h) + 5, (x + 5) + 0.1, (y + 4 * h) + 5, age + ', ' + gender);
        line.drawWithArrowheads(context);

        var rect = new Rect(x, (y + 4 * h) + 5, w, h, brand);
        rect.drawWithText(context);
        var line = new Line(x + 5, (y + 5 * h) + 5, (x + 5) + 0.1, (y + 6 * h) + 5, persona);
        line.drawWithArrowheads(context);
        var rect = new Rect(x, (y + 6 * h) + 5, w, h, ad);
        rect.drawWithText(context);
    }

    /**Draw bar chart for retrieved ads' category for this movie**/


    $.get(service_link + "/api/ads", {mov_name: all_condition["mov_name"]}, function (data) {
        for (var ad in data) {
            if (all_categories.indexOf(data[ad].ad_category) == -1) {
                all_categories += data[ad].ad_category + ",";
            }
        }
    });


    /**Update the ad explanation and user model chart**/

    drawAll(all_condition)
    function drawAll(condition) {

        console.log(condition)

        var all_Array = [];
        var all_data  = new google.visualization.DataTable();

        $.get(service_link + "/api/ads", condition, function (data) {
            console.log(data);
            var categoryArray = {};
            var adShow        = [];

            for (var ad in data) {
                if (categoryArray.hasOwnProperty(data[ad].ad_category)) {
                    categoryArray[data[ad].ad_category] += 1
                }
                else {
                    categoryArray[data[ad].ad_category] = 1
                }
            }

            var maxNum = 1;

            for (var property in categoryArray) {
                if (categoryArray.hasOwnProperty(property)) {
                    if (maxNum < categoryArray[property])
                        maxNum = categoryArray[property];
                    all_Array.push([property, categoryArray[property]])
                }
            }

            all_data.addColumn('string', 'Category');
            all_data.addColumn('number', 'Ad');

            all_data.addRows(
                all_Array
            );

            // find the max number of a specific ad category
            var hAxisArray = [0];
            for (var item = 1; item <= maxNum; item++) {
                hAxisArray.push(item);
            }


            var options = {
                bar: {groupWidth: "80%"},
                width: $('.side-container').width() - 10,
                height: $('.side-container').height() / 4,
                legend: 'none',
                hAxis: {
                    title: 'The Number of Ads',
                    ticks: hAxisArray

                },
                vAxis: {
                    textPosition: 'in',
                    textStyle: {
                        fontSize: 16
                    }
                }
            };
            var chart   = new google.visualization.BarChart(document.getElementById('all_chart'));
            chart.draw(all_data, options);

            google.visualization.events.addListener(chart, 'select', function () {
                if (chart.getSelection()[0]) {
                    console.log(chart.getSelection())
                    var selected_category = all_Array[chart.getSelection()[0].row][0];
                    console.log(selected_category)
                    var adShowList        = [];

                    for (var ad in data) {
                        if (data[ad]['ad_category'].indexOf(selected_category) > -1)
                            adShowList.push(ad)
                    }
                    adShow = data[adShowList[Math.floor(Math.random() * adShowList.length)]]
                    drawExplaination(10, 10, $('.ad-explanation').width() - 20, 30, $('#movie_name').text(), all_categories.substr(0, all_categories.length - 1), $("#age_value").text(),
                        $('#gender').text(), adShow.ad_brand + ' (' + adShow.ad_category + ')', $(".person-value").text(), adShow.ad_color + ' ' + adShow.ad_brand);
                    for (var allEle in all_Array) {
                        if (all_Array[allEle][0].indexOf(adShow.ad_category) > -1) {
                            chart.setSelection([{row: allEle, column: null}]);
                        }
                        ;
                    }
                    ;
                    $(".ad-show").attr("src", adShow.ad_url);
                    $(".ad-category").text(adShow.ad_category);
                    $(".ad-brand").text(adShow.ad_brand);
                    $(".ad-color").text(adShow.ad_color);
                }
            });

            if (data.length > 0) {
                adShow = data[Math.floor(Math.random() * data.length)];
                for (var allEle in all_Array) {
                    if (all_Array[allEle][0].indexOf(adShow.ad_category) > -1) {
                        chart.setSelection([{row: allEle, column: null}]);
                    }
                }
                if (adShow) {
                    $(".ad-show").attr("src", adShow.ad_url);
                    $(".ad-category").text(adShow.ad_category);
                    $(".ad-brand").text(adShow.ad_brand);
                    $(".ad-color").text(adShow.ad_color);
                    $(".general-ad").hide();
                    $(".personalized-ad").show();
                }
            } else {
                console.log("No ads are found for you!");
                $(".ad-category").text("Drink");
                $(".ad-show").attr("src", "images/coca-cola2.jpg");
                $(".personalized-ad").hide();
                $(".general-ad").show();
            }
            loadGenderPic();
            drawExplaination(10, 10, $('.ad-explanation').width() - 20, 30, $('#movie_name').text(), all_categories.substr(0, all_categories.length - 1), $("#age_value").text(),
                $('#gender').text(), adShow.ad_brand + ' (' + adShow.ad_category + ')', $(".person-value").text(), adShow.ad_color + ' ' + adShow.ad_brand);
        });
    };

    /*
     ****************************************************************************ad listeners to UI widgets****************************************************************************
     */

    /*********************************************Gender widget*********************************************/
        //initialize the value

    $('input#' + $('#gender').text().toLowerCase()).prop('checked', true);
    $('input.gender-box').on('change', function () {
        if ($(this).is(':checked')) {
            var gender              = $(this).attr('value');
            $('#gender').text(gender);
            all_condition['gender'] = gender;
            drawAll(all_condition);
            /*
             * update the gender data in db
             * */
            if (gender) {
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": service_link + "/api/user?id=" + user_id,
                    "method": "PUT",
                    "headers": {},
                    "data": {
                        'gender': gender
                    }
                }
                $.ajax(settings).done(function (response) {
                    console.log(response);
                });

            }
        }

    });


    var personText = {};
    /*********************************************Age widget*********************************************/
        //initialize the value

    $('select[name="age"] > option[value=' + $('#age_level').text() + ']').prop('selected', true);
    $("#age-selector").on('change', function () {
        $("select option:selected").each(function () {
            $("#age_value").text($(this).text());
            $("#age_level").text($(this).attr('value'));
            all_condition['ageLevel'] = $(this).attr('value');
            drawAll(all_condition);
            /*
             * update the age data in db
             * */
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": service_link + "/api/user?id=" + user_id,
                "method": "PUT",
                "headers": {},
                "data": {
                    'ageLevel': $('#age_level').text(),
                    'ageText': $('#age_value').text(),
                }
            }
            $.ajax(settings).done(function (response) {
                console.log(response);
            });

        });
    });

    /*********************************************Personality widget*********************************************/

    setPersonCheck("opeLevel", "openness");
    setPersonCheck("agrLevel", "agreeableness");
    setPersonCheck("conLevel", "conscientiousness");
    setPersonCheck("extLevel", "extraversion");
    setPersonCheck("emoLevel", "emotion_range");


    function setPersonCheck(personSelect, person) {
        $.getJSON("json/traits.json", function (response) {
            if ($('#' + person).text()) {
                $('input[value=' + $('#' + person).text() + '].' + person + '-box').prop('checked', true);
                //getPersonText(person);
                $('input.' + person + '-box').on('change', function () {
                    if ($(this).is(':checked')) {
                        var value                   = $(this).attr('value');
                        $('#' + person).text(value);
                        $(".person-value").text(assembleTraits($('#extraversion').text(), $('#openness').text(), $('#conscientiousness').text(), $('#agreeableness').text(), $('#emotion_range').text()));
                        all_condition[personSelect] = value;
                        drawAll(all_condition);
                        /*
                         * update the gender data in db
                         * */
                        var dataObj           = {};
                        dataObj[personSelect] = value;
                        var settings          = {
                            "async": true,
                            "crossDomain": true,
                            "url": service_link + "/api/user?id=" + user_id,
                            "method": "PUT",
                            "headers": {},
                            "data": dataObj
                        }
                        $.ajax(settings).done(function (response) {
                            console.log(response);
                        });
                    }
                });
            }

            //get the IBM personality text
            var circumplexData = response;

            function compareByRelevance(o1, o2) {
                if (Math.abs(0.5 - o1.percentage) > Math.abs(0.5 - o2.percentage)) {
                    return -1; // A trait with 1% is more interesting than one with 60%.
                } else if (Math.abs(0.5 - o1.percentage) < Math.abs(0.5 - o2.percentage)) {
                    return 1;
                } else {
                    return 0;
                }
            }

            function assembleTraits(ext, ope, con, agr, neu) {
                var sentences    = [];
                var big5elements = [];

                big5elements.push({
                    id: "Extraversion",
                    percentage: ext
                });
                big5elements.push({
                    id: "Openness",
                    percentage: ope
                });
                big5elements.push({
                    id: "Conscientiousness",
                    percentage: con
                });
                big5elements.push({
                    id: "Agreeableness",
                    percentage: agr
                });
                big5elements.push({
                    id: "Neuroticism",
                    percentage: neu
                });

                // Sort the Big 5 based on how extreme the number is.
                console.log(big5elements);
                big5elements.sort(compareByRelevance);

                // Remove everything between 32% and 68%, as it's inside the common people.
                var relevantBig5 = big5elements.filter(function (item) {
                    return Math.abs(0.5 - item.percentage) > 0.18;
                });
                if (relevantBig5.length < 2) {
                    // Even if no Big 5 attribute is interesting, you get 1 adjective.
                    relevantBig5 = [big5elements[0], big5elements[1]];
                }

                var adj, adj1, adj2, adj3;

                switch (relevantBig5.length) {
                    case 2:
                        // Report 1 adjective.
                        adj = getCircumplexAdjective(relevantBig5[0], relevantBig5[1], 0);
                        sentences.push(adj + '.');
                        break;
                    case 3:
                        // Report 2 adjectives.
                        adj1 = getCircumplexAdjective(relevantBig5[0], relevantBig5[1], 0);
                        adj2 = getCircumplexAdjective(relevantBig5[1], relevantBig5[2], 1);
                        sentences.push(adj1 + ' and ' + adj2 + '.');
                        break;
                    case 4:
                    case 5:
                        // Report 3 adjectives.
                        adj1 = getCircumplexAdjective(relevantBig5[0], relevantBig5[1], 0);
                        adj2 = getCircumplexAdjective(relevantBig5[1], relevantBig5[2], 1);
                        adj3 = getCircumplexAdjective(relevantBig5[2], relevantBig5[3], 2);
                        sentences.push(adj1 + ', ' + adj2 + ' and ' + adj3 + '.');
                        break;
                }
                return sentences.join(' ');
            }


            function getCircumplexAdjective(p1, p2, order) {
                // Sort the personality traits in the order the JSON file stored it.
                var ordered = [p1, p2].sort(function (o1, o2) {
                    var i1 = 'EANOC'.indexOf(o1.id.charAt(0));
                    var i2 = 'EANOC'.indexOf(o2.id.charAt(0));
                    return i1 < i2 ? -1 : 1;
                });

                // Assemble the identifier as the JSON file stored it.
                var identifier = ordered[0].id.
                    concat(ordered[0].percentage > 0.5 ? '_plus_' : '_minus_').
                    concat(ordered[1].id).
                    concat(ordered[1].percentage > 0.5 ? '_plus' : '_minus');

                var traitMult = circumplexData[identifier][0];

                if (traitMult.perceived_negatively) {
                    switch (order) {
                        case 0:
                            return 'a bit ' + traitMult.word;
                        case 1:
                            return 'somewhat ' + traitMult.word;
                        case 2:
                            return 'can be perceived as ' + traitMult.word;
                    }
                } else {
                    return traitMult.word;
                }
            }
        });
    }

    /*********************************************Load movies*********************************************/

    $('select[name="movie"] > option[movie="0"]').prop('selected', true);

    $("#movie-selector").on('change', function () {
        $('select[name="movie"] > option:selected').each(function () {
            var index = $(this).attr('movie');
            console.log(index)
            $.getJSON("json/movie_res.json", function (response) {
                console.log(response);
                var title = response.results[index].original_title;

                var movieID = response.results[index].id;
                $.ajax({
                    type: 'get',
                    crossDomain: true,
                    url: 'https://api.themoviedb.org/3/movie/' + movieID,
                    data: 'api_key=1ee6d705452d58e373b8ea7cddbc9610&append_to_response=trailers,keywords',
                    dataType: 'json',
                    success: function (response) {
                        if (response.error) {
                            console.log("error", response.error);
                        }
                        else {
                            console.log("success", response);
                            var movieSrc              = response.trailers.youtube[0].source;
                            $('#movieID').text(movieSrc);
                            //switch video
                            player.loadVideoById(movieSrc, 0, "large");
                            $('#movie_name').text(title);
                            all_condition['mov_name'] = title;
                            drawAll(all_condition);
                        }
                    },
                    error: function (xhr) {
                        try {
                            var error = JSON.parse(xhr.responseText)
                        } catch (e) {
                            console.log("error", e);
                        }
                    }

                });

            });

        });
    });


}

$('button#dislike').on("click", function () {
    $("a#expandbtn").effect("shake");
    //$(".alert-success").hide();
    $(".alert-danger").show();
    $(".alert-danger").fadeOut(8000, function () {
        // Animation complete.
        $(this).hide();
    });


});

$('button#like').on("click", function () {
    var tasteLog = $(this).text() + ' the ad shown in ' + $('#movie_name').text();
    var taste    = $(".ad-category").text();
    sendTaste(tasteLog, taste);
    //$(".alert-danger").hide();
    $(".alert-success").show();
    $(".alert-success").fadeOut(5000, function () {
        // Animation complete.
        $(this).hide();
    });
});

function sendTaste(tasteLog, taste) {
    console.log(tasteLog + " " + taste);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": service_link + "/api/user?id=" + $('#user_id').text(),
        "method": "PUT",
        "headers": {},
        "data": {
            tasteLog: tasteLog,
            taste: taste
        }
    }
    $.ajax(settings).done(function (response) {
        console.log(response);
    });
}

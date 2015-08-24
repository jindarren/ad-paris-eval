/**
 * Created by jin on 01/06/15.
 */

var service_link = "http://localhost:3000/paris"
/*-------------------------------------Youtube play-------------------------------------*/
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: $('#movieID').text(),
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        //setTimeout(stopVideo, 6000);
        done = true;
    }
}
function stopVideo() {
    player.stopVideo();
}

/*-------------------------------------facebook login-------------------------------------*/

window.fbAsyncInit = function () {
    FB.init({
        appId: '846302955449560',
        cookie: true,  // enable cookies to allow the server to access
                       // the session
        xfbml: true,  // parse social plugins on this page
        version: 'v2.4', // use version 2.2
        status: true
    });

    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            //var uid = response.authResponse.userID;
            //var accessToken = response.authResponse.accessToken;
        } else if (response.status === 'not_authorized') {
            $(".ad-show").attr("src", "images/coca-cola2.jpg");
            $('#loginWindow').modal('show');
        } else {
            $(".ad-show").attr("src", "images/coca-cola2.jpg");
            $('#loginWindow').modal('show');
        }
    });

    FB.Event.subscribe('auth.statusChange', function (response) {
        // do something with response
        console.log(response);
        if (response.status === 'connected') {
            // Logged into your app and Facebook.
            loginSuccess();
            // load all charts (user control and transparency)
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            hideDetails();
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            hideDetails();
        }
    });

    function hideDetails() {
        $('#status').text('Please login Facebook.');
        $('div.container-fluid > div.col-md-3, .detail-info, .taste-btns').hide();
        $('div.container-fluid > div.col-md-7').attr('class', 'col-md-10');
        $(".ad-show").attr("src", "images/coca-cola2.jpg");
    }

};

// Load the SDK asynchronously
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js     = d.createElement(s);
    js.id  = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function loginSuccess() {
    FB.api('/me?fields=gender,age_range,posts,name', function (response) {
        $('#status').text('Welcome, ' + response.name + '!');
        console.log(response);
        loginUser(response);
        $('div.container-fluid > div.col-md-10').attr('class', 'col-md-7');
        $('div.container-fluid > div.col-md-3, .detail-info, .taste-btns').show();
    });
}

/*--------------------------------------------processing the data fetched from facebook--------------------------------------------*/

function fillPageData(user) {
    $('#user_id').text(user.facebook.id);
    $('#age_value').text(user.facebook.ageText);
    $('#age_level').text(user.facebook.ageLevel);
    $('#gender').text(user.facebook.gender);
    $('#openness').text(user.facebook.big5Level.opeLevel);
    $('#agreeableness').text(user.facebook.big5Level.agrLevel);
    $('#conscientiousness').text(user.facebook.big5Level.conLevel);
    $('#extraversion').text(user.facebook.big5Level.extLevel);
    $('#emotion_range').text(user.facebook.big5Level.emoLevel);
    $(".person-value").text(user.facebook.ibmPersonality);
    //after filling the page then draw the chart
    drawChart();
    //get age level
}

function getAgeLevel(age) {
    var ageObj = {};
    if (age > 11 && age < 18) {
        ageObj.ageLevel = 0;
        ageObj.ageText  = "between 12 and 17";
    }
    else if (age > 17 && age < 25) {
        ageObj.ageLevel = 1;
        ageObj.ageText  = "between 18 and 24";
    }
    else if (age > 24 && age < 35) {
        ageObj.ageLevel = 2;
        ageObj.ageText  = "between 25 and 34";
    }
    else if (age > 34 && age < 45) {
        ageObj.ageLevel = 3;
        ageObj.ageText  = "between 35 and 44";
    }
    else if (age > 44 && age < 55) {
        ageObj.ageLevel = 4;
        ageObj.ageText  = "between 45 and 54"
    }
    else if (age > 54 && age < 65) {
        ageObj.ageLevel = 5;
        ageObj.ageText  = "between 55 and 64"
    }
    else if (age > 64) {
        ageObj.ageLevel = 6;
        ageObj.ageText  = "older than 64"
    }
    return ageObj;
}

function loginUser(data){
    $.get(service_link+"/api/user",{id:data.id},function(loggedUser) {
        console.log(loggedUser)

        if (loggedUser.length!=0) {
            var postEqualIndex = getAllPosts(data.posts.data).indexOf(loggedUser[0].facebook.allPost);
            console.log(postEqualIndex);
            if(postEqualIndex==0)
                fillPageData(loggedUser[0]);
            else{
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": service_link+"/api/user?id=" + data.id,
                    "method": "DELETE",
                    "headers": {},
                }
                $.ajax(settings).done(function (response) {
                    console.log(response);
                });
                processData(data);
            }

        } else {
            processData(data);
        }
    });
}


//get all post data
function getAllPosts(posts) {
    var allPost = '';
    for (var postItem in posts) {
        if (typeof posts[postItem].message !== 'undefined') {
            //console.log(postContent[postItem].message);
            allPost += posts[postItem].message + '.';
        }
    }
    return allPost;
}

function processData(data) {
    $.getJSON("json/traits.json", function (response) {
        var user                = {};
        user.facebook           = {};
        user.facebook.big5      = {};
        user.facebook.big5Level = {};

        user.facebook.id   = data.id;
        user.facebook.name = data.name;
        if (data.age_range.min) {
            user.facebook.age      = data.age_range.min;
            user.facebook.ageLevel = getAgeLevel(data.age_range.min).ageLevel;
            user.facebook.ageText  = getAgeLevel(data.age_range.min).ageText;
        }
        else{
            user.facebook.age = 25;
            user.facebook.ageLevel = getAgeLevel(25).ageLevel;
            user.facebook.ageText  = getAgeLevel(25).ageText;
        }

        if (data.gender)
            user.facebook.gender = data.gender;
        else
            user.facebook.gender = "female"

        if (data.posts.data) {
            user.facebook.allPost = getAllPosts(data.posts.data);
            getIBMPrediction(user, user.facebook.allPost)
        } else
            user.allPost = '';

        //get personality level
        function getPersonalityLevel(emo, agr, ext, con, ope, user) {
            var personText = {};

            if (emo < 0.21) {
                user.facebook.big5Level.emoLevel = 0;
            } else if (emo > 0.20 && emo < 0.41) {
                user.facebook.big5Level.emoLevel = 1;
            } else if (emo > 0.40 && emo < 0.61) {
                personText.emo                   = '';
                user.facebook.big5Level.emoLevel = 2;
            } else if (emo > 0.60 && emo < 0.81) {
                user.facebook.big5Level.emoLevel = 3;
            } else if (emo > 0.80 && emo < 1.00) {
                user.facebook.big5Level.emoLevel = 4;
            }
            ;

            if (agr < 0.21) {
                user.facebook.big5Level.agrLevel = 0;
            } else if (agr > 0.20 && agr < 0.41) {
                user.facebook.big5Level.agrLevel = 1;
            } else if (agr > 0.40 && agr < 0.61) {
                personText.agr                   = '';
                user.facebook.big5Level.agrLevel = 2;
            } else if (agr > 0.60 && agr < 0.81) {
                user.facebook.big5Level.agrLevel = 3;
            } else if (agr > 0.80 && agr < 1.00) {
                user.facebook.big5Level.agrLevel = 4;
            }
            ;

            if (ext < 0.21) {
                user.facebook.big5Level.extLevel = 0;
            } else if (ext > 0.20 && ext < 0.41) {
                user.facebook.big5Level.extLevel = 1;
            } else if (ext > 0.40 && ext < 0.61) {
                personText.ext                   = '';
                user.facebook.big5Level.extLevel = 2;
            } else if (ext > 0.60 && ext < 0.81) {
                user.facebook.big5Level.extLevel = 3;
            } else if (ext > 0.80 && ext < 1.00) {
                user.facebook.big5Level.extLevel = 4;
            }
            ;

            if (con < 0.21) {
                user.facebook.big5Level.conLevel = 0;
            } else if (con > 0.20 && con < 0.41) {
                user.facebook.big5Level.conLevel = 1;
            } else if (con > 0.40 && con < 0.61) {
                personText.con                   = '';
                user.facebook.big5Level.conLevel = 2;
            } else if (con > 0.60 && con < 0.81) {
                user.facebook.big5Level.conLevel = 3;
            } else if (con > 0.80 && con < 1.00) {
                user.facebook.big5Level.conLevel = 4;
            }
            ;

            if (ope < 0.21) {
                user.facebook.big5Level.opeLevel = 0;
            } else if (ope > 0.20 && ope < 0.41) {
                user.facebook.big5Level.opeLevel = 1;
            } else if (ope > 0.40 && ope < 0.61) {
                personText.ope                   = '';
                user.facebook.big5Level.opeLevel = 2;
            } else if (ope > 0.60 && ope < 0.81) {
                user.facebook.big5Level.opeLevel = 3;
            } else if (ope > 0.80 && ope < 1.00) {
                user.facebook.big5Level.opeLevel = 4;
            }
            ;

        }

        //get IBM personality
        function getIBMPrediction(user, postData) {

            $.ajax({
                type: 'POST',
                data: {
                    text: postData
                },
                url: '/paris',
                dataType: 'json',
                success: function (response) {
                    console.log(response)
                    if (response.error) {
                        showError(response.error);
                    } else {
                        if (response.tree) {
                            user.facebook.big5.openness = parseFloat(response.tree.children[0].children[0].children[0].percentage).toFixed(2);


                            user.facebook.big5.conscientiousness = parseFloat(response.tree.children[0].children[0].children[1].percentage).toFixed(2);


                            user.facebook.big5.extraversion = parseFloat(response.tree.children[0].children[0].children[2].percentage).toFixed(2);


                            user.facebook.big5.agreeableness = parseFloat(response.tree.children[0].children[0].children[3].percentage).toFixed(2);


                            user.facebook.big5.emotion_range = parseFloat(response.tree.children[0].children[0].children[4].percentage).toFixed(2);

                            user.facebook.ibmPersonality = assembleTraits(user.facebook.big5.extraversion,user.facebook.big5.openness,user.facebook.big5.conscientiousness,user.facebook.big5.agreeableness,user.facebook.big5.emotion_range);
                            getPersonalityLevel(user.facebook.big5.emotion_range, user.facebook.big5.agreeableness,
                                user.facebook.big5.extraversion, user.facebook.big5.conscientiousness, user.facebook.big5.openness, user);
                        } else {
                            console.log("You post data is not enough to predict your personality!");
                            user.facebook.big5.openness          = .50;
                            user.facebook.big5.agreeableness     = .50;
                            user.facebook.big5.conscientiousness = .50;
                            user.facebook.big5.extraversion      = .50;
                            user.facebook.big5.emotion_range     = .50;
                            user.facebook.ibmPersonality         = "You post data is not enough to predict your personality!";
                            getPersonalityLevel(user.facebook.big5.emotion_range, user.facebook.big5.agreeableness,
                                user.facebook.big5.extraversion, user.facebook.big5.conscientiousness, user.facebook.big5.openness, user);
                        }

                    }

                    //store the new user to database
                    var settings = {
                        "async": true,
                        "crossDomain": true,
                        "url": service_link+"/api/user",
                        "method": "POST",
                        "headers": {},
                        "data": {
                            'loggedUser': JSON.stringify(user)
                        }
                    }
                    $.ajax(settings).done(function (response) {
                        console.log(response);
                    });

                    fillPageData(user);
                    console.log(JSON.stringify(user));


                },
                error: function (xhr) {
                    console.log(xhr)

                }
            });

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

            function assembleTraits(ext,ope,con,agr,neu) {
                var sentences    = [];
                var big5elements = [];

                big5elements.push({
                    id: "Extraversion",
                    percentage: ext
                });
                big5elements.push({
                    id: "Openness",
                    percentage: ope
                });big5elements.push({
                    id: "Conscientiousness",
                    percentage: con
                });big5elements.push({
                    id: "Agreeableness",
                    percentage: agr
                });big5elements.push({
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

        }

    });
};
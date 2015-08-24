/**
 * Created by jin on 27/05/15.
 */
var FacebookStrategy = require('passport-facebook').Strategy;
var User             = require('../model/user_model');
var configAuth       = require('./auth');
var http             = require('http');
var fs               = require('fs');

module.exports = function (passport) {

    //used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    //used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['posts', 'displayName', 'age_range', 'gender', 'permissions', 'languages',]
        },
        //facebook will send back the token and profile
        function (token, refreshToken, profile, done) {

            //asynchronous
            process.nextTick(function () {
                User.findOne({'facebook.id': profile.id}, function (err, user) {
                    // if there is an error, stop everything and return that
                    // an error connection to the database

                    if (err)
                        return done(err);

                    //if the user is found then log them in
                    if (user) {
                        if(user.facebook.id == "1445890155729226"){
                            var newUser = new User();
                            updateUser(newUser);
                        }else{
                            //user found , return that user
                            if (user.facebook.allPost.length != profile.allPost.length)
                                updateUser(user);
                            return done(null, user);
                        }


                    } else {
                        // if there is no user found then create a new one for that
                        var newUser = new User();
                        updateUser(newUser);
                        //console.log("+++++++++++++"+ profile.permissions + profile.languages)

                    }
                });
            });



            function updateUser(user) {
                user.facebook.id          = profile.id;
                user.facebook.token       = token;
                user.facebook.name        = profile.displayName;
                user.facebook.age         = profile.age;
                user.facebook.ageLevel    = getAgeLevel(profile.age,user);
                user.facebook.gender      = profile.gender;
                user.facebook.posts       = profile.posts.slice(0);
                if(profile.permissions)
                user.facebook.permissions = profile.permissions.substring(0, profile.permissions.length - 1);
                if(profile.languages)
                user.facebook.languages   = profile.languages.substring(0, profile.languages.length - 1);
                user.facebook.allPost     = profile.allPost;
                user.facebook.timeStamp   = profile.timeStamp;
                getIBMPrediction(user, profile.allPost);
            }

            function getAgeLevel(age,user) {
                var ageLevel = 0;
                if (age > 11 && age < 18){
                    ageLevel = 0;
                    user.facebook.ageText = "between 12 and 17";
                }
                else if (age > 17 && age < 25){
                    ageLevel = 1;
                    user.facebook.ageText = "between 18 and 24";
                }
                else if (age > 24 && age < 35) {
                    ageLevel = 2;
                    user.facebook.ageText = "between 25 and 34";
                }
                else if (age > 34 && age < 45) {
                    ageLevel = 3;
                    user.facebook.ageText = "between 35 and 44";
                }
                else if (age > 44 && age < 55) {
                    ageLevel = 4;
                    user.facebook.ageText = "between 45 and 54"
                }
                else if (age > 54 && age < 65){
                    ageLevel = 5;
                    user.facebook.ageText = "between 55 and 64"
                }
                else if (age > 64) {
                    ageLevel = 6;
                    user.facebook.ageText = "older than 64"
                }

                return ageLevel;
            }

            function getPersonalityLevel(emo, agr, ext, con, ope, user) {
                var personText = {};

                if (emo < 0.21) {
                    user.facebook.big5Level.emoLevel = 0;
                } else if (emo > 0.20 && emo < 0.41) {
                    user.facebook.big5Level.emoLevel = 1;
                } else if (emo > 0.40 && emo < 0.61) {
                    personText.emo              = '';
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
                    personText.agr              = '';
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
                    personText.ext              = '';
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
                    personText.con              = '';
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
                    personText.ope              = '';
                    user.facebook.big5Level.opeLevel = 2;
                } else if (ope > 0.60 && ope < 0.81) {
                    user.facebook.big5Level.opeLevel = 3;
                } else if (ope > 0.80 && ope < 1.00) {
                    user.facebook.big5Level.opeLevel = 4;
                }
                ;

            }

            function getIBMPrediction(user, postData) {
                var postData = "text=" + postData;
                var options  = {
                    hostname: 'localhost',
                    port: '3000',
                    method: 'POST',
                    path: '/paris',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };
                var req      = http.request(options, function (res) {
                    //console.log('STATUS CODE ' + res.statusCode);
                    //console.log('HEADERS ' + JSON.stringify(res.headers));
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        if (JSON.parse(chunk).tree) {
                            user.facebook.big5.openness = parseFloat(JSON.stringify(JSON.parse(chunk).
                                tree.children[0].children[0].children[0].percentage)).toFixed(2);
                            //user.facebook.big5.openness.Adventurousness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[0].percentage);
                            //user.facebook.big5.openness.Artistic_interests = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[1].percentage);
                            //user.facebook.big5.openness.Emotionality = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[2].percentage);
                            //user.facebook.big5.openness.Imagination = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[3].percentage);
                            //user.facebook.big5.openness.Intellect = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[4].percentage);
                            //user.facebook.big5.openness.Authority_challenging = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[0].children[5].percentage);

                            user.facebook.big5.conscientiousness = parseFloat(JSON.stringify(JSON.parse(chunk).
                                tree.children[0].children[0].children[1].percentage)).toFixed(2);
                            //user.facebook.big5.conscientiousness.Achievement_striving = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[0].percentage);
                            //user.facebook.big5.conscientiousness.Cautiousness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[1].percentage);
                            //user.facebook.big5.conscientiousness.Dutifulness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[2].percentage);
                            //user.facebook.big5.conscientiousness.Orderliness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[3].percentage);
                            //user.facebook.big5.conscientiousness.Self_discipline = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[4].percentage);
                            //user.facebook.big5.conscientiousness.Self_efficacy = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[1].children[5].percentage);

                            user.facebook.big5.extraversion = parseFloat(JSON.stringify(JSON.parse(chunk).
                                tree.children[0].children[0].children[2].percentage)).toFixed(2);
                            //user.facebook.big5.extraversion.Activity_level = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[0].percentage);
                            //user.facebook.big5.extraversion.Assertiveness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[1].percentage);
                            //user.facebook.big5.extraversion.Cheerfulness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[2].percentage);
                            //user.facebook.big5.extraversion.Excitement_seeking = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[3].percentage);
                            //user.facebook.big5.extraversion.Outgoing = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[4].percentage);
                            //user.facebook.big5.extraversion.Gregariousness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[2].children[5].percentage);

                            user.facebook.big5.agreeableness = parseFloat(JSON.stringify(JSON.parse(chunk).
                                tree.children[0].children[0].children[3].percentage)).toFixed(2);
                            //user.facebook.big5.agreeableness.Altruism = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[0].percentage);
                            //user.facebook.big5.agreeableness.Cooperation = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[1].percentage);
                            //user.facebook.big5.agreeableness.Modesty = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[2].percentage);
                            //user.facebook.big5.agreeableness.Uncompromising = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[3].percentage);
                            //user.facebook.big5.agreeableness.Sympathy = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[4].percentage);
                            //user.facebook.big5.agreeableness.Trust = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[3].children[5].percentage);

                            user.facebook.big5.emotion_range = parseFloat(JSON.stringify(JSON.parse(chunk).
                                tree.children[0].children[0].children[4].percentage)).toFixed(2);
                            //user.facebook.big5.emotion_range.Fiery = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[0].percentage);
                            //user.facebook.big5.emotion_range.Prone_to_worry = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[1].percentage);
                            //user.facebook.big5.emotion_range.Melancholy = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[2].percentage);
                            //user.facebook.big5.emotion_range.Immoderation = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[3].percentage);
                            //user.facebook.big5.emotion_range.Self_consciousness = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[4].percentage);
                            //user.facebook.big5.emotion_range.Susceptible_to_stress = JSON.stringify(JSON.parse(chunk).tree.children[0].children[0].children[4].children[5].percentage);

                            user.facebook.ibmPersonality  = assembleTraits(JSON.parse(chunk).tree.children[0]);
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

                        //save our user to the database
                        user.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, user);
                        });
                    });
                });

                req.on('error', function (err) {
                    console.log('problem with request ' + err.message);
                });
                req.write(postData);
                req.end();


                // Download all static data synchronously.
                var circumplexData = {};
                circumplexData     = JSON.parse(fs.readFileSync('public/json/traits.json', 'utf8'));

                function compareByRelevance(o1, o2) {
                    if (Math.abs(0.5 - o1.percentage) > Math.abs(0.5 - o2.percentage)) {
                        return -1; // A trait with 1% is more interesting than one with 60%.
                    } else if (Math.abs(0.5 - o1.percentage) < Math.abs(0.5 - o2.percentage)) {
                        return 1;
                    } else {
                        return 0;
                    }
                }

                function assembleTraits(personalityTree) {
                    var sentences    = [];
                    var big5elements = [];

                    // Sort the Big 5 based on how extreme the number is.
                    personalityTree.children[0].children.forEach(function (p) {
                        big5elements.push({
                            id: p.id,
                            percentage: p.percentage
                        });
                    });
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
                            sentences.push('You are ' + adj + '.');
                            break;
                        case 3:
                            // Report 2 adjectives.
                            adj1 = getCircumplexAdjective(relevantBig5[0], relevantBig5[1], 0);
                            adj2 = getCircumplexAdjective(relevantBig5[1], relevantBig5[2], 1);
                            sentences.push('You are ' + adj1 + ' and ' + adj2 + '.');
                            break;
                        case 4:
                        case 5:
                            // Report 3 adjectives.
                            adj1 = getCircumplexAdjective(relevantBig5[0], relevantBig5[1], 0);
                            adj2 = getCircumplexAdjective(relevantBig5[1], relevantBig5[2], 1);
                            adj3 = getCircumplexAdjective(relevantBig5[2], relevantBig5[3], 2);
                            sentences.push('You are ' + adj1 + ', ' + adj2 + ' and ' + adj3 + '.');
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
        }
    ));
};
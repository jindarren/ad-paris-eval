/**
 * Created by jin on 27/05/15.
 */
var configAuth = require('./auth');
//for switching models for advertisements
var Ad      = require('../model/new_ad_model');
var User    = require('../model/user_model');
var context = '/paris';
var path    = require('path');


module.exports = function (router) {
    router.use(function (req, res, next) {
        console.log("the router is working:" + req.method + req.url);
        next();
    });
    /*
     ------------------------------route for API for retrieving ads------------------------------------
     */
    router.get(path.join(context, '/api/ads'), function (req, res) {
        var condition = {};
        if (req.query.lang)
            condition["ad_target_user.language"] = new RegExp('\\b' + req.query.lang);
        if (req.query.gender)
            condition["ad_target_user.gender"] = new RegExp('\\b' + req.query.gender, "i");
        if (req.query.age) {
            //assume the actual age is 5 years older than the given people age at most!!!!
            condition["ad_target_user.age_range.min_age"] = {$lte: parseInt(req.query.age)};
            condition["ad_target_user.age_range.max_age"] = {$gte: parseInt(req.query.age) + 5};
        }
        if (req.query.ageLevel) {
            //assume the actual age is 5 years older than the given people age at most!!!!
            condition["ad_target_user.age_level"] = new RegExp('\\b' + req.query.ageLevel);
        }
        if (req.query.per_emo) {
            condition["ad_target_user.personality.emotion_range.min_val"] = {$lte: parseFloat(req.query.per_emo)};
            condition["ad_target_user.personality.emotion_range.max_val"] = {$gte: parseFloat(req.query.per_emo)};
        }
        if (req.query.per_agr) {
            condition["ad_target_user.personality.agreeableness.min_val"] = {$lte: parseFloat(req.query.per_agr)};
            condition["ad_target_user.personality.agreeableness.max_val"] = {$gte: parseFloat(req.query.per_agr)};
        }
        if (req.query.per_ext) {
            condition["ad_target_user.personality.extraversion.min_val"] = {$lte: parseFloat(req.query.per_ext)};
            condition["ad_target_user.personality.extraversion.max_val"] = {$gte: parseFloat(req.query.per_ext)};
        }
        if (req.query.per_con) {
            condition["ad_target_user.personality.conscientiousness.min_val"] = {$lte: parseFloat(req.query.per_con)};
            condition["ad_target_user.personality.conscientiousness.max_val"] = {$gte: parseFloat(req.query.per_con)};
        }
        if (req.query.per_ope) {
            condition["ad_target_user.personality.openness.min_val"] = {$lte: parseFloat(req.query.per_ope)};
            condition["ad_target_user.personality.openness.max_val"] = {$gte: parseFloat(req.query.per_ope)};
        }
        if (req.query.personality) {
            var big5                                                          = req.query.personality.split(',');
            condition["ad_target_user.personality.emotion_range.min_val"]     = {$lte: parseFloat(big5[0])};
            condition["ad_target_user.personality.emotion_range.max_val"]     = {$gte: parseFloat(big5[0])};
            condition["ad_target_user.personality.agreeableness.min_val"]     = {$lte: parseFloat(big5[1])};
            condition["ad_target_user.personality.agreeableness.max_val"]     = {$gte: parseFloat(big5[1])};
            condition["ad_target_user.personality.extraversion.min_val"]      = {$lte: parseFloat(big5[2])};
            condition["ad_target_user.personality.extraversion.max_val"]      = {$gte: parseFloat(big5[2])};
            condition["ad_target_user.personality.conscientiousness.min_val"] = {$lte: parseFloat(big5[3])};
            condition["ad_target_user.personality.conscientiousness.max_val"] = {$gte: parseFloat(big5[3])};
            condition["ad_target_user.personality.openness.min_val"]          = {$lte: parseFloat(big5[4])};
            condition["ad_target_user.personality.openness.max_val"]          = {$gte: parseFloat(big5[4])};
        }
        //for the new_ads personality retrieval
        if (req.query.emoLevel) {
            condition["ad_target_user.emo_level"] = new RegExp('\\b' + req.query.emoLevel);
        }
        if (req.query.agrLevel) {
            condition["ad_target_user.agr_level"] = new RegExp('\\b' + req.query.agrLevel);
        }
        if (req.query.extLevel) {
            condition["ad_target_user.ext_level"] = new RegExp('\\b' + req.query.extLevel);
        }
        if (req.query.conLevel) {
            condition["ad_target_user.con_level"] = new RegExp('\\b' + req.query.conLevel);
        }
        if (req.query.opeLevel) {
            condition["ad_target_user.ope_level"] = new RegExp('\\b' + req.query.opeLevel);
        }
        if (req.query.mov_type)
            condition["ad_target_movie.type"] = new RegExp('\\b' + req.query.mov_type);
        if (req.query.mov_name)
            condition["ad_target_movie.name"] = new RegExp('\\b' + req.query.mov_name);
        if (req.query.color)
            condition["ad_color"] = new RegExp('\\b' + req.query.color);
        if (req.query.category)
            condition["ad_category"] = new RegExp('\\b' + req.query.category);
        if (req.query.brand)
            condition["ad_brand"] = new RegExp('\\b' + req.query.brand);

        console.log(condition);

        Ad.find(condition, function (err, ads) {
            if (err)
                res.send(err);
            else {
                res.json(ads)
            }
        });
    });
    /*
     ------------------------------route for API for retrieving users------------------------------------
     */

    router.get(path.join(context, '/api/user'), function (req, res) {
        var condition = {};
        if (req.query.name)
            condition["facebook.name"] = req.query.name;
        if (req.query.id)
            condition["facebook.id"] = req.query.id;
        User.find(condition, function (err, user) {
            if (err)
                res.send(err);
            res.json(user)
        });
    });

    router.put(path.join(context, '/api/user'), function (req, res) {
        if (req.query.id) {
            User.findOne({'facebook.id': req.query.id}, function (err, user) {

                if (err)
                    res.send(err);

                if (req.body.gender)
                    user.facebook.gender = req.body.gender;
                if (req.body.age)
                    user.facebook.age = req.body.age;
                if (req.body.ageLevel)
                    user.facebook.ageLevel = req.body.ageLevel;
                if (req.body.ageText)
                    user.facebook.ageText = req.body.ageText;
                if (req.body.languages)
                    user.facebook.languages = req.body.languages;
                if (req.body.openness)
                    user.facebook.big5.openness = req.body.openness;
                if (req.body.extraversion)
                    user.facebook.big5.extraversion = req.body.extraversion;
                if (req.body.conscientiousness)
                    user.facebook.big5.conscientiousness = req.body.conscientiousness;
                if (req.body.agreeableness)
                    user.facebook.big5.agreeableness = req.body.agreeableness;
                if (req.body.emotion_range)
                    user.facebook.big5.emotion_range = req.body.emotion_range;
                if (req.body.opeLevel)
                    user.facebook.big5Level.opeLevel = req.body.opeLevel;
                if (req.body.extLevel)
                    user.facebook.big5Level.extLevel = req.body.extLevel;
                if (req.body.conLevel)
                    user.facebook.big5Level.conLevel = req.body.conLevel;
                if (req.body.agrLevel)
                    user.facebook.big5Level.agrLevel = req.body.agrLevel;
                if (req.body.emoLevel)
                    user.facebook.big5Level.emoLevel = req.body.emoLevel;
                if (req.body.tasteLog)
                    user.facebook.tasteLog.push(req.body.tasteLog);
                if (req.body.taste)
                    user.facebook.taste.push(req.body.taste);

                user.save(function (err) {
                    if (err)
                        res.send(err);
                    res.json({message: user.facebook.name + "'s profile is updated"})
                })
            });
        }
    });

    router.post(path.join(context, '/api/user'), function (req, res) {
        console.log(req.body.loggedUser)
        var user = new User({
            facebook: JSON.parse(req.body.loggedUser).facebook
        });
        user.save(function (err) {
            if (err)
                res.send(err);
            res.json({message: "user profile is updated"})
        })
    });

    router.delete(path.join(context, '/api/user'), function (req, res) {
        if (req.query.id) {
            return User.findOne({'facebook.id': req.query.id}, function (err, user) {
                if (user) {
                    var name       = user.facebook.name;
                    return user.remove(function (err) {
                        if (!err) {
                            console.log(name + " is removed");
                            return res.send(name + " is removed");
                        } else {
                            console.log(err);
                        }
                    });
                }

            });
        }
    });

    /*
     ------------------------------router for pages------------------------------------
     */
    router.get(path.join(context, '/'), function (req, res) {
        res.render('home.jade');
    });

    router.post(path.join(context, '/'), function (req, res) {
        configAuth.personalityInsights.profile(req.body, function (err, profile) {
            if (err) {
                if (err.message) {
                    err = {error: err.message};
                }
                return res.status(err.code || 500).json(err || 'Error processing the request');
            }
            else
                return res.json(profile);
        });
    });

};
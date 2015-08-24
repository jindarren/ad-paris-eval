/**
 * Created by jin on 27/05/15.
 */
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for the user model

var userSchema = mongoose.Schema({
    facebook: {
        id: String,
        name: String,
        age: Number,
        ageLevel: Number,
        ageText: String,
        gender: String,
        allPost: String,
        ibmPersonality: String,
        timeStamp: {type: Date, default: Date.now()},
        taste: [],
        tasteLog: [],
        big5: {
            openness:Number,
            conscientiousness:Number,
            extraversion:Number,
            agreeableness:Number,
            emotion_range:Number
        },
        big5Level:{
            emoLevel: Number,
            conLevel: Number,
            opeLevel: Number,
            agrLevel: Number,
            extLevel: Number
        }
    }
});

//generating a hash
userSchema.methods.generateHash = function () {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};

//check if the password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('user', userSchema);

/**
 * Created by jin on 08/07/15.
 */
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for the user model

var adSchema_2 = mongoose.Schema({
    ad_url: String,
    ad_category: String,
    ad_brand: String,
    ad_color:String,
    ad_target_user:{
        gender:String,
        age_level:String,
        emo_level:String,
        agr_level:String,
        ope_level:String,
        con_level:String,
        ext_level:String
    },
    ad_target_movie:{
        name:String,
    }
});

//generating a hash
adSchema_2.methods.generateHash = function () {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null)
};

//check if the password is valid
adSchema_2.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('new_ad', adSchema_2);
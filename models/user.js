var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
   username: String,
   password: String
});

// THIS ADDS IN METHODS TO OUR USER
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
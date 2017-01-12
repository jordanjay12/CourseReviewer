var mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
    name: String,
    number: String,
    description: String,
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

var Course = mongoose.model("Course", courseSchema);
module.exports = Course;
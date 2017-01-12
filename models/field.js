var mongoose = require("mongoose");

var fieldSchema = new mongoose.Schema({
    name: String,
    abbreviation: String,
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ]
});

var Field = mongoose.model("Field", fieldSchema);
module.exports = Field;
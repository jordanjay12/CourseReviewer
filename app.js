var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var request = require("request");



mongoose.connect("mongodb://localhost/course_review");


// INCLUDING THE MODELS FOR MY DATABASES
var Field = require("./models/field");
var Course = require("./models/course");
var Comment = require("./models/comment");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.get("/", function(req, res){
   res.render("home"); 
});

// get the fields of study
app.get("/fields", function(req, res){
    Field.find({}, function(err, allFields){
        if(err){
            console.log(err);
        }else{
            res.render("fields", {fields: allFields});
        }
    })
})

// show form to create new field
app.get("/fields/new", function(req, res){
    res.render("new")
})

// creation of new fields
app.post("/fields", function(req, res){
   // here I want to add the data to a database
   // and I want to redirect somewhere
   var name = req.body.name;
   var abbreviation = req.body.abbreviation;
   console.log(name + " " + abbreviation);
   
   var newField = {name: name, abbreviation: abbreviation};
   Field.create(newField, function(err, newlyCreated){
       if(err){
           console.log(err);
       }else{
           console.log(newlyCreated);
           res.redirect("/fields");
       }
   })
});


// SHOW ROUTE
app.get("/fields/:id", function(req, res){
    Field.findById(req.params.id).populate("courses").exec(function(err, foundField){
    //Field.findById(req.params.id).exec(function(err, foundField){
        if(err){
            console.log(err);
        }else{
            console.log(foundField);
            res.render("show", {field: foundField})
        }
    });
});

// create a new course
app.get("/fields/:id/new", function(req, res){
    Field.findById(req.params.id).exec(function(err, foundField){
        if(err){
            console.log(err);
        }else{
            console.log("*********");
            console.log(foundField);
            console.log("*********");
            res.render("newCourse", {field: foundField});
        }
    })
})

// Here I am creating a new course to place in the Field of Study
app.post("/fields/:id", function(req, res){
    Field.findById(req.params.id, function(err, field){
        if(err){
            console.log(err);
        }else{
            Course.create(req.body.course, function(err, course){
                if(err){
                    console.log(err);
                }else{
                    course.save();
                    console.log(course);
                    field.courses.push(course);
                    field.save();
                    res.redirect("/fields/" + field.id);
                    console.log("Successfully found the post route");
                }
            })
        }
    })
})

// SHOW PAGE FOR COURSES WHICH INCLUDES THE COMMENTS ON IT

app.get("/fields/:id/:courseid", function(req, res){
    Field.findById(req.params.id, function(err, field){
        if(err){
            console.log(err);
        }else{
            Course.findById(req.params.courseid, function(err, course){
                if(err){
                    console.log(err);
                }else{
                    res.render("showCourse", {field: field, course: course});
                }
            })
        }
    });
});

// CREATE NEW COMMENT PAGE
app.get("/fields/:id/:courseid/new", function(req, res){
    Field.findById(req.params.id, function(err, field){
        if(err){
            console.log(err);
        }else{
            Course.findById(req.params.courseid, function(err, course){
                if(err){
                    console.log(err);
                }else{
                    res.render("newComment", {field: field, course: course});
                }
            })
        }
    })
})

// Creating a new comment to be placed in the Course
app.post("/fields/:id/:courseid", function(req,res){
    Field.findById(req.params.id, function(err, field){
        if(err){
            console.log(err);
        }else{
            Course.findById(req.params.courseid, function(err, course){
                if(err){
                    console.log(err);
                }else{
                    Comment.create(req.body.comment, function(err, comment){
                        if(err){
                            console.log(err);
                        }else{
                            comment.save();
                            course.comments.push(comment);
                            course.save();
                            console.log("Successfully found the post route and added a new comment");
                            res.redirect("/fields/" + field.id +"/" + course.id);
                        }
                    })
                }
            })
        }
    })
})


app.listen(process.env.PORT, process.env.IP, function(){
   console.log("UVic Course Review App has started");
});
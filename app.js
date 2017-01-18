var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var request = require("request");

var passport = require("passport");
var LocalStrategy = require("passport-local");


// mongoose.connect("mongodb://localhost/course_review");
// mongodb://Jordan:password@ds117819.mlab.com:17819/uviccoursereview
mongoose.connect("mongodb://Jordan:password@ds117819.mlab.com:17819/uviccoursereview");

// INCLUDING THE MODELS FOR MY DATABASES
var Field = require("./models/field");
var Course = require("./models/course");
var Comment = require("./models/comment");
var User = require("./models/user");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Warriors Suck",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// this will be provided on every route
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

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
app.get("/fields/new", isLoggedIn, function(req, res){
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
app.get("/fields/:id/new", isLoggedIn, function(req, res){
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
            Course.findById(req.params.courseid).populate("comments").exec(function(err, course){
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
app.get("/fields/:id/:courseid/new", isLoggedIn, function(req, res){
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
app.post("/fields/:id/:courseid", isLoggedIn, function(req,res){
    Field.findById(req.params.id, function(err, field){
        if(err){
            console.log(err);
            res.redirect("/fields");
        }else{
            Course.findById(req.params.courseid, function(err, course){
                if(err){
                    console.log(err);
                }else{
                    Comment.create(req.body.comment, function(err, comment){
                        if(err){
                            req.flash("error", "Something went wrong");
                            console.log(err);
                        }else{
                            comment.author.id = req.user._id;
                            comment.author.username = req.user.username;
                            comment.save();
                            course.comments.push(comment);
                            course.save();
                            console.log("Successfully found the post route and added a new comment");
                            req.flash("success", "Successfully added review");
                            res.redirect("/fields/" + field.id +"/" + course.id);
                        }
                    })
                }
            })
        }
    })
})

// COMMENT EDIT ROUTE
app.get("/fields/:id/:courseid/:commentid/edit", checkCommentOwnership, function(req,res){
    Comment.findById(req.params.commentid, function(err, comment){
        if(err){
            res.redirect("back");
        }else{
            res.render("editComment", {comment: comment, field_id: req.params.id, course_id: req.params.courseid})
        }
    })
})

// COMMENT UPDATE ROUTE
app.put("/fields/:id/:courseid/:commentid", checkCommentOwnership, function(req,res){
    Comment.findByIdAndUpdate(req.params.commentid, req.body.comment, function(err, updatedComment){
        if(err){
            console.log(err);
        }else{
            res.redirect("/fields/" + req.params.id + "/" + req.params.courseid);
        }
    })
})

// COMMENT DESTROY ROUTE
app.delete("/fields/:id/:courseid/:commentid", checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.commentid, function(err){
      if(err){
          console.log("There was an error while trying to delete the comment");
      } else{
          console.log("successfully deleted the comment");
          //res.redirect("/fields");
          req.flash("succcess", "Review Deleted");
          res.redirect("/fields/" + req.params.id + "/" + req.params.courseid);
      }
   });
});

// REGISTER FORM FOR NEW USERS
app.get("/register", function(req, res){
    res.render("register");
})

// handle sign up logic
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash("error", err.message)
            return res.redirect("register")
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to the UVic Course Review" + user.username);
            res.redirect("/fields");
        })
    }) // provided by the passport-local-mangoose package
})

//SHOW LOGIN FORM
app.get("/login", function(req, res){
    //console.log("Inside of the /login function:");
    //console.log(req.flash("error"));
    res.render("login");
})

// HANDLING LOGIN LOGIC
app.post("/login", passport.authenticate("local" ,
    {
        successRedirect: "/fields",
        failureRedirect: "/login"
    }), function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/fields");
})

//middlewawre
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    //console.log("INSIDE OF THE MIDDLEWARE");
    //console.log(req.flash("error"));
    res.redirect("/login");
}

function checkCommentOwnership(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.commentid, function(err, foundComment){
            if(err){
                req.flash("error", "Course Not Found");
                res.redirect("back");
            }else{
                // does the user own the comment?
                console.log(req.params.commentid);
                console.log("NOW PRINTING THE FOUND COMMENT" + foundComment);
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
}

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("UVic Course Review App has started");
});
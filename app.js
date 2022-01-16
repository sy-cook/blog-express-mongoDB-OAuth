//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const req = require("express/lib/request");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const homeStartingContent = "content";
const aboutContent = "content";
const contactContent = "content";

const postSchema = {
  title: String,
  content: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function(req, res) {
  Post.find({}, function(err, foundPosts) {
    if (!err) {
      if (foundPosts.length === 0) {
        res.redirect("/");
      } else {
        res.render("home", {
          homeParagraph: homeStartingContent,
          posts: foundPosts
        });
      }
    }
  });
});

app.post("/compose", function(req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });

  post.save(function(err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get('/posts/:postID', function(req, res) {
  const postID = req.params.postID;

  Post.findOne({_id: postID}, function(err, foundPost) {
    if (!err) {
      res.render("post", {
        blogPost: foundPost
      });
    }
  });
});

app.get("/compose", function(req, res) {
  res.render("compose");
});

app.get("/about", function(req, res) {
  res.render("about", {
    aboutParagraph: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    contactParagraph: contactContent
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

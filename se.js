const express = require("express");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
const session = require("express-session");
const oneday = 1000 * 60 * 60 * 24;
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "asd3454#$%$@#324",
    cookie: { maxAge: oneday },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));
app.use("/images", express.static(path.join(__dirname, "images")));
let collection;
let attemptQuiz;
let db;
let usersCollection;
let questionsCollection;
MongoClient.connect(
  "mongodb+srv://2111981279:su123@cluster0.xbkkxhr.mongodb.net/?retryWrites=true&w=majority"
)
  .then((client) => {
    console.log("Connected to the database");
    db = client.db("Quiz");
    questionsCollection = db.collection("Question");
    usersCollection = db.collection("Users");
    attemptQuiz = db.collection("Attempts");
  })
  .catch((error) => {
    console.log("Error connecting to the database:", error);
  });

app.post("/login", (req, res) => {
  usersCollection.find({ email: req.body.email, password: req.body.password }).toArray().then((data) => {
      if (data.length > 0) {
        res.sendFile(path.join(__dirname, "Home.html"));
      } else {
        res.sendFile(path.join(__dirname, "login.html"));
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
  //attemptQuiz.find({ email: req.body.email});
});

app.post("/sign", (req, res) => {
  usersCollection
    .find({ email: req.body.email})
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        res.status(409).send("UserName already Exists");
      } else {
        let obj = {};
        obj.name = req.body.name;
        obj.password = req.body.password;
        obj.conform = req.body.conform;
        obj.rollno = req.body.rollno;
        obj.age = req.body.age;
        obj.email = req.body.email;
       
        usersCollection.insertOne(obj).then(() => {
          res.sendFile(path.join(__dirname, "Home.html"));
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/Questions", (req, res) => {
  questionsCollection
    .find()
    .toArray()
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(3000, () => {
  console.log("Server Started");
});

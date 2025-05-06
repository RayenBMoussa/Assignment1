const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 4000;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

require('dotenv').config();


app.use(express.static(__dirname + "/public"));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    crypto: {
      secret: process.env.SESSION_ENCRYPTION_SECRET
    }
  })
}));


const indexRouter = require("./routes/index");
app.use("/", indexRouter);

app.get('/*\w', (req,res) => {
	res.send("Page not found - 404");
})

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PWD}@${process.env.MONGODB_HOST}/Assignment1?retryWrites=true&appName=BCIT`).then(() => {
  console.log('Connected to MONGODB');
}).catch(err => {
  console.log("error connecting to mongodb", err);
})
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const passport = require('passport');
const passportSetup = require('./config/passport-setup');
require('dotenv').config();




const MONGOBD_URI = process.env.MONGODB_URI;


const app = express();

//It is very important to arrange your routing so one route doesnt get mixed up with others
const User = require('./models/user');
const homeRoute = require('./routes/homepage');
const userRoute = require('./routes/users');
const msgRoute = require('./routes/messages');


// const createMessageRoute = require('./routes/send-message');
const errorController = require('./controller/error');


const store = new MongoDBStore({
    uri: MONGOBD_URI,
    collection: 'sessionsdb'
});

app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(morgan('common'));
app.use(express.json());
app.use(cors());
app.use(session({
    secret: process.env.SECRET,
    resave: false, 
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Creating user data before initializing the routes
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    };
    console.log('user session id ' + req.session.user._id);

    User.findById(req.session.user._id)
        .then(user => {
            //storing the user object from the db to the property "user" of the req object
            req.user = user;
            next()
        }).catch(err => {
            console.log(err);
        });
});


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

//also here, arranging routes is important
app.use(homeRoute);
app.use(userRoute);
app.use(msgRoute);



// app.use(createMessageRoute);

app.use(errorController.getError);
//error handling middleware
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    console.log(data + ' validation errors array');
    // res.status(status).send({ message: message, data: data });

    //it's not throwing any here for now
});

const PORT = process.env.PORT || 8080;

mongoose.connect(
    MONGOBD_URI
    )
    .then(result => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => console.log(err));


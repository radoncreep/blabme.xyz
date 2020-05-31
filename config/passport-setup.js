const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const mongoose = require('mongoose');
const User = require('../models/user');

require('dotenv').config();


passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    //retrieving info from the cookie
    User.findById(id)
        .then(user => {
            done(null, user)
        })
});


passport.use(new GoogleStrategy({
    //options for google strategy
    callbackURL: '/auth/google/redirect',
    clientID: process.env.CLIENTIDKEY,
    clientSecret: process.env.CLIENTSECRETKEY
}, (accessToken, refreshToken, profile, done) => {
    //passport callback function

    User.findOne({ googleId: profile.id })
        .then(userMatch => {
            let username = (profile.displayName).split(' ').join('');
            let userEmail = profile.emails[0].value;
            //retrieving user data if available in the db

            if (userMatch) {
                // if user already exist
                done(null, userMatch);
                return res.redirect('/login');   
            } else {
                new User({
                    username: username,
                    googleId: profile.id,
                    email: userEmail
                }).save()
                .then(newUser => { //retrieves all data about the new user
                    done(null, newUser);
                    const msg = {
                        to: email,
                        from: '************',
                        subject: 'Blabme - Incognito Messaging' ,
                        text: 'Anonymous delivery',
                        html: `
                        <h1 style="color: #fc00ff">Welcome</h1>
                        <p>Hi there, thank you for using Incognito messaging,
                        this version is a prototype but your welcome to explore.
                        </p>
                        <br>
                        <p>Your email is secure and would not be given out</p>
                        <br>
                        <p>STAY ACTIVE!</p>
                        `
                    };
                    sgMail.send(msg)
                        .then(mail => {
                            console.log('message delivered')
                        }, error => {
                            console.log(error);
        
                            if (error.response) {
                                console.log(error.response.body)
                            };
                        }
                    )   
                })
            } 
        })
        .catch(err => {
            console.log(err);
        })
}));


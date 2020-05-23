const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto-js')

console.log(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//deprecated
// const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');

const Users = require('../models/user');



exports.getSignup = async (req, res, next) => {
    let message = req.flash('error');

    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    };

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            username: ' ',
            email: ' ',
            password: ' ',
        },
        validationErrors: [ ]
    });
};

//Check if user exist before signing the user up
exports.postSignup = (req, res, next) => {

    const username = req.body.username;
    console.log(username + ' username here');

    const email = req.body.email;
    console.log(email + ' email here');

    const password = req.body.password;
    console.log(password + ' password here');

    const errors = validationResult(req);

    //this errors come from the routes to check if the username and email already exist and if pwd is too short
    if (!errors.isEmpty()) { 
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: username,
                email: email
            },
            validationErrors: errors.array()
        });
        // throw error;
    };

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new Users({
                username: username,
                email: email,
                password: hashedPassword,
                message: [ { } ]
            })
        return user.save();
        })
        .then(result => {
            res.redirect('/login');
           console.log(email + ' anymail here ');
            
            // Message Object
            const msg = {
                to: email,
                from: 'victoronyinyeme@gmail.com',
                subject: 'Incognito Messaging' ,
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
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


// console.log(req.get('Cookie') + ' get cookie'); //outputs undefined which means false
// console.log(req.session);
exports.getLogin = (req, res, next) => {
    let message = req.flash('error'); //this assigns an array to the message variable

    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message,
        oldInput: {
            username: ' ', 
            password: ' ',
        },
        validationErrors: []
        // isAuthenticated: req.session.islogged
    });

};


exports.postLogin = (req, res, next) => {
    // console.log(req.user + ' user req');
    // console.log(username);
    // console.log(password)

    const username = req.body.username;
    const password = req.body.password;
    const errors = validationResult(req);
    
    let loadedUser;

    if (!errors.isEmpty()) {
        return res.status(422).render('/login', {
            path: '/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                username: ' ', 
                password: ' ',
            },
            validationErrors: errors.array()
            // isAuthenticated: req.session.islogged
        })
    };

    Users.findOne({ username: username })
        .then(user => {
            if (!user) {
                console.log('no user')
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: {
                        username: username,
                        password: password
                    },
                    validationErrors: errors.array()
                });
            };
            loadedUser = user;
            //If User with that username is found
            return bcrypt.compare(password, user.password)
                .then(userMatch => {
                    // console.log(user + ' userMatch');
                    if (userMatch) {
                      req.session.isLogged = true;
                      req.session.user = user;
                      return req.session.save(err => {
                        // console.log(err);
                        return res.redirect('/profile')
                      });
                    };

                    console.log('does it come here');
                    //Else if the user password doesnt match you dont want to save that user details in the session
                    res.status(422).render('auth/login',  {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password',
                        oldInput: {
                            username: username,
                            password: password
                        },
                        validationErrors: errors.array()
                    });
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            };
            next(err);
        });
};

exports.googleAuth = (req, res, next) => {
    // console.log(req.user);
    let user = req.user;

    // The Lord's inspiration all through 🙏
    if (user) {
        req.session.isLogged = true;
        req.session.user = user;
        return req.session.save(err => {
          // console.log(err);
          return res.redirect('/profile');
        })
    } else {
        return res.redirect('/login');
    };
};

exports.getProfile = (req, res, next) => {
   
    const userdata = req.user.username;
    console.log(userdata + ' user profile id');

    let fullUrl = req.protocol + '://' + req.get('host') + '/' + userdata;
    console.log(fullUrl + ' here is the fullUrl');
   
    Users.findOne({ username: userdata })
        .then(userProfile => {
            
            // console.log(userProfile.username + " user's profile here");
            //this if statement won't run if the console.log method is uncommented or not removed
            if (!userProfile) { 
                console.log("you entered if statement")
                return res.redirect('/login');
            };
            return res.status(200).render('profile', {
                path: `/profile`,
                pageTitle: 'profile',
                profileName: userProfile.username,
                userLink: fullUrl
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next();
        });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');

    if (message) {
        message = message[0];
    } else {
        message = mull;
    };

    res.render('auth/reset', {
        pageTitle: 'Password Reset',
        path: '/reset',
        errorMessage: message,
        oldInput: ' '
    });
};

exports.postReset = (req, res, next) => {
    const passwordResetEmail = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('auth/reset');
        };

        // Generate a buffer string
        const token = buffer.toString('hex');

        Users.findOne({ email: passwordResetEmail })
            .then(user => {
                if (!user) {
                    req.flash('error', 'no account with that email found');
                    return res.redirect('auth/reset');
                };
                user.resetToken = token;
                user.resetTokenExpiration = Date.now + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('auth/login');
                const msg = {
                    to: email,
                    from: 'victoronyinyeme@gmail.com',
                    subject: 'Reset Password - Incognito Messaging',
                    text: 'You requested password reset for this account',
                    html: `
                    <p>Use the link to reset your account password</p>
                    <p>Click this <a href="http://localhost:8080/reset/${token}">link</a> to set a new password.</p>
                `
                }
                sgMail(msg)
                    .then(mail => {
                        console.log('Mail delivered')
                    })
            })
            .catch(err => {
                console.log(err);
            });
    });
};


    // New password
exports.getNewPassword= (req, res, next) => {
    const userToken = req.params.token;

    Users.findOne({ resetToken: userToken, resetTokenExpiration: {$gt: Date.now() }})
        .then(user => {
            let message = req.flash('error');
            if (message) {
                message = message[0];
            } else {
                message = null;
            };
            return res.status(200).render('auth/new-password', {
                pageTitle: 'Update New Password - Incognito',
                path: '/reset/:token',

            })

        }).catch()
}







// exports.postLogin = (req, res, next) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     let loggedInUser;

//     Users.findOne({ email: email })
//         .then(user => {
//             if (!user) {
//                 return res.status(422).render('auth/login', {
//                     path: '/login',
                    
//                 })
//                 // const error = new Error('incorrect validation');
//                 // error.statusCode = 401; //Unauthorized error
//                 // error.message = "The email provided is not registered";
//                 // throw error;
//             };
            
//             loggedInUser = user;
//             return bcrypt.compare(password, user.password) //this returns a boolean
//             .then(userPwd => {
//                 if (!userPwd) {
//                     const error = new Error('incorrect validation');
//                     error.statusCode = 401 //The req sent could not be authenticated
//                     error.message = 'Incorrect password, please try again or user forget password'
//                     throw error;
//                 };
//                 console.log(loggedInUser); //Output true

//                 //create a json web to for every client logging in
//                 const token = jwt.sign(
//                     { 
//                         email: loggedInUser.email,
//                         username: loggedInUser.username,
//                         _id: loggedInUser._id 
//                     },
//                      'unkwownsecretkey',
//                      { expiresIn: "1h"}
//                     ) 
//                 res.status(200).json({
//                     loginMessage: `Hi ${loggedInUser.username}, Welcome back!`,
//                     userToken: token
//                 });
//             })
//         })
//         .catch(err => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         })
// };


// exports.getProfile = (req, res, next) => {
//     res.status(200).render('profile', {
//         path: '/profile',
//         profileName: 
//     })
// }
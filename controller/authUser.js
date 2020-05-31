const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');


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
            username: '',
            email: '',
            password: '',
        },
        validationErrors: []
    });
};

//Check if user exist before signing the user up
exports.postSignup = (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    //this errors come from the routes to check if the username and email already exist and if pwd is too short
    if (!errors.isEmpty()) { 
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
            
            // Message Object
            const msg = {
                to: email,
                from: 'blabme.xyz@gmail.com',
                subject: 'Anonymous Messaging' ,
                text: 'Anonymous delivery',
                html: `
                <h1 style="color: #fc00ff">Welcome</h1>
                <p>Hi there, thank you for using blabme mobile first incognito messaging,
                This is our very first launch and we hope you progress with us as we keep bringing
                cool features and services to the platform.
                </p>
                <br>
                <p>STAY ANONYMOUS!</p>
                <span style="color:#D3D3D3; font-size: 12px;">Your email is secure and would not be given out</span>
                <br>

                <p style="color:#D3D3D3; font-size: 10px;>Copyright ©2020, RC~Dev</p>
                `
            };
            sgMail.send(msg)
                .then(mail => {
                    console.log('message delivered');
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
            username: '', 
            password: '',
        },
        validationErrors: []
        // isAuthenticated: req.session.islogged
    });

};


exports.postLogin = (req, res, next) => {

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
                username: '', 
                password: '',
            },
            validationErrors: errors.array()
            // isAuthenticated: req.session.islogged
        })
    };

    Users.findOne({ username: username })
        .then(user => {
            if (!user) {
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
                    if (userMatch) {
                      req.session.isLogged = true;
                      req.session.user = user;
                      return req.session.save(err => {
                      
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
    let user = req.user;

    // The Lord's inspiration all through 🙏
    if (user) {
        req.session.isLogged = true;
        req.session.user = user;
        return req.session.save(err => {
          return res.redirect('/profile');
        })
    } else {
        return res.redirect('/login');
    };
};

exports.getProfile = (req, res, next) => {
    const userdata = req.user.username;
    let fullUrl = req.protocol + '://' + req.get('host') + '/' + userdata;
   
    Users.findOne({ username: userdata })
        .then(userProfile => {
            //this if statement won't run if the console.log method is uncommented or not removed
            if (!userProfile) { 
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

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/login');
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
        oldInput: {
            email: ''
        },
        validationErrors: []
    });
};

exports.postReset = (req, res, next) => {
    const passwordResetEmail = req.body.email;

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('auth/reset');
        };

        const token = buffer.toString('hex');
        let username;

        Users.findOne({ email: passwordResetEmail })
            .then(user => {
                if (!user) {
                    req.flash('error', 'no user with the provided email');
                    return res.redirect('auth/reset');
                }
                username = user.username;
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/login');
                const msg = {
                    to: passwordResetEmail,
                    from: 'victoronyinyeme@gmail.com',
                    subject: 'Reset Password - Incognito Messaging',
                    text: 'You requested password reset for this account',
                    html: `
                    <p>Use the link to reset your account password</p>
                    <p>Click this <a href="http://blabme.xyz/reset/${token}">link</a> to set a new password.</p>
                `
                }
                sgMail.send(msg) //this returns a promise
                    .then(mail => {
                        console.log(`Mail delivered to ${user.useranme}`);
                    })
                })
                .catch(err => {
                    console.log(err);
                });
    })             
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
                pageTitle: 'blabme - Update New Password',
                path: '/reset/:token',
                errorMessage: message,
                userId: user._id,
                passwordToken: userToken
            })
        })
        .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;

    let resetUser;

    Users.findOne({ 
        resetToken: passwordToken,
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId 
    })
    .then(user => {
        if (!user) {
            return res.redirect('auth/new-password')
        };
        
        resetUser = user;
        return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save()
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        };

        next(err);
    })
};






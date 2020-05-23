const mongoose = require('mongoose');
const { validationResult } = require('express-validator/check');

const Messages = require('../models/messages');
const Users = require('../models/user');


exports.getMessages = (req, res, next) => {
    //find in the messsage collection the message with the given userId
    // console.log(req.user.username + ' req user');
    Messages.find({ userDetails: req.user._id })
        .then(result => {
            // console.log(typeof result + ' here is result');
            console.log('anon user ' + result )
            res.status(200).render('messages', {
                path: '/messages',
                pageTitle: 'Messages',
                replies: result,
                assocUser: req.user.username,
                sender: result.sender
                // isAuthenticated: req.session.islogged
            })
            // console.log('Here is the result ' + result)
            // res.status(200).json({
            //     message: result
            // })
        })
        .catch(err => console.log(err));
};

exports.sendMessage = (req, res, next) => {
    // console.log('user parameter ' + req.user);
    const user = req.params.username;
    console.log(user + ' Did you enter here');

    Users.findOne({ username: user})
        .then(match => {
            // console.log('found user ' + match.username);
            if (match) {
                return res.status(200).render('sendmessage', {
                    path: `reply/${match.username}`,
                    pageTitle: 'Send A Message',
                    username: match.username
                });
            };

            res.send('Cant send message to unknown user');
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            };
            next(err);
        })
};

exports.createMessages = (req, res, next) => {

    const usermsg = req.params.username;
    // console.log('usernname message ' + usermsg);
    const messages = req.body.message;
    // console.log(messages);
    const errors = validationResult(req);
    // console.log("user message req " + req.user); //this doesn't work because its an authenticated req to the server and therefore stores no user data in the req object
    

    Users.findOne({ username: usermsg })
        .then(user => {
            if (!user) {
                res.send('no user');
            };

            const message = new Messages({
                body: messages, //required 
                userDetails: user,
                sender: Math.floor(Math.random() * 365)
            });
            user.messages.push(message)
            // user.save()
            return message.save()           
        })
        .then(result => {
           return res.send("message delivered")
        })
    
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            };
         next(err);
    });
};


         // .then(result => {
        //     return res.status(201).json({
        //         feedback: 'Message created',
        //         userMsg: result
        //     });
        // })

// exports.createMessage = (req, res, next) => {
//     res.render('sendmessage', {
//         pageTitle: 'Send A reply',
//         path: '/reply'
//     });
// };
//third party packages
const express = require('express');
const { body } = require('express-validator/check');
const User = require('../models/user');
const passport = require('passport');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

const userController = require('../controller/authUser');

router.get('/signup', userController.getSignup);

router.get('/login', userController.getLogin);

// router.get('/auth/google', (req, res, next) => {
//     res.send('<h1>Signing up with google</h1>')
// })

//the middlware is kicked off after an account has been chosen where google checks the keys, ID
router.get('/auth/google', passport.authenticate('google', { //and also the redirect URI
    scope: ['profile', 'email']
}));

router.get('/auth/google/redirect', passport.authenticate('google'), userController.googleAuth);

router.get('/profile', isAuth, userController.getProfile);

router.post('/signup', 
    [
        body('username')
            .trim()
            .isLength({ min: 3 })
            .withMessage('please enter a username more than 2 characters')
            .custom((value, { req }) => {
                return User.findOne({ username: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('username already exist')
                        }
                    })
            }),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please enter a valid email')
            .custom((value, { req }) => {
                return User.findOne({ email: value}).then(userMail => {
                    if (userMail) {
                        return Promise.reject('E-mail already exist')
                    }
                })
            } ),
        body('password')
            .trim()
            .isAlphanumeric()
            .isLength({ min: 7})
            .withMessage('password to short'),
    ], 
    userController.postSignup
);

router.post('/login', userController.postLogin);

router.get('/reset', userController.getReset);

router.post('/reset', userController.postReset);

router.get('reset/:token')



module.exports = router;
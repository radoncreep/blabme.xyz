const express = require('express');
const { body } = require('express-validator/check');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

const messageController = require('../controller/messages');
 

router.get('/messages', isAuth, messageController.getMessages);

router.get('/:username', messageController.sendMessage);

//this post method should be for anonymous users
//It should have the usernames url attached to the path
//can use slug to change the url name
router.post('/:username', 
    [
        body('message').isLength({ min: 7 })
    ],
    messageController.createMessages);

module.exports = router;
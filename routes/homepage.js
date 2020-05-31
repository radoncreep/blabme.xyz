const express = require('express');

const router = express.Router();


router.get('/', (req, res, next) => {
    res.render('blabme', {
        pageTitle: 'Blabme - Anonymous Messaging',
        path: '/'
    });
});

module.exports = router;
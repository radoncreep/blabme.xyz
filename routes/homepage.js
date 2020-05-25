const express = require('express');

const router = express.Router();


router.get('/', (req, res, next) => {
    res.render('blabme', {
        pageTitle: 'Welcome to BlabMe',
        path: '/'
    });
});

module.exports = router;
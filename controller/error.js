

exports.getError = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    res.status(404).render('404', 
    { pageTitle: 
        'Error Page 404', 
        path: '/404',
        isAuthenticated: req.isLoggedIn
    });//templating
};

exports.get500 = (req, res, next) =>  {
    res.status(500).render('/500', {
        pageTitle: 'Database Error!',
        path: '/500',
        isAuthenticated: req.isLoggedIn
    });
};


//this is an example for devoe
// exports.hairstyle = (req, res) => {
//     res.render('3-hairstyle', {
//         pageTitle: 'hairstyle'

//     });
// };
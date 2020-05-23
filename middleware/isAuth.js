


module.exports = (req, res, next) => {
    //if user tries to access a page and is not logged in redirect the user
    if (!req.session.isLogged) {
        return res.redirect('/login');
    };
    next();
};





















//the token is attached to the endpoints
//Verify the token that is coming with the request

// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//     const token = req.get('Authorization').split(' ')[1];
//     let decodedToken;

//     try {
//         decodedToken = jwt.verify(token, 'unknownsecretkey');
//     }
//     catch (err) {
//         err.statusCode = 500;
//         throw err;
//     }
//     if (!decodedToken) { //Checking if a valid token was gotten
//         const error = new Error('Not authenticated');
//         error.statusCode = 401 //Bad request
//         throw error;
//     };

//     //storing the verified id associated with the token in the req object property "userId"
//     req.userId = decodedToken._id; //to use it in other places where the request will go 
//     next()
// };
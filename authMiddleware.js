// authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    // Get the JWT token from the Authorization header
    const token = req.header('Authorization');

    // If token is not present, proceed to the next middleware
    if (!token) {
        return next();
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token.replace('Bearer ', ''), 'abcdefghijklmnopqrstuvwxyz');

        // Attach the decoded user information to the request object
        req.user = decoded;
        next();
    } catch (error) {
        // If token is invalid, send a 401 Unauthorized response
        res.status(401).json({
            message: 'Unauthorized',
            auth: false
        });
    }
}

module.exports = authMiddleware;

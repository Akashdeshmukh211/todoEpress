const User = require('../modules/userModule');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config()


const login = function (req, res, next) {
    res.render('layout/login', { title: 'loginPage' });
}
const register = function (req, res, next) {
    res.render('layout/login', { title: 'registretion' });
}
const registerUser = async function (req, res, next) {
    try {
        const { name, email, username, password } = req.body;
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, username, password: hashedPassword });
        const savedUser = await newUser.save();
        const token = jwt.sign({ savedUser }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        if (savedUser) {
            res.status(200).json({
                "success": true,
                "data": "New User Created",
                token
            })
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

}

// Controller function to handle user login
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        if (token) {
            res.status(200).json({
                "success": true,
                "data": "User Login",
                "token": token,
                'name': user.name,
                'userAccess': user.userAccess
            })
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export controller function(s)
module.exports = {
    login,
    register,
    registerUser,
    loginUser
};
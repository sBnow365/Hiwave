const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const mongoose = require('mongoose');
const UserModel = mongoose.model("UserModel");

module.exports = async (req, res, next) => {
    // Extract authorization header
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "User not logged in" }); // Stops execution
    }

    // Extract the token
    const token = authorization.replace("Bearer ", "");

    try {
        // Verify JWT token
        const payload = jwt.verify(token, JWT_SECRET);
        const { _id } = payload;

        // Find user by ID
        const dbUser = await UserModel.findById(_id);
        if (!dbUser) {
            return res.status(401).json({ error: "User not found" }); // Stops execution if user doesn't exist
        }

        // Attach user data to request and proceed
        req.dbUser = dbUser;
        next();
    } catch (error) {
        return res.status(401).json({ error: "User not logged in" }); // Handles token errors or DB errors
    }
};

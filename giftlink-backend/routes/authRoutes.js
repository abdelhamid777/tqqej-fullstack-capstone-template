const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger 
const logger = pino();  // Create a Pino logger instance

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
        // Task 1: Connect to `giftsdb` in MongoDB through `connectToDatabase` in `db.js`
        const db = await connectToDatabase();

        // Task 2: Access MongoDB collection
        const collection = db.collection("users");

		//Task 3: Check for existing email
        const existingEmail = await collection.findOne({ email: req.body.email });

		const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
		const email = req.body.email;

		//Task 4: Save user details in database
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({authtoken,email});
    } catch (e) {
         return res.status(500).send('Internal server error');
    }
});


// ====================== ADDED LOGIN ENDPOINT ======================

router.post('/login', async (req, res) => {
    try {
        // Task 1
        const db = await connectToDatabase();

        // Task 2
        const collection = db.collection("users");

        // Task 3
        const theUser = await collection.findOne({ email: req.body.email });

        // Task 7
        if (theUser) {

            // Task 4
            let result = await bcryptjs.compare(req.body.password, theUser.password);

            if (!result) {
                logger.error('Passwords do not match');
                return res.status(404).json({ error: 'Wrong password' });
            }

            // Task 5
            const userName = theUser.firstName;
            const userEmail = theUser.email;

            // Task 6
            let payload = {
                user: {
                    id: theUser._id.toString(),
                },
            };

            const authtoken = jwt.sign(payload, JWT_SECRET);

            res.json({ authtoken, userName, userEmail });

        } else {
            logger.error('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});


// ================================================================
router.put('/update', async (req, res) => {
    // Task 2: Validate the input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors in update request', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Task 3: Check if email is present in headers
        const email = req.headers.email;
        if (!email) {
            logger.error('Email not found in the request headers');
            return res.status(400).json({ error: "Email not found in the request headers" });
        }

        // Task 4: Connect to MongoDB and access users collection
        const db = await connectToDatabase();
        const collection = db.collection("users");

        // Task 5: Find user credentials in database
        const existingUser = await collection.findOne({ email });
        if (!existingUser) {
            logger.error('User not found for update');
            return res.status(404).json({ error: "User not found" });
        }

        // Update fields from request body (you can customize which fields are allowed)
        if (req.body.firstName) existingUser.firstName = req.body.firstName;
        if (req.body.lastName) existingUser.lastName = req.body.lastName;
        if (req.body.password) {
            const salt = await bcryptjs.genSalt(10);
            existingUser.password = await bcryptjs.hash(req.body.password, salt);
        }

        existingUser.updatedAt = new Date();

        // Task 6: Update user credentials in database
        const updatedUser = await collection.findOneAndUpdate(
            { email },
            { $set: existingUser },
            { returnDocument: 'after' }
        );

        // Task 7: Create JWT authentication
        const payload = {
            user: {
                id: updatedUser.value._id.toString(),
            },
        };
        const authtoken = jwt.sign(payload, JWT_SECRET);

        res.json({ authtoken });

    } catch (e) {
        return res.status(500).send('Internal server error');
    }
});
module.exports = router;

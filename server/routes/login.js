const express = require('express')
const router = express.Router()

//connect the database model
const Restaurant = require('../models/restaurant')
const User = require('../models/profile')

// validate login details
router.post('/', async(req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username, password}).exec();

        if (!user) {
            return res.status(400).send({ message: 'invalid credentials' })
        }

        req.session.userId = user._id;
        return res.redirect('/');
    } catch (error) {
        console.log(error)
    }
})


module.exports = router
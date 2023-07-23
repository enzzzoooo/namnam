const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/namnam', { useNewUrlParser: true }) 
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// the app will use ejs for the views
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Use Routes for index ejs and render the file
app.get('/', (req, res) => {


    res.render('index');
});

// port
app.listen(port, () => console.log(`Server running on port ${port}`));



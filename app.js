require('dotenv').config()
const express = require('express')
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser');
const namnamDB = require('./server/config/db')

const User = require('./server/models/profile')
const Restaurant = require('./server/models/restaurant')


//connect to db
namnamDB()

const app = express()
const port = process.env.PORT || 3000

app.use(express.static('public'))

// Add body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add express sessions
app.use(session({
  secret: '123', // put your own secret here
  resave: false,
  saveUninitialized: false,
}));

//Template engines
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

app.use( async (req, res, next) => {
  let user = null;
  
    if (req.session.userId) {
        user = await User.findById(req.session.userId);
    }

    res.locals.user = user;

    next();
});

app.use('/', (req, res, next) => {
        // res.locals.user = req.session.user;
        next(); 
    }, require('./server/routes/main'),
);

app.use('/login', require('./server/routes/login'))

//listen on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
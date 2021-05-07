const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const mongoose = require('mongoose');
const methodOverride = require ('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path')
const passport = require('passport')

// Fix for allow-prototype-access issue
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const app = express()

// Load routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Config
require('./config/passport')(passport)
const db = require('./config/database')

// Connect to monoose
mongoose.connect(db.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Mongo DB connected"))
  .catch(err => console.log(`Unable to connect, error ${err}`));

// Handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Method override middleware (transform HTML PUT to POST)
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')))

// Middleware for session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use( function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//Index Route
app.get('/', (req, res) => {
  const title = 'Welcome Peter'
  res.render('index', {
    title: title
  });
});

// About
app.get('/about', (req, res) => {
  res.render('about');
})

app.use('/ideas', ideas);
app.use('/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
}
)

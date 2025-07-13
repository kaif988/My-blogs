const express = require('express');
const { result } = require('lodash');
const morgan = require('morgan')
const mongoose = require('mongoose');
const blogRoutes = require('./routes/blogRoutes');
const passport = require('passport');
const session =require('express-session')
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const flash = require('connect-flash')




const app = express();

const dbURI = 'mongodb+srv://nodeblogs:Bagali98802@ac-3vkmjxz.bfg0spp.mongodb.net/nodeblogs?retryWrites=true&w=majority&ssl=true';

mongoose.connect(dbURI)
.then((result) => app.listen(3000))
.catch((err) => console.log(err));


// regester vieew engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'))
app.use(express.urlencoded({ extended:true}));    
app.use(express.json()); ///app uses AJAX/fetch
app.use(morgan('dev'));


// Session configuration
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));
  // Add this after session middleware (~line 35)
  app.use(flash());
  // Add this after passport setup (~line 45)
      function isLoggedIn(req, res, next) {
          if (req.isAuthenticated()) return next();
          req.flash('error', 'Please login first');
          res.redirect('/login');
      }
      
      // Passport setup
      app.use(passport.initialize());
      app.use(passport.session());
      
      passport.use(new LocalStrategy(User.authenticate()));
      passport.serializeUser(User.serializeUser());
      passport.deserializeUser(User.deserializeUser());
      app.use((req, res, next) => {
          res.locals.messages = req.flash();
          res.locals.user = req.user; // Makes user available in all views
          next();
      });
 // ALL Blog  routers
app.use(blogRoutes);



// ===== Add this AFTER all other routes BUT BEFORE the 404 handler =====
// 1. Login Page (GET)
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
  });
  
  // 2. Login Form Submission (POST)
  app.post('/login', 
    passport.authenticate('local', {
      successRedirect: '/blogs',
      failureRedirect: '/login',
      failureFlash: true // Optional for error messages
    }))

    app.get('/logout', (req, res, next) => {
        req.logout((err) => {
          if (err) {
            console.error('Logout error:', err);
            return next(err); // Pass error to Express error handler
          }
          req.session.destroy((err) => { // Destroy the session completely
            if (err) {
              console.error('Session destruction error:', err);
              return next(err);
            }
            res.redirect('/login');
          });
        });
      });

  // ----- Registration Routes (Add these 2 lines) -----
app.get('/register', (req, res) => res.render('register', { title: 'Register' }));
app.post('/register', (req, res) => {
    // Validate input
    if (!req.body.username || !req.body.password) {
      req.flash('error', 'Username and password are required');
      return res.redirect('/register');
    }
  
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          console.error('Registration error:', err); // Log the error
          req.flash('error', err.message);
          return res.redirect('/register');
        }
        passport.authenticate('local')(req, res, () => {
          req.flash('success', 'Registration successful!');
          res.redirect('/blogs');
        });
      }
    );
  });
  // ======================
// PROFILE ROUTES (Add here)
// ======================

// View profile
app.get('/profile/:username', (req, res) => {
    User.findOne({ username: req.params.username })
      .then(user => {
        if (!user) {
          return res.status(404).render('404', { 
            title: 'User Not Found' // Add title here
          });
        }
        res.render('profile', {
          title: `${user.displayName || user.username}'s Profile`,
          profileUser: user,
          currentUser: req.user
        });
      })
      .catch(err => {
        res.status(500).render('404', { 
          title: 'Server Error' // Add title here
        });
      });
  });
  // Show edit form (GET)
app.get('/profile/edit', isLoggedIn, (req, res) => {
  res.render('edit-profile', { 
    title: 'Edit Profile',
    user: req.user 
  });
});
  // Update profile (protected)
  app.post('/profile/edit', isLoggedIn, async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          displayName: req.body.displayName,
          bio: req.body.bio
        },
        { 
          new: true,          // Return updated document
          runValidators: true  // Validate the update
        }
      ).lean().exec();
  
      if (!updatedUser) {
        req.flash('error', 'User not found');
        return res.redirect('/profile/edit');
      }
  
      req.flash('success', 'Profile updated successfully');
      res.redirect(`/profile/${req.user.username}`);
  
    } catch (err) {
      console.error('Profile update error:', err);
      req.flash('error', 'Failed to update profile');
      res.redirect('/profile/edit');
    }
  });
  
app.use((req,res) =>{

    res.status(404).render('404' , {title: '404 Error'});
});



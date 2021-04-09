//Section 1 Installations
const express = require('express');
const app = express();
const {pool} = require('./dbConfig'); //db connection
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json()); // support json encoded bodies
const axios = require('axios');
const passport = require('passport');
const initializePassport = require('./passportConfig');
initializePassport(passport);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false})); // support encoded bodies** check back here
app.use(express.static(__dirname + '/'));

app.use(
  session({
  secret: 'secret',
  resave: false,

  saveUninitialized: false
  })
);

app.use(passport.initialize()); 
app.use(passport.session()); 
app.use(flash());






//Section 2 USER REGISTRATION
app.get('/registration', (req, res)=> {

  res.render('pages/registration',{
    page_title: "Registration Page",
    error: ''
  })

});


app.post('/registration', async (req,res)=>{
  
  let{createusername, createemail, createpwd, confirmcreatepwd} = req.body;
  console.log({createusername, createemail, createpwd, confirmcreatepwd});

  let errors = [];

  if(!createusername || !createemail || !createpwd){
    errors.push({message: "Please enter all fields"});
  }

  if(createpwd.length < 6){
    errors.push({message: "Password too short. Must be at least 6 characters"});
  }

  if(createpwd != confirmcreatepwd){
    errors.push({message: "Passwords do not match!"});
  }

  if(errors.length > 0){
    res.render('pages/registration', {
      page_title: "Registration Page",
      error: errors
      
    })
  }else{
    //Form validation passed
    let hashedpassword = await bcrypt.hash(createpwd, 10);
    console.log(hashedpassword);

    pool.query(
      `SELECT * FROM users 
      WHERE email =$1`, 
      [createemail], 
      (err, results)=>{
        if(err){
          throw err;
        }
        console.log(results.rows);

        if(results.rows.length >0){
          errors.push({message: "Email already registered!"}); //Error message works!s
          res.render('pages/registration',{
            page_title: "Registation Page",
            errors: errors
          });
        }else{
          //if the user is not already in the database(email), insert the new user into the database
          pool.query(
            `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, password`, [createusername, createemail, hashedpassword], (err, results)=>{
                if(err){
                  throw err
                }
                console.log(results.rows);
                req.flash('success_msg', "You are registered! Please log in."); //this works
                res.redirect('/login');
            }
          )
          //I need to make nutrition table on my end-Vignesh
          // initialize in nutrition table
          pool.query(`INSERT INTO nutrition (email) VALUES ($1)`, [createemail], (err, results)=>{
            if(err){
              throw err
            }
            console.log("Nutrition "+ results.rows)
          })
        }
      }
    )//end of query
    
  }

});


//Section 2 USER LOGIN
app.get('/login', (req,res) =>{
  res.render('pages/registration',{
    page_title: "Log In"
  })
})


app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
      successRedirect: '/profile', //if user login succeeded, redirect to their profile 
      failureRedirect: '/login', //if user login failed, redirect to login page
      failureFlash: true
  }) (req, res, next)
});

//Section 3 USER LOGOUT
app.get('/logout', (req,res)=>{
  req.logOut();
  req.flash('success_msg', "You have successfully logged out");
  res.redirect('/login');
})


//SECTION 4 ABOUT
app.get('/about', function(req, res) {
  res.render("pages/about", {
    page_title: "About"
  })
});

//Section 5 SLEEP
app.get('/sleep', function(req, res) {
  res.render("pages/sleep", {
    page_title: "Sleep"
  })
});

//Section 6 HOME
app.get('/home', function(req, res) {
  res.render("pages/home", {
    page_title: "OptimizedHealth"
  })
});


//Section 7 QUICK SEARCH (api)
app.get('/quickSearch', function(req, res) {
  res.render("pages/quickSearch", {
    page_title: "Quick Search",
    items: '',
    error: '',
    message: '',
    image: '../img/question.png'
  });
});

app.post('/quickSearch', function(req,res){
    
    var question = req.body.nutritionQuestion;
    var answer = '';
    var options = {
      method: 'GET',
      url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/quickAnswer',
      params: {q: question},
      headers: {
        'x-rapidapi-key': 'ccf48e8edamsh0c8e0f54970109ap10334cjsn9a7cd1704ccd',
        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
      }
    };
    
    axios.request(options).then(function (response) {
    
      console.log(response.data);
        //the response data will hold the answer and an image
        res.render('pages/quickSearch',{
          page_title: "Quick Search",
          items: response.data.answer,
          error: false,
          message: '',
          image: response.data.image
    
      })
    }).catch(function (error) {
      console.error(error);
    });

});




//Section 8 TRENDING
app.get('/trending', function(req, res) {
  res.render("pages/trending", {
    page_title: "Trending"
  })
});




//Section 9 PROFILE
app.get('/profile', (req, res)=> {
  console.log("Directed to profile page");
  if (req.user) { 
    var user_name = req.user.name;
    var user_email = req.user.email;
    var query = 'SELECT bmr, tdee FROM nutrition WHERE email=\''+user_email+'\';'
    var bmr;
    var tdee;
    //console.log("query: "+query)
    var user_bmr = pool.query(query, (err,response)=>{
      console.log(response.rows);
      console.log(response.rows[0].bmr);
      bmr = response.rows[0].bmr;
      tdee = response.rows[0].tdee;
      res.render("pages/profile", {
        page_title: "Profile",
        user: user_name,
        user_email: user_email,
        user_bmr: bmr,
        user_tdee: tdee
      });
      if(err){
        throw err;
      }
 
    }); 

  }
  else {
    // if not logged in, can't see profile page
    //or if server is restarted
    res.redirect('/registration');
  }
});


//Section 9 FITNESS
app.get('/fitness', function(req, res) {
  res.render("pages/fitness", {
    page_title: "Fitness"
  })
});

//Section 10 NUTRITION
app.get('/nutrition', function(req, res) {
  res.render("pages/nutrition", {
    page_title: "Nutrition"
  })
});


//Section 11 MEAL DATABASE(api)
app.get('/meal_database', function(req, res) {
  var dietType = req.body.dietType;
  var userCalories = req.body.userCalories;
  res.render("pages/meal_database", {
    page_title: "Meal Database",
    diet: '',
    calories: '',
    excluded: '',
    items: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: ''
  })
});

app.post('/meal_database', function(req,res){
    
  var dietType = req.body.dietType;
  var userCalories = req.body.userCalories;
  var exclude = req.body.exclude;
  //console.log("diet type: " + dietType);
  //console.log("calories "+userCalories)
  //console.log("excluding: " + exclude);

  var options = {
    method: 'GET',
    url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/mealplans/generate',
    params: {
      timeFrame: 'day',
      targetCalories: userCalories,
      diet: dietType,
      exclude: exclude
    },
    headers: {
      'x-rapidapi-key': 'ccf48e8edamsh0c8e0f54970109ap10334cjsn9a7cd1704ccd',
      'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
    }
  };
  
  axios.request(options).then(function (response) {
    console.log(response.data);

    res.render('pages/meal_database',{
      page_title: "Meal Database",
      diet: dietType,
      calories: userCalories,
      excluded: exclude,
      items: response.data.meals,
      calories: response.data.nutrients.calories,
      protein: response.data.nutrients.protein,
      fat: response.data.nutrients.fat,
      carbs: response.data.nutrients.carbohydrates
          
    });
  }).catch(function (error) {
    console.error(error);
  });

});



// personalized nurition page
app.get('/personalizednutritionpage', function(req, res) {
  res.render("pages/personalizednutritionpage", {
    page_title: "Personalized Nutrition Page"
  })
});

app.get('/nutritioncalc', function(req, res) {
  res.render("pages/nutritioncalc", {
    page_title: "Nutrition Calculators",
    message: ''
  })
});

app.post('/nutritioncalc', function(req, res) {

  console.log(req.body);
  let{b, l, d, s1, s2} = req.body;

  var breakfast = parseInt(b);
  var lunch = parseInt(l);
  var dinner = parseInt(d);
  var snack1 = parseInt(s1);
  var snack2 = parseInt(s2);

  pool.query(`UPDATE nutrition SET calorie_intake=\'{${breakfast},${lunch},${dinner},${snack1},${snack2}}\' WHERE email=$1`, [req.user.email],
  (err, results) => {
    if(err) {
      throw err
    }
    console.log("Updated calorie intake");

    res.render("pages/nutritioncalc", {
      page_title: "Nutrition Calculators",
      message: "Successfully submitted."
    })

  })
})

app.get('/BMRcalc', function(req, res) {
  res.render("pages/BMRcalc", {
    page_title: "BMR Calculator",
    message: ''
  })
});

//referenced from registration post request
app.post('/BMRcalc', function(req, res) {

  // console.log(req.body.BMR);
  var BMR = req.body.BMR;

  // use update to modify existing row
  pool.query('UPDATE nutrition SET bmr=$1 WHERE email=$2', [BMR, req.user.email],
  (err, results) => {
    if(err) {
      throw err
    }
    console.log("Updated BMR");

    res.render("pages/BMRcalc", {
      page_title: "BMR Calculator",
      message: "Successfully submitted."
    })

  })
})

app.get('/TDEEcalc', function(req, res) {
  res.render("pages/TDEEcalc", {
    page_title: "TDEE Calculator",
    message: ''
  })
});

app.post('/TDEEcalc', function(req, res) {

  var TDEE = req.body.TDEE;
  console.log("TDEE " + TDEE);
  // use update to modify existing row
  pool.query('UPDATE nutrition SET tdee=$1 WHERE email=$2', [TDEE, req.user.email],
  (err, results) => {
    if(err) {
      throw err
    }
    console.log("Updated TDEE");

    res.render("pages/TDEEcalc", {
      page_title: "TDEE Calculator",
      message: "Successfully submitted."
    })

  })
})


// Fitness form data
app.post('/formreq', function(req, res, next){
  // req.body object has the form values
  console.log(req.body.activityName);
  console.log(req.body.type);
  console.log(req.body.date);
  console.log(req.body.duration);
  console.log(req.body.difficulty);

  // pool.query(
  //   `INSERT INTO FITNESS VALUES ($1, $2, $3, $4, $5)`, 
  //   [req.body.activityName, req.body.date, req.body.duration, req.body.type, req.body.difficulty], (err, results)=>{
  //     if(err){
  //       throw err
  //     }
  //     console.log(results.rows);
  //     res.redirect('/fitness');
  //   }
  // )
});







app.listen(process.env.PORT||4000, function() {
  console.log("Server started on port 4000" + __dirname);
});



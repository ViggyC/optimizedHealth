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


//IMPORTANT!!!!: req.user is the authenticated user coming from passport and is in a current session



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
         
          // initialize in nutrition table
          pool.query(`INSERT INTO nutrition (email) VALUES ($1)`, [createemail], (err, results)=>{
            if(err){
              throw err
            }
            console.log("Nutrition "+ results.rows)
          })

          //init fitness table
          var activityID = Date.now();
          pool.query(`INSERT INTO fitness (activityID, email) VALUES ($1, $2)`, [activityID, createemail], (err, results)=>{
            if(err){
              throw err
            }
            console.log("fitness "+ results.rows)
          })

          //init sleep table
          pool.query(`INSERT INTO sleepinfo (sleepID, email) VALUES ($1, $2)`, [activityID, createemail], (err, results)=>{
            if(err){
              throw err
            }
            console.log("sleepinfo "+ results.rows)
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
      successRedirect: '/home', //if user login succeeded, redirect to their profile 
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



//Section 6 HOME
app.get('/home', function(req, res) {
  var userName = req.user.name;
  console.log(userName);
  res.render("pages/home", {
    page_title: "OptimizedHealth",
    user_name: userName
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
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy;
  
  if (req.user) { 
    var user_name = req.user.name;
    var user_email = req.user.email;
    var query = 'SELECT bmr, tdee, calorie_intake, user_journal FROM nutrition WHERE email=\''+user_email+'\';'
    
    
    var bmr;
    var tdee;
    var b;
    var l;
    var d;
    var s1;
    var s2;
    var quote;
    var journal;
    //console.log("query: "+query)
    const settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://type.fit/api/quotes",
      "method": "GET"
    }
    axios.request(settings).then(function (response) {

      var numQuotes = response.data.length;
      var randomQuote  = Math.floor(Math.random() * numQuotes); 
      
      quote = response.data[randomQuote].text;
      quoteAuthor = response.data[randomQuote].author;
      console.log(quote);
      var user_bmr = pool.query(query, (err,response)=>{
        console.log(response.rows);
        console.log(response.rows[0].bmr);
        bmr = response.rows[0].bmr;
        tdee = response.rows[0].tdee;
        journal = response.rows[0].user_journal;
        console.log("Journal: "+journal);
        
        //b=response.rows[0].calorie_intake[0];
        if(response.rows[0].calorie_intake===null){
          b=null
          l=null
          d=null
          s1=null
          s2=null
        }else{
          b=response.rows[0].calorie_intake[0]
          l=response.rows[0].calorie_intake[1];
          d=response.rows[0].calorie_intake[2];
          s1=response.rows[0].calorie_intake[3];
          s2=response.rows[0].calorie_intake[4];
        }
        res.render("pages/profile", {
          page_title: "Dashboard",
          user: user_name,
          user_email: user_email,
          user_bmr: bmr,
          user_tdee: tdee,
          user_quote: quote,
          quote_author: quoteAuthor,
          b: b,
          l: l,
          d: d,
          s1: s1,
          s2: s2,
          today:today,
          journal: journal

        });
        if(err){
          throw err;
        }
   
      }); 
  
     });

  }
  else {
    // if not logged in, can't see profile page
    //or if server is restarted
    res.redirect('/registration');
  }
});

app.post('/profile', (req,res)=>{
  var user_journal = req.body.comments;
  console.log(user_journal);
  pool.query('UPDATE nutrition SET user_journal=$1 WHERE email=$2', [user_journal, req.user.email],
  (err, results) => {
    if(err) {
      throw err
    }
    console.log("Updated Journal");

    res.redirect('profile');

})
})





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

//Section 9 FITNESS
app.get('/fitness', function(req, res) {
  var user_email = req.user.email;
  console.log("User email " +user_email);
  var query = 'Select activityName, date, duration, type, difficulty from fitness WHERE email=\''+user_email+'\';'
  console.log("query: " +query);
  var activityName;
  var date;
  var duration;
  var type;
  var difficulty;
  pool.query(query, (err,response)=>{
    console.log(response.rows);

    res.render("pages/fitness", {
      page_title: "Fitness",
      items: response.rows,
      activityName: response.rows.activityname,
      date: response.rows.date,
      duration: response.rows.duration,
      type: response.rows.type,
      difficulty: response.rows.difficulty
    })
  })
  
});
// Fitness form data
app.post('/formreq', function(req, res, next){
  // req.body object has the form values
  console.log(req.body.activityName);
  console.log(req.body.type);
  console.log(req.body.date);
  console.log(req.body.duration);
  console.log(req.body.difficulty);
  var user_email = req.user.email;
  var activityID = Date.now();
  

  pool.query(
    `INSERT INTO fitness (activityname, date, duration, type, difficulty, email, activityid) VALUES($1, $2, $3, $4, $5, $6, $7)`, 
    [req.body.activityName, req.body.date, req.body.duration, req.body.type, req.body.difficulty, user_email, activityID], (err, results)=>{
      if(err){
        throw err
      }
      console.log(results.rows);
      res.redirect('/fitness');
    }
  )
});

//SLEEP
app.get('/sleep', function(req, res) {
  console.log("In sleep get request");
  var user_email = req.user.email;
  console.log("User email: " +user_email);
  var query = 'SELECT sleeptype, date, yesno, starttime, endtime FROM sleepinfo WHERE email=\''+user_email+'\';'
  console.log("query: " +query);

  pool.query(query, (err,response)=>{
    console.log("response: " +response.rows);

    res.render("pages/sleep", {
      page_title: "Sleep",
      items: response.rows,
      sleepType: response.rows.sleepType,
      date: response.rows.date,
      yesNo: response.rows.yesNo,
      startTime: response.rows.starttime,
      endTime: response.rows.endtime,
    })
  })
  
});
  

// sleep form data
app.post('/sleepreq', function(req, res, next){
  // req.body object has the form values
  // outputs user input to console
  console.log(req.body.sleepType);
  console.log(req.body.date);
  console.log(req.body.startTime);
  console.log(req.body.endTime);
  console.log(req.body.q1);
  console.log(req.body.yesNo);
  console.log(req.body.futreGoalLenght);
  console.log(req.body.futureStartTime);
  console.log(req.body.futreEndTime);
  console.log(req.body.realStartTime);
  console.log(req.body.realEndTime);

  var user_email = req.user.email;

  var sleepID = Date.now();
  

 pool.query(
   `INSERT INTO sleepInfo VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, 
    [req.body.sleepType, req.body.date, req.body.startTime, req.body.endTime, req.body.q1, req.body.yesNo, req.body.futureGoalLength, req.body.futureStartTime, req.body.futureEndTime, req.body.days, req.body.realStartTime, req.body.realEndTime, user_email, sleepID], (err, results)=>{
      if(err){
        throw err
      }
      console.log(results.rows);
      res.redirect('/sleep'); 
    }
  )

});







app.listen(process.env.PORT||4000, function() {
  console.log("Server started on port 4000" + __dirname);
});



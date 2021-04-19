var button = document.getElementById('accountsubmit-button');
var myInput = document.getElementById("createpwd");
var confirmMyInput = document.getElementById("confirmcreatepwd");


//checking that passwords match
confirmMyInput.addEventListener('keyup', ()=>{
  if(confirmMyInput.value===myInput.value){
    button.disabled = false;
  }

});

// const localStrategy = require("passport-local").Strategy
// const bcrypt = require('bcrypt');

// function initialize(passport, getUserByEmail){
//   const authenticateUser = (email, password, done) =>{
//     const user = gerUserByEmail(email);
//     if(user==null){
//       return done(null, false, {message: 'No user with that email'});
//     }

//     try{
//       if(await bcrypt.compare(password, user.password)){
//           return done(null, user);
//       }else{
//         return done(null, false, {message: 'Password incorrect'});
//       }

//     }catch(e){
//       return done(e);
//     }
//   }
  
//   passport.use(new localStrategy({usernameField: 'email' }), authenticateUser)
//   passport.serializeUser((user, done)=> {  } )
//   passport.deserializeUser((id, done)=> {  } )

// }

//module.exports = initialize;


function addUser() {
  alert("Registering...")
 

  //ISSUE: 
  

}



//make ajax calls with Jquery next///////
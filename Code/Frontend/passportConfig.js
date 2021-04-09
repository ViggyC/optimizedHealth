//for login
const Localstrategy = require('passport-local').Strategy;

const {pool} = require('./dbConfig');
const bcrypt = require('bcrypt');



function initialize(passport){

    const authenticateUser = (email,password, done)=>{

        pool.query(
            `SELECT * from users WHERE email = $1`, [email], (err, results)=>{ //fetch email then compare password
                if(err){
                    throw err;
                }
                console.log(results.rows);
                if(results.rows.length>0){ //user found(email)
                    const user = results.rows[0]; //passing user object from users
                    bcrypt.compare(password, user.password, (err, isMatch)=>{
                        if(err){
                            throw err
                        }

                        if(isMatch){
                            return done(null, user);
                        }else{
                            return done(null, false, {message: "Incorrect Password"});
                            
                        }
                    
                    });
                }else{
                    //if no users
                    return done(null, false, {message: "Email not registered"});
                }
            }
        )

    }



    passport.use(new Localstrategy({
        usernameField: "email",
        passwordField: "password"
    }, 
    authenticateUser
    )
    );
    passport.serializeUser((user, done)=> done(null, user.id)); //stores user id in session

    passport.deserializeUser((id, done)=>{
        pool.query(
            `SELECT * from users WHERE id = $1`, [id], (err, results)=>{
                if(err){
                    throw err
                }
                return done(null, results.rows[0]);
            }
        )
    })
}

module.exports = initialize;
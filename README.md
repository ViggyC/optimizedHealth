# optimizedHealth
Application Description:

Our OptimizedHealth application is an all-in-one stop for users to check up on their mental and physical health. Users will be able to record their bodily health by logging into a designated portal with a username and password. Once inside our application, in the ‘record general health’ section the user will be able to record their caloric intake and expenditure per day, as well as their exercise and sleep minutes. In the ‘record mental health’ section, the user will be able to record their daily mood and compare this to their general health habits to see if they are correlated. In the ‘BMI calculator’ section, the user can input their weight and height to calculate their corresponding BMI. Based on all of these factors, there will be an option for the user to get feedback on their exercise and sleep minutes, and caloric intake. This feedback includes suggesting an increase or decrease in performance in any of these categories, as well as meals that correspond to BMI and caloric intake. On the front end, the OptimizedHealth application will show a user their health habits using HTML or CSS. The UI will be streamlined for both efficiency and simplicity. On the back end, ranges of appropriate sleep and exercise minutes, BMI, caloric intake per weight and height, and meals will be stored using SQL.

Architecture Plan:

We will use HTML and CSS for displaying and styling our website, as well as include Bootstrap4(JQuery) links to aid in our styling. We will write the front-end files in VS Code or another programming IDE. The client/user will be able to interact with the front end of our website by scrolling through it or clicking on different tabs. We will use Node.js in order to connect the client side of the website to the server side and allow JavaScript to make the website functional and interactive via API calls. For the backend of our business we will use either MongoDB or postgres for our server side and database management system. We will decide later on in the course based on what we prefer. Information from the database will be pushed to the front end when the user requests the appropriate data.

Repo Organization: 

The Code folder contains all of the necessary source code needed to run our application. Within the Code folder is a Frontend folder, which contains all of our ejs files, js files, images, css files, database configuration file, passport-local file, and our server.js file. The Code folder also contains a Backend folder which contains our database scripts used to create the tables.

How to run code: You may clone this repo and use the Backend scripts to build the database tables in PostgreSQL. We are currently working on getting this application deployed to Heroku and will paste the link here when completed

Heroku Link: https://optimizedhealth.herokuapp.com/

Authors: Vignesh Chandrasekhar, Leah Dillard, Finbar Forward, Evie Lee, Jamal Giornazi

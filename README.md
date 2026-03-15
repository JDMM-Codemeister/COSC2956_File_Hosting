# Setup Instructions  

1. Install PostgreSQL (psql), Node.js, and Express.js on computer
2. Set up psql database (DB)
3. Make 2 tables in psql DB
  - **files**  
  ![files](/files_table.png)
  - **users**  
  ![files](/users_table.png)  
4. Make sure all packages in package.json are installed
5. **IMPORTANT** Need to add your own .env file with the following variables (for your database):  
  - POSTGRES_DB="*yourDB*"  
  - POSTGRES_PASSWORD="*yourPassword*"  
  - WEB_TOKEN="*yourToken*"  
6. cd to project directory  
7. Create an uploads/ directory  
8. Run *node server.js*  
9. Go to *http://localhost:3000*  


# Endpoints  

## POST /login  
- This route takes the user's inputted email and password (which have been prescreen by the "submit" buttons functionality) from the req body.  
- isValidEmail() is run on the email, which uses REGEXs to esnsure a proper format is used (alphanumeric@alphanumeric.alphanumeric).  
- isValidPassword() is run on the password, which uses REGEXs to ensure proper format (8+ char, 1+ digit, 1+ uppercase). 
- The email is queried against the users table, if there is a match, the given password is compared with the saved hashed password using *bcrypt*.  
- If the password is matched with the stored hashed password, a token is issues using JSON Web Token (*jwt*), and sent to the user in the res.   


## POST /register
- The given email and password is sent to the backend using the req body.  
- The email is checked using REGEXs to verify the correct format.  
- isValidPassword() is run on the password, which uses REGEXs to ensure proper format (8+ char, 1+ digit, 1+ uppercase), registration aborted if not.  
- The given email is queried against the users table, and the registration is aborted if there is already a user using that email.  
- If the user doesn't exist already, the password is hashed using *bcrypt*, and the email and hashed password are entered into the users table.  


## POST /upload  
- This post method uses the verifyToken(), which takes the users token from the req headers. *jwt* is used to check if the token is valid or not. No/invalid token = no access.  
- The post method then uses the multer.Multer.single(), to pass the file to the backend.  
- The user and file info is taken from the req.  
- If no file uploaded, then abort.  
- The users id KEY is put into a variable from the users table.  
- User and metadata are inserted into the files table.  

## DELETE /delete  
- This post method uses the verifyToken(), which takes the users token from the req headers. *jwt* is used to check if the token is valid or not. No/invalid token = no access.  
- The user and file info is taken from the req.  
- The users id KEY is put into a variable from the users table.  
- The files table is queried to see if file exists.  
- The files table is queried using the filename and user id to ensure file ownership, and the file is deleted from the DB upon confirmation.  
- The file is the n deleted from uploads/ using the *fs* unlinkSync().   

## GET /show-all-files  
- This get method uses the verifyToken() method as before.  
- Upon token confirmation only, the files data from the files table are shown using a query which joins the associated users email from the users table.  
- The query results are sent to the frontend with the response using an array.  

## GET /show-my-files  
- This get method behaves similarly to the /show-all-files route, except that the query involves a WHERE clause that only returns results that match the email sent from the frontend req.

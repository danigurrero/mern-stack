// Import necessary modules
import express from "express"; // Express framework
import bodyParser from "body-parser"; // Middleware to parse request body
import pg from "pg"; // PostgreSQL client
import bcrypt from "bcrypt"; // Library for hashing passwords
import passport from "passport"; // Authentication middleware
import { Strategy } from "passport-local"; // Local authentication strategy
import session from "express-session"; // Middleware for session management
import env from "dotenv"; // Load environment variables

// Initialize Express app
const app = express();
const port = 3000; // Port to listen on
const saltRounds = 10; // Number of salt rounds for password hashing
env.config(); // Load environment variables from .env file

// Middleware setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Session secret
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory

app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Use Passport for session management

// Database connection setup
const db = new pg.Client({
  user: process.env.PG_USER, // Database user
  host: process.env.PG_HOST, // Database host
  database: process.env.PG_DATABASE, // Database name
  password: process.env.PG_PASSWORD, // Database password
  port: process.env.PG_PORT, // Database port
});
db.connect(); // Connect to the database

// Route handlers
app.get("/", (req, res) => {
  res.render("home.ejs"); // Render home page
});

app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render login page
});

app.get("/register", (req, res) => {
  res.render("register.ejs"); // Render registration page
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to home page after logout
  });
});

app.get("/secrets", (req, res) => {
  // Route to access secrets (authentication required)
  if (req.isAuthenticated()) {
    res.render("secrets.ejs"); // Render secrets page if authenticated
  } else {
    res.redirect("/login"); // Redirect to login page if not authenticated
  }
});

// Login route
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets", // Redirect to secrets page on successful login
    failureRedirect: "/login", // Redirect back to login page on failed login
  })
);

// Registration route
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login"); // Redirect to login page if user already exists
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          // Insert new user into database
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/secrets"); // Redirect to secrets page after successful registration and login
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Passport local authentication strategy
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            // Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              // Passed password check
              return cb(null, user);
            } else {
              // Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found"); // User not found in database
      }
    } catch (err) {
      console.log(err);
    }
  })
);

// Serialize and deserialize user for session management
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

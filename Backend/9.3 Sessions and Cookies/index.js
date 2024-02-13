import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

// Database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "ABCxyz786",
  port: 5432,
});
db.connect();

// Home page route
app.get("/", (req, res) => {
  res.render("home.ejs"); // Render home page
});

// Login page route
app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render login page
});

// Registration page route
app.get("/register", (req, res) => {
  res.render("register.ejs"); // Render registration page
});

// Logout route
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/"); // Redirect to home page after logout
  });
});

// Secrets page route
app.get("/secrets", (req, res) => {
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
      res.send("Email already exists."); // Send message if email already exists
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) {
              console.error("Error logging in user:", err);
            } else {
              console.log("success");
              res.redirect("/secrets"); // Redirect to secrets page after successful registration and login
            }
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
              // Failed password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb(null, false); // User not found
      }
    } catch (err) {
      console.log(err);
      return cb(err);
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

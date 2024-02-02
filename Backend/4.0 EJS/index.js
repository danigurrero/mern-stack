import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const date = new Date();
const port = 3000;

app.get("/", (req, res) => {
    const today = new Date("January 28, 2024 01:15:00");
    const day = today.getDay();

    let type = "a Weekday"
    let adv="it is time to work hard"

    if (day === 0 || day === 6) {
        type = "the Weekend"
        adv = "it is time to have fun"
    }
    
    res.render("index.ejs", {
        dayType: type,
        advice: adv
    });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

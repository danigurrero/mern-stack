// Arrays to store the game pattern, button colors, and user clicked pattern
var gamePattern = [];
var buttonColors = ["red", "blue", "green", "yellow"];
var userClickedPattern = [];

// Variables to track the current level, game start status, and incorrect sequence
var level = 0;
var started = false;

// Display initial message in the h1 element
$("h1").text("Press A Key to Start");

// Event listener for keypress to start the game
$(document).on("keypress", function() {
    if (!started) {
        nextSequence(); // Start the game by generating the next sequence
        started = true;
    }
});

// Event listener for button clicks
$(".btn").click(function() {
    var userChosenColour = $(this).attr("id");
    userClickedPattern.push(userChosenColour);

    playSound(userChosenColour);
    animatePress(userChosenColour);

    checkAnswer(userClickedPattern.length - 1); // Check user's answer after each click
});

// Function to generate the next sequence
function nextSequence() {
    level++;
    $("h1").text("Level " + level);

    var randomNumber = Math.floor(Math.random() * 4);
    var randomChosenColour = buttonColors[randomNumber];
    gamePattern.push(randomChosenColour);

    var selectedButton = $("#" + randomChosenColour);
    playSound(randomChosenColour);
    flashButton(selectedButton);
}

// Function to check if the user's answer is correct
function checkAnswer(currentLevel) {
    if (userClickedPattern[currentLevel] === gamePattern[currentLevel]) {
        if (userClickedPattern.length === gamePattern.length) {
            setTimeout(function() {
                nextSequence(); // Move to the next level after a correct sequence
            }, 1000);
            userClickedPattern = []; // Reset user's pattern for the next level
        }
    } else {
        playSound("wrong");
        $("body").addClass("game-over");
        setTimeout(function() {
            $("body").removeClass("game-over");
        }, 200);
        $("h1").text("Game Over, Press Any Key to Restart");
        startOver(); // Restart the game if the user gets the sequence wrong
    }
}

// Function to create a flash effect on buttons
function flashButton(button) {
    button.fadeIn(100).fadeOut(100).fadeIn(100);
}

// Function to play a sound based on the provided name
function playSound(name) {
    var audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
}

// Function to animate a button press effect
function animatePress(currentColour) {
    $("#" + currentColour).addClass("pressed");
    setTimeout(function() {
        $("#" + currentColour).removeClass("pressed");
    }, 100);
}

// Function to reset the game state
function startOver() {
    level = 0;
    gamePattern = [];
    userClickedPattern = []; // Clear user's clicked pattern
    started = false;
}

// Event listener for keypress to restart the game after losing
$(document).on("keypress", function(event) {
    if (!started && event.key.toLowerCase() === 'r') {
        $("h1").text("Press A Key to Start"); // Reset the initial message
        startOver();
    }
});

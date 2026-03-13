//config / api

const getWordle = "https://words.dev-apis.com/word-of-the-day";
const sendWordle = "https://words.dev-apis.com/validate-word";
const loadingDiv = document.querySelector(".loading");

//gamestate

let gameRow = 1; // keeps track of which row of the game we are currently typing in
let answerWordle = ""; // API endpoint to get the word of the day
let currentGuess = "";
let done = false;
let isLoading = false;
const winSound = new Audio("./win.mp3");
const loseSound = new Audio("./lose.mp3");

winSound.volume = 0.4;
loseSound.volume = 0.4;
//DOM

function getCurrentRow() {
  // returns the DOM element of the current row based on gameRow
  return document.querySelector(`.row[data-row="${gameRow}"]`); // finds the element with class "row" and matching data-row attribute
}

function getLetters() {
  // returns all letter boxes inside the current row
  return getCurrentRow().querySelectorAll(".letter"); // first get the row, then find all elements with class "letter"
}

//utility

function isLetter(letter) {
  // checks if a pressed key is a single alphabet letter
  return /^[a-zA-Z]$/.test(letter); // regex checks if the character is A-Z or a-z
}

function makeMap(array) {
  //split the string into an array and add value to the amount of letter
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    obj[letter] = obj[letter] ? obj[letter] + 1 : 1;
  }

  return obj;
}

//game logic

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function nextRow() {
  // moves the game to the next row
  gameRow++; // increment row counter
}

function addLetter(letter) {
  // adds a letter to the guess and updates the UI
  const letters = getLetters(); // get the letters for the current row
  if (currentGuess.length < letters.length) {
    // if the word isn't full yet //can be used incase of less or more letter for wordle

    currentGuess += letter; // add the letter to the guess string
  } else {
    currentGuess = currentGuess.slice(0, -1) + letter; // if full, replace the last letter with the new one
  }

  letters[currentGuess.length - 1].innerText = letter; // update the corresponding box in the row
}

function backspace() {
  // removes the last typed letter
  const letters = getLetters(); // get letters of current row

  if (currentGuess.length === 0) return; // if no letters typed, do nothing

  currentGuess = currentGuess.substring(0, currentGuess.length - 1); // remove the last character from the guess
  letters[currentGuess.length].innerText = ""; // clear the corresponding tile in the UI
}

//guess validation

async function commit() {
  const letters = getLetters();

  if (currentGuess.length !== letters.length) {
    return;
  }
  isLoading = true;
  setLoading(true);
  const res = await fetch(sendWordle, {
    method: "POST",
    body: JSON.stringify({ word: currentGuess }),
  });

  const resObj = await res.json();
  const validWord = resObj.validWord;
  //const { validWord } = resObj;

  isLoading = false;
  setLoading(false);
  if (!validWord) {
    markInvalidWord();
    return;
  }

  const guessParts = currentGuess.split("");
  const wordParts = answerWordle.split("");
  const map = makeMap(wordParts);

  // pass 1: correct
  for (let i = 0; i < letters.length; i++) {
    if (guessParts[i] === wordParts[i]) {
      letters[i].classList.add("correct");
      map[guessParts[i]]--;
    }
  }

  // pass 2: close / wrong
  for (let i = 0; i < letters.length; i++) {
    if (guessParts[i] === wordParts[i]) continue;

    if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
      letters[i].classList.add("close");
      map[guessParts[i]]--;
    } else {
      letters[i].classList.add("wrong");
    }
  }
  if (currentGuess === answerWordle) {
    showWinner(gameRow);
    document.querySelector(".title").classList.add("winner");
    getCurrentRow().classList.add("winner");
    winSound.play();
    done = true;
    return;
  }

  if (gameRow === 6) {
    showLoser(gameRow); //cant do cool stuff. need to keep the attempts so just add the z axis and a sad pic
    document.querySelector(".title").classList.add("loser");
    getCurrentRow().classList.add("loser");
    loseSound.play();
    done = true;
  }

  nextRow();
  currentGuess = "";
  function markInvalidWord() {
    // alert("not a valid word");
    for (let i = 0; i < letters.length; i++) {
      letters[i].classList.add("invalid");

      setTimeout(function () {
        letters[i].classList.remove("invalid");
      }, 40);
    }
  }
}
function showWinner() {
  const rows = document.querySelectorAll(".row");
  const title = document.querySelector(".title");

  rows.forEach((row) => {
    const rowNumber = Number(row.dataset.row);

    if (rowNumber != gameRow) {
      row.classList.add("fade-out");

      setTimeout(() => {
        row.remove();
      }, 600);
    }
  });

  animateTitle(title, "WINNER");
}

function showLoser() {
  const title = document.querySelector(".title");
  animateTitle(title, `You lose, the word was ${answerWordle}`);
}

function animateTitle(element, newText) {
  element.style.opacity = 0;

  setTimeout(() => {
    element.textContent = newText;
    element.style.opacity = 1;
  }, 500);
}

//INPUT

function handleKeyPress(event) {
  if (done || isLoading) {
    //do nothing
    return;
  }
  // listens for any key press
  const action = event.key; // which key was pressed
  switch (
    action // handle special keys using switch
  ) {
    case "Enter": // when Enter is pressed
      commit(); // submit guess
      break;
    case "Backspace": // when Backspace is pressed
      backspace(); // remove letter
      break;
    default: // any other key
      if (isLetter(action)) {
        addLetter(action.toUpperCase());
      }
  }
}

//init

async function init() {
  const res = await fetch(getWordle);
  const data = await res.json();
  setLoading(false);
  isLoading = false;
  answerWordle = data.word.toUpperCase();

  document.addEventListener("keydown", handleKeyPress);
}

init(); // start the game

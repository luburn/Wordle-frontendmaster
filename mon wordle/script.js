//config / api

const getWordle = "https://words.dev-apis.com/word-of-the-day";
const sendWordle = "https://words.dev-apis.com/validate-word";
const loadingDiv = document.querySelector(".loading");

//gamestate

let gameRow = 1;
let answerWordle = "";
let currentGuess = "";
let done = false;
let isLoading = false;
const winSound = new Audio("./win.mp3");
const loseSound = new Audio("./lose.mp3");

winSound.volume = 0.4;
loseSound.volume = 0.4;
//DOM

function getCurrentRow() {
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

  gameRow++;
}

function addLetter(letter) {
  
  const letters = getLetters(); 
  if (currentGuess.length < letters.length) {
    

    currentGuess += letter; 
  } else {
    currentGuess = currentGuess.slice(0, -1) + letter;
  }

  letters[currentGuess.length - 1].innerText = letter;
}

function backspace() {

  const letters = getLetters();

  if (currentGuess.length === 0) return;

  currentGuess = currentGuess.substring(0, currentGuess.length - 1); 
  letters[currentGuess.length].innerText = "";
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
  const { validWord } = resObj;

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
    showWinner();
    document.querySelector(".title").classList.add("winner");
    getCurrentRow().classList.add("winner");
    winSound.play();
    done = true;
    return;
  }

  if (gameRow === 6) {
    showLoser();
    document.querySelector(".title").classList.add("loser");
    loseSound.play();
    done = true;
  }

  nextRow();
  currentGuess = "";
  function markInvalidWord() {
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
    return;
  }

  const action = event.key;
  switch (
    action
  ) {
    case "Enter":
      commit();
      break;
    case "Backspace":
      backspace(); 
      break;
    default:
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

init();

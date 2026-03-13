let gameRow = 1; // keeps track of which row of the game we are currently typing in

function getCurrentRow() { // returns the DOM element of the current row based on gameRow
  return document.querySelector(`.row[data-row="${gameRow}"]`);    // finds the element with class "row" and matching data-row attribute
}

function getLetters() { // returns all letter boxes inside the current row
  return getCurrentRow().querySelectorAll(".letter");    // first get the row, then find all elements with class "letter"

}

const getWordle = "https://words.dev-apis.com/word-of-the-day";// API endpoint to get the word of the day
const sendWordle = "https://words.dev-apis.com/validate-word"; // API endpoint to validate if a guessed word exists

let answerWordle = ""; // API endpoint to get the word of the day
let guessWordle = ""; // will store the guessed word sent to validation


// function getAnswer()
//GET https://words.dev-apis.com/word-of-the-day = guessWordle

function nextRow() { // moves the game to the next row
  gameRow++; // increment row counter
} 

function isLetter(letter) { // checks if a pressed key is a single alphabet letter
  return /^[a-zA-Z]$/.test(letter); // regex checks if the character is A-Z or a-z
}

async function init() { // main game setup function
  let currentGuess = "";   // stores the current word the player is typing

   const res = await fetch(getWordle)
   const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split("");
  
  
  function addLetter(letter) {   // adds a letter to the guess and updates the UI
    const letters = getLetters(); // get the letters for the current row
    if (currentGuess.length < letters.length) { // if the word isn't full yet //can be used incase of less or more letter for wordle

      currentGuess += letter;  // add the letter to the guess string
    } else {
      currentGuess = currentGuess.slice(0, -1) + letter; // if full, replace the last letter with the new one
    }
  
    letters[currentGuess.length - 1].innerText = letter; // update the corresponding box in the row
  }

  async function commit() { // called when the player presses Enter
        const letters = getLetters(); // get current row letters

    if (currentGuess.length !== letters.length) { // if the word isn't the correct length, do nothing

      return;
    }

    // TODO validate the word

    // TODO do all the marking "correct"."wrong".

    // TODO did they win or lose?

    nextRow(); // move to the next row
    currentGuess = ""; // reset guess for next row
  }

  function backspace() { // removes the last typed letter
      const letters = getLetters(); // get letters of current row

  if (currentGuess.length === 0) return;  // if no letters typed, do nothing

    currentGuess = currentGuess.substring(0, currentGuess.length - 1); // remove the last character from the guess
        letters[currentGuess.length].innerText = ""; // clear the corresponding tile in the UI
  }


  document.addEventListener("keydown", function handleKeyPress(event) { // listens for any key press
    const action = event.key; // which key was pressed
        console.log(action); // debug: print key to console
    switch (action) { // handle special keys using switch
      case "Enter": // when Enter is pressed
        commit(); // submit guess
        break;
        case "Backspace": // when Backspace is pressed
        backspace(); // remove letter
        break;
        default: // any other key
          if (isLetter(action)) addLetter(action.toUpperCase()); // if the key is a letter  // convert it to uppercase and add it to the guess
    }
  });
}
init(); // start the game

// function isWord (
//check si le mot est valide avec l'api https://words.dev-apis.com/validate-word
//
//check if its letters
//check if theres enough letters
//prevent more letters and tell the user ONLY 5
//POST validWord:true if false message word not valid try again.
// );

// function guessWordle
// {
//lance la fonction isWord pour check
//puis check si c'est la Reponse function isAnswer
//empeche l'utilisateur de refaire les choix du meme row
//si echec total, apres le data-row 6 montre la reponse
//
// };

// function isAnswer {
//  //check si le mot est la reponse
//     if guessWordle == answerWordle
//si oui animation de victoire victoryScreen
//si non boiler plate check quel lettre est bonne, mauvaise et mal placé hint
//check pour les cas de mot ayant plusieur lettres genre wool et overt
// };

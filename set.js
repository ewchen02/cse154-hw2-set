"use strict";
(function() {

  // Required module globals
  let timerId;
  let remainingSeconds;

  // Attribute arrays
  const STYLES = ["solid", "outline", "striped"];
  const COLORS = ["green", "purple", "red"];
  const SHAPES = ["diamond", "oval", "squiggle"];
  const COUNTS = [1, 2, 3];

  // Commonly used literals
  const SET_SIZE = 3;
  const SECS_IN_MIN = 60;
  const EASY_CARD_COUNT = 9;
  const STANDARD_CARD_COUNT = 12;
  const SECOND_IN_MS = 1000;

  window.addEventListener("load", init);

  /**
   * Initializes the page with event listeners.
   */
  function init() {
    id("start-btn").addEventListener("click", toggleViews);
    id("back-btn").addEventListener("click", toggleViews);
    id("refresh-btn").addEventListener("click", refreshBoard);
  }

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attributes = [];
    for (let i = 0; i < selected.length; i++) {
      attributes.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attributes[0].length; i++) {
      let diff = attributes[0][i] !== attributes[1][i] &&
                attributes[1][i] !== attributes[2][i] &&
                attributes[0][i] !== attributes[2][i];
      let same = attributes[0][i] === attributes[1][i] &&
                    attributes[1][i] === attributes[2][i];
      if (!(same || diff)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Toggles the view between the menu and the game when the start/back button is clicked.
   */
  function toggleViews() {
    let menuView = id("menu-view");
    let gameView = id("game-view");
    if (menuView.classList.contains("hidden")) {
      menuView.classList.remove("hidden");
      gameView.classList.add("hidden");
      clearInterval(timerId);
      id("board").innerHTML = "";
    } else {
      menuView.classList.add("hidden");
      gameView.classList.remove("hidden");
      startGame(checkDifficulty(), true);
    }
  }

  /**
   * Creates the game board and starts the game timer.
   * @param {Boolean} isEasy - if the game is in "Easy" difficulty or not
   * @param {Boolean} resetTimer - if the timer should be reset to the initial time, should be
   * false if only refreshing the board
   */
  function startGame(isEasy, resetTimer) {
    let cardCount;
    if (isEasy) {
      cardCount = EASY_CARD_COUNT;
    } else {
      cardCount = STANDARD_CARD_COUNT;
    }
    for (let i = 0; i < cardCount; i++) {
      id("board").appendChild(generateUniqueCard(isEasy));
    }
    id("refresh-btn").disabled = false;
    if (resetTimer) {
      startTimer();
    }
  }

  /**
   * Randomly generates the style, color, shape, and count attributes of a card. The style is
   * always solid if the game is in "Easy" difficulty.
   * @param {Boolean} isEasy - if the game is in "Easy" difficulty or not
   * @returns {Array} an array of four attributes: style, color, shape, and count
   */
  function generateRandomAttributes(isEasy) {
    let attributes = [];
    if (isEasy) {
      attributes.push("solid");
    } else {
      attributes.push(STYLES[randomInt(0, 3)]); // is 3 a magic number?
    }
    attributes.push(SHAPES[randomInt(0, 3)]);
    attributes.push(COLORS[randomInt(0, 3)]);
    attributes.push(COUNTS[randomInt(0, 3)]);
    return attributes;
  }

  /**
   * Returns a random integer between min (inclusive) and max (exclusive).
   * @param {Number} min - the minimum number, inclusive
   * @param {Number} max - the maximum number, exclusive
   * @returns {Number} a random number in [min, max)
   */
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Generates a unique card of random attributes.
   * @param {Boolean} isEasy - if the game is in "Easy" difficulty or not
   * @returns {HTMLElement} a div element containing a number of imgs based on the generated
   * attributes
   */
  function generateUniqueCard(isEasy) {
    let card = document.createElement("div");
    let attributes = generateRandomAttributes(isEasy);
    let count = attributes[attributes.length - 1];
    let cardName = createCard(attributes);
    let divId = cardName + "-" + count;

    while (qsa("#" + divId).length !== 0) {
      attributes = generateRandomAttributes(isEasy);
      count = attributes[attributes.length - 1];
      cardName = createCard(attributes);
      divId = cardName + "-" + count;
    }
    card.id = divId;
    card.classList.add("card");

    // Append COUNT number of imgs to the card
    for (let i = 0; i < count; i++) {
      let cardImg = document.createElement("img");
      cardImg.src = "img/" + cardName + ".png";
      cardImg.alt = divId;
      card.appendChild(cardImg);
    }
    card.addEventListener("click", cardSelected);
    return card;
  }

  /**
   * Returns a string representation of the input attributes, separated by dashes. The generated
   * string does not include the count attribute.
   * @param {Array} attributes - an array of card attributes
   * @returns {String} a string representation of the card attributes, sans the count attribute
   */
  function createCard(attributes) {
    let cardName = ""; // Name of card image in /img folder
    for (let i = 0; i < attributes.length - 1; i++) {
      cardName += attributes[i] + "-";
    }

    // Trim the hanging dash
    return cardName.substring(0, cardName.length - 1);
  }

  /**
   * Starts the game timer based on the selected time in the menu.
   */
  function startTimer() {
    let timeOptions = qs("#menu-view select");
    remainingSeconds = timeOptions.options[timeOptions.selectedIndex].value;
    id("time").textContent = "0" + (remainingSeconds / SECS_IN_MIN) + ":00";
    remainingSeconds--;
    timerId = setInterval(advanceTimer, SECOND_IN_MS);
  }

  /**
   * Decrements the game timer by one second, and stops the timer and disables the game when time
   * is up.
   */
  function advanceTimer() {
    const singleDigits = 10;
    if (remainingSeconds > 0) {
      let minutes = Math.floor(remainingSeconds / SECS_IN_MIN);
      let seconds = remainingSeconds % SECS_IN_MIN;

      if (seconds < singleDigits) {
        id("time").textContent = "0" + minutes + ":0" + seconds;
      } else {
        id("time").textContent = "0" + minutes + ":" + seconds;
      }
      remainingSeconds--;
    } else {
      id("refresh-btn").disabled = true;
      id("time").textContent = "00:00";
      clearInterval(timerId);
      unselectCards();
      let cards = qsa(".card");
      for (let i = 0; i < cards.length; i++) {
        cards[i].removeEventListener("click", cardSelected);
      }
    }
  }

  /**
   * Defines game behavior for when a card is selected. If three cards are selected, either they
   * compose a set and are replaced, adding a point to "Sets Found", or do not compose a set.
   */
  function cardSelected() {
    toggleSelected(this);
    let selectedCards = qsa(".selected");
    if (selectedCards.length === SET_SIZE) {
      unselectCards();
      if (isASet(selectedCards)) {
        selectedSet(selectedCards);
      } else {

        // If cards are not in a set
        for (let i = 0; i < SET_SIZE; i++) {
          selectedCards[i].classList.add("hide-imgs");
          let cardText = document.createElement('p');
          cardText.textContent = "Not a Set";
          selectedCards[i].appendChild(cardText);
          setTimeout(() => {
            selectedCards[i].removeChild(cardText);
            selectedCards[i].classList.remove("hide-imgs");
          }, SECOND_IN_MS);
        }
      }
    }
  }

  /**
   * Behavior defined for a correctly selected set of cards. If the three cards are in a set, the
   * cards are replaced and the score is increased.
   * @param {Array} selectedCards - the selected cards
   */
  function selectedSet(selectedCards) {
    let newCards = [];
    for (let i = 0; i < SET_SIZE; i++) {
      let newCard = generateUniqueCard(checkDifficulty());
      id("board").replaceChild(newCard, selectedCards[i]);
      newCards.push(newCard);
    }
    let setCount = id("set-count").textContent;
    setCount++;
    id("set-count").textContent = setCount;
    for (let i = 0; i < SET_SIZE; i++) {
      newCards[i].classList.add("hide-imgs");
      let cardText = document.createElement('p');
      cardText.textContent = "SET!";
      newCards[i].appendChild(cardText);
      setTimeout(() => {
        newCards[i].removeChild(cardText);
        newCards[i].classList.remove("hide-imgs");
      }, SECOND_IN_MS);
    }
  }

  /**
   * Toggles a card's selected state between selected and unselected.
   * @param {HTMLElement} card - the div element representing the card
   */
  function toggleSelected(card) {
    if (card.classList.contains("selected")) {
      card.classList.remove("selected");
    } else {
      card.classList.add("selected");
    }
  }

  /**
   * Unselects all currently selected cards.
   */
  function unselectCards() {
    let selectedCards = qsa(".selected");
    for (let i = 0; i < selectedCards.length; i++) {
      selectedCards[i].classList.remove("selected");
    }
  }

  /**
   * Refreshes the board, removing existing cards and generating a new group of cards.
   */
  function refreshBoard() {
    id("board").innerHTML = ""; // removes all cards
    startGame(checkDifficulty(), false);
  }

  /**
   * Checks the difficulty of the current game.
   * @returns {Boolean} returns true if "Easy" difficulty, false if "Standard" difficulty
   */
  function checkDifficulty() {
    return qs("input:checked").value === "easy";
  }

  // Provided helper functions

  /**
   * Provided helper function. Retrieves the HTML element with the given ID.
   * @param {String} id - the input ID
   * @returns {HTMLElement} - the element matching the input ID
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Provided helper function. Retrieves the first HTML element matching the given CSS selector.
   * @param {String} selector - the input CSS selector
   * @returns {HTMLElement} - the first element matching the input CSS selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Provided helper function. Retrieves an array of all HTML elements matching the given CSS
   * selector.
   * @param {String} selector - the input CSS selector
   * @returns {Array} - the element(s) matching the input CSS selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }
})();
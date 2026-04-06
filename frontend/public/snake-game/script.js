/*



If you want to learn how this game was made, check out this video, that walks through the main ideas: 

YouTube: https://youtu.be/TAmYp4jKWoM
Skillshare: https://skl.sh/3nudJ1o

Follow me on twitter for more: https://twitter.com/HunorBorbely



*/

window.addEventListener("DOMContentLoaded", function (event) {
  window.focus(); // Capture keys right away (by default focus is on editor)

  function publish(eventName, payload = {}) {
    window.parent?.postMessage(
      {
        source: "snake-game",
        event: eventName,
        ...payload
      },
      "*"
    );
  }

  // Game data
  let snakePositions; // An array of snake positions, starting head first
  let applePosition; // The position of the apple

  let startTimestamp; // The starting timestamp of the animation
  let lastTimestamp; // The previous timestamp of the animation
  let stepsTaken; // How many steps did the snake take
  let score;
  let inputs; // A list of directions the snake still has to take in order

  let gameStarted = false;
  let hardMode = false;
  let gameFrozen = false;
  let animationFrameId = null;

  // Configuration
  const width = 15; // Grid width
  const height = 15; // Grid height

  const speed = 280; // Milliseconds it takes for the snake to take a step in the grid
  const color = "black"; // Primary color
  const snakeSprite = "/croc.png";
  const foodSprite = "/images/animals/candy.png";

  // Setup: Build up the grid
  // The grid consists of (width x height) tiles
  // The tiles take the the shape of a grid using CSS grid
  // The tile can represent a part of the snake or an apple
  // Each tile has a content div that takes an absolute position
  // The content can fill the tile or slide in or out from any direction to take the shape of a transitioning snake head or tail
  const grid = document.querySelector(".grid");
  for (let i = 0; i < width * height; i++) {
    const content = document.createElement("div");
    content.setAttribute("class", "content");
    content.setAttribute("id", i); // Just for debugging, not used

    const tile = document.createElement("div");
    tile.setAttribute("class", "tile");
    tile.appendChild(content);

    grid.appendChild(tile);
  }

  const tiles = document.querySelectorAll(".grid .tile .content");

  const containerElement = document.querySelector(".container");
  const noteElement = document.querySelector("footer");
  const contrastElement = document.querySelector(".contrast");
  const scoreElement = document.querySelector(".score");
  const controlButtons = document.querySelectorAll("[data-direction]");
  const startTargets = [containerElement, grid, document.body];

  function getSnakeStyles(overrides = {}) {
    return {
      "background-color": "transparent",
      "background-image": `url("${snakeSprite}")`,
      "background-size": "cover",
      "background-position": "center",
      "background-repeat": "no-repeat",
      ...overrides
    };
  }

  function getFoodStyles(overrides = {}) {
    return {
      "background-color": "transparent",
      "background-image": `url("${foodSprite}")`,
      "background-size": "contain",
      "background-position": "center",
      "background-repeat": "no-repeat",
      ...overrides
    };
  }

  // Initialize layout
  resetGame();

  startTargets.forEach((target) => {
    target.addEventListener("pointerdown", function () {
      window.focus();
      if (!gameStarted) startGame();
    });
  });

  controlButtons.forEach((button) => {
    button.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      if (gameFrozen) return;
      const direction = event.currentTarget.getAttribute("data-direction");
      handleDirection(direction);
    });
  });

  function handleDirection(direction) {
    if (gameFrozen) return;
    if (!["left", "up", "right", "down"].includes(direction)) return;

    if (
      direction == "left" &&
      inputs[inputs.length - 1] != "left" &&
      headDirection() != "right"
    ) {
      inputs.push("left");
      if (!gameStarted) startGame();
      return;
    }
    if (
      direction == "up" &&
      inputs[inputs.length - 1] != "up" &&
      headDirection() != "down"
    ) {
      inputs.push("up");
      if (!gameStarted) startGame();
      return;
    }
    if (
      direction == "right" &&
      inputs[inputs.length - 1] != "right" &&
      headDirection() != "left"
    ) {
      inputs.push("right");
      if (!gameStarted) startGame();
      return;
    }
    if (
      direction == "down" &&
      inputs[inputs.length - 1] != "down" &&
      headDirection() != "up"
    ) {
      inputs.push("down");
      if (!gameStarted) startGame();
    }
  }

  // Resets game variables and layouts but does not start the game (game starts on keypress)
  function resetGame() {
    gameFrozen = false;
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    // Reset positions
    snakePositions = [168, 169, 170, 171];
    applePosition = 100; // Initially the apple is always at the same position to make sure it's reachable

    // Reset game progress
    startTimestamp = undefined;
    lastTimestamp = undefined;
    stepsTaken = -1; // It's -1 because then the snake will start with a step
    score = 0;
    // Reset inputs
    inputs = [];

    // Reset header
    contrastElement.innerText = "100%";
    scoreElement.innerText = hardMode ? `H ${score}` : score;
    publish("reset", { score, hardMode });

    // Reset tiles
    for (const tile of tiles) setTile(tile);

    // Render apple
    setTile(tiles[applePosition], getFoodStyles());

    // Render snake
    // Ignore the last part (the snake just moved out from it)
    for (const i of snakePositions.slice(1)) {
      const snakePart = tiles[i];
      snakePart.style.backgroundColor = "transparent";
      snakePart.style.backgroundImage = `url("${snakeSprite}")`;
      snakePart.style.backgroundSize = "cover";
      snakePart.style.backgroundPosition = "center";
      snakePart.style.backgroundRepeat = "no-repeat";

      // Set up transition directions for head and tail
      if (i == snakePositions[snakePositions.length - 1])
        snakePart.style.left = 0;
      if (i == snakePositions[0]) snakePart.style.right = 0;
    }
  }

  // Handle user inputs (e.g. start the game)
  window.addEventListener("keydown", function (event) {
    if (gameFrozen && event.key !== " " && event.key !== "H" && event.key !== "h" && event.key !== "E" && event.key !== "e") {
      return;
    }
    // If not an arrow key or space or H was pressed then return
    if (
      ![
        "ArrowLeft",
        "ArrowUp",
        "ArrowRight",
        "ArrowDown",
        " ",
        "H",
        "h",
        "E",
        "e"
      ].includes(event.key)
    )
      return;

    // If an arrow key was pressed then first prevent default
    event.preventDefault();

    // If space was pressed restart the game
    if (event.key == " ") {
      resetGame();
      startGame();
      return;
    }

    // Set Hard mode
    if (event.key == "H" || event.key == "h") {
      hardMode = true;
      noteElement.innerHTML = `Hard mode. Tap the game screen to start!`;
      noteElement.style.opacity = 1;
      resetGame();
      return;
    }

    // Set Easy mode
    if (event.key == "E" || event.key == "e") {
      hardMode = false;
      noteElement.innerHTML = `Easy mode. Tap the game screen to start!`;
      noteElement.style.opacity = 1;
      resetGame();
      return;
    }

    // If an arrow key was pressed add the direction to the next moves
    // Do not allow to add the same direction twice consecutively
    // The snake can't do a full turn either
    // Also start the game if it hasn't started yet
    if (event.key == "ArrowLeft") {
      handleDirection("left");
      return;
    }
    if (event.key == "ArrowUp") {
      handleDirection("up");
      return;
    }
    if (event.key == "ArrowRight") {
      handleDirection("right");
      return;
    }
    if (event.key == "ArrowDown") {
      handleDirection("down");
      return;
    }
  });

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (!data || data.type !== "snake-control") return;

    if (data.action === "freeze") {
      gameFrozen = true;
      gameStarted = false;
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  });

  // Start the game
  function startGame() {
    if (gameFrozen) return;
    gameStarted = true;
    noteElement.style.opacity = 0;
    publish("start", { score, hardMode });
    animationFrameId = window.requestAnimationFrame(main);
  }

  // The main game loop
  // This function gets invoked approximately 60 times per second to render the game
  // It keeps track of the total elapsed time and time elapsed since last call
  // Based on that animates the snake either by transitioning it in between tiles or stepping it to the next tile
  function main(timestamp) {
    if (gameFrozen) {
      animationFrameId = null;
      return;
    }
    try {
      if (startTimestamp === undefined) startTimestamp = timestamp;
      const totalElapsedTime = timestamp - startTimestamp;
      const timeElapsedSinceLastCall = timestamp - lastTimestamp;

      const stepsShouldHaveTaken = Math.floor(totalElapsedTime / speed);
      const percentageOfStep = (totalElapsedTime % speed) / speed;

      // If the snake took a step from a tile to another one
      if (stepsTaken != stepsShouldHaveTaken) {
        stepAndTransition(percentageOfStep);

        // If it’s time to take a step
        const headPosition = snakePositions[snakePositions.length - 1];
        if (headPosition == applePosition) {
          // Increase score
          score++;
          scoreElement.innerText = hardMode ? `H ${score}` : score;
          publish("score", { score, hardMode });

          // Generate another apple
          addNewApple();

        }

        stepsTaken++;
      } else {
        transition(percentageOfStep);
      }
      contrastElement.innerText = "100%";
      containerElement.style.opacity = 1;

      animationFrameId = window.requestAnimationFrame(main);
    } catch (error) {
      // Write a note about restarting game and setting difficulty
      const pressSpaceToStart = "Press space to reset the game.";
      const changeMode = hardMode
        ? "Back to easy mode? Press the letter E."
        : "Ready for hard more? Press the letter H.";
      noteElement.innerHTML = `${error.message}. ${pressSpaceToStart} <div>${changeMode}</div>`;
      noteElement.style.opacity = 1;
      containerElement.style.opacity = 1;
      gameStarted = false;
      animationFrameId = null;
      publish("gameover", { score, hardMode, message: error.message });
    }

    lastTimestamp = timestamp;
  }

  // Moves the snake and sets up tiles for the transition function so the transition function will be more effective (the transition function gets called more frequently)
  function stepAndTransition(percentageOfStep) {
    // Calculate the next position and add it to the snake
    const newHeadPosition = getNextPosition();
    console.log(`Snake stepping into tile ${newHeadPosition}`);
    snakePositions.push(newHeadPosition);

    // Start with tail instead of head
    // Because the head might step into the previous position of the tail

    // Clear tile, yet keep it in the array if the snake grows.
    // Whenever the snake steps into a new tile, it will leave the last one.
    // Yet the last tile stays in the array if the snake just grows.
    // As a sideeffect in case the snake just eats an apple,
    // the tail transitioning will happen on a this "hidden" tile
    // (so the tail appears as stationary).
    const previousTail = tiles[snakePositions[0]];
    setTile(previousTail);

    if (newHeadPosition != applePosition) {
      // Drop the previous tail
      snakePositions.shift();

      // Set up and start transition for new tail
      // Make sure it heads to the right direction and set initial size
      const tail = tiles[snakePositions[0]];
      const tailDi = tailDirection();
      // The tail value is inverse because it slides out not in
      const tailValue = `${100 - percentageOfStep * 100}%`;

      if (tailDi == "right")
        setTile(tail, getSnakeStyles({
          left: 0,
          width: tailValue
        }));

      if (tailDi == "left")
        setTile(tail, getSnakeStyles({
          right: 0,
          width: tailValue
        }));

      if (tailDi == "down")
        setTile(tail, getSnakeStyles({
          top: 0,
          height: tailValue
        }));

      if (tailDi == "up")
        setTile(tail, getSnakeStyles({
          bottom: 0,
          height: tailValue
        }));
    }

    // Set previous head to full size
    const previousHead = tiles[snakePositions[snakePositions.length - 2]];
    setTile(previousHead, getSnakeStyles());

    // Set up and start transitioning for new head
    // Make sure it heads to the right direction and set initial size
    const head = tiles[newHeadPosition];
    const headDi = headDirection();
    const headValue = `${percentageOfStep * 100}%`;

    if (headDi == "right")
      setTile(head, getSnakeStyles({
        left: 0, // Slide in from left
        width: headValue,
        "border-radius": 0
      }));

    if (headDi == "left")
      setTile(head, getSnakeStyles({
        right: 0, // Slide in from right
        width: headValue,
        "border-radius": 0
      }));

    if (headDi == "down")
      setTile(head, getSnakeStyles({
        top: 0, // Slide in from top
        height: headValue,
        "border-radius": 0
      }));

    if (headDi == "up")
      setTile(head, getSnakeStyles({
        bottom: 0, // Slide in from bottom
        height: headValue,
        "border-radius": 0
      }));
  }

  // Transition head and tail between two steps
  // Called with every animation frame, except when stepping to a new tile
  function transition(percentageOfStep) {
    // Transition head
    const head = tiles[snakePositions[snakePositions.length - 1]];
    const headDi = headDirection();
    const headValue = `${percentageOfStep * 100}%`;
    if (headDi == "right" || headDi == "left") head.style.width = headValue;
    if (headDi == "down" || headDi == "up") head.style.height = headValue;

    // Transition tail
    const tail = tiles[snakePositions[0]];
    const tailDi = tailDirection();
    const tailValue = `${100 - percentageOfStep * 100}%`;
    if (tailDi == "right" || tailDi == "left") tail.style.width = tailValue;
    if (tailDi == "down" || tailDi == "up") tail.style.height = tailValue;
  }

  // Calculate to which tile will the snake step into
  // Throw error if the snake bites its tail or hits the wall
  function getNextPosition() {
    const headPosition = snakePositions[snakePositions.length - 1];
    const snakeDirection = inputs.shift() || headDirection();
    switch (snakeDirection) {
      case "right": {
        const nextPosition = headPosition + 1;
        if (nextPosition % width == 0) throw Error("The snake hit the wall");
        // Ignore the last snake part, it'll move out as the head moves in
        if (snakePositions.slice(1).includes(nextPosition))
          throw Error("The snake bit itself");
        return nextPosition;
      }
      case "left": {
        const nextPosition = headPosition - 1;
        if (nextPosition % width == width - 1 || nextPosition < 0)
          throw Error("The snake hit the wall");
        // Ignore the last snake part, it'll move out as the head moves in
        if (snakePositions.slice(1).includes(nextPosition))
          throw Error("The snake bit itself");
        return nextPosition;
      }
      case "down": {
        const nextPosition = headPosition + width;
        if (nextPosition > width * height - 1)
          throw Error("The snake hit the wall");
        // Ignore the last snake part, it'll move out as the head moves in
        if (snakePositions.slice(1).includes(nextPosition))
          throw Error("The snake bit itself");
        return nextPosition;
      }
      case "up": {
        const nextPosition = headPosition - width;
        if (nextPosition < 0) throw Error("The snake hit the wall");
        // Ignore the last snake part, it'll move out as the head moves in
        if (snakePositions.slice(1).includes(nextPosition))
          throw Error("The snake bit itself");
        return nextPosition;
      }
    }
  }

  // Calculate in which direction the snake's head is moving
  function headDirection() {
    const head = snakePositions[snakePositions.length - 1];
    const neck = snakePositions[snakePositions.length - 2];
    return getDirection(head, neck);
  }

  // Calculate in which direction of the snake's tail
  function tailDirection() {
    const tail1 = snakePositions[0];
    const tail2 = snakePositions[1];
    return getDirection(tail1, tail2);
  }

  function getDirection(first, second) {
    if (first - 1 == second) return "right";
    if (first + 1 == second) return "left";
    if (first - width == second) return "down";
    if (first + width == second) return "up";
    throw Error("the two tile are not connected");
  }

  // Generates a new apple on the field
  function addNewApple() {
    // Find a position for the new apple that is not yet taken by the snake
    let newPosition;
    do {
      newPosition = Math.floor(Math.random() * width * height);
    } while (snakePositions.includes(newPosition));

    // Set new apple
    setTile(tiles[newPosition], getFoodStyles());

    // Note that the apple is here
    applePosition = newPosition;
  }

  // Resets size and position related CSS properties
  function setTile(element, overrides = {}) {
    const defaults = {
      width: "100%",
      height: "100%",
      top: "auto",
      right: "auto",
      bottom: "auto",
      left: "auto",
      "background-color": "transparent",
      "background-image": "none",
      "background-size": "auto",
      "background-position": "center",
      "background-repeat": "no-repeat",
      "border-radius": 0
    };
    const cssProperties = { ...defaults, ...overrides };
    element.style.cssText = Object.entries(cssProperties)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");
  }
});

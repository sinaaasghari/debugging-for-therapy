document.addEventListener('DOMContentLoaded', () => {
  // Connect to socket.io
  const socket = io();
  
  // Game state variables
  let currentLanguage = 'en';
  let gameId = null;
  let playerId = null;
  let playerName = '';
  let isGameCreator = false;
  let gameState = null;
  let timerInterval = null;
  let maxSpies = 1;
  
  // DOM Elements
  const screens = {
    languageSelection: document.getElementById('language-selection'),
    gameSetup: document.getElementById('game-setup'),
    lobby: document.getElementById('lobby'),
    gamePlay: document.getElementById('game-play'),
    gameEnd: document.getElementById('game-end')
  };

  // Text Resources
  const textResources = {
    en: {
      welcomeTitle: "Welcome to Spy Game",
      setupTitle: "Game Setup",
      nameLabel: "Your Name:",
      createGame: "Create New Game",
      joinGame: "Join Game",
      gameIdPlaceholder: "Game ID",
      lobbyTitle: "Game Lobby",
      gameIdLabel: "Game ID",
      playersTitle: "Players",
      startGame: "Start Game",
      endTurn: "End My Turn",
      accuseButton: "Accuse Someone",
      voteYes: "YES",
      voteNo: "NO",
      votingTitle: "Voting",
      gameOver: "Game Over",
      playAgain: "Play Again",
      yourRole: "Your Role: ",
      location: "Location: ",
      spy: "You are the Spy! Try to guess the location.",
      player: "You are a Player at location:",
      currentTurn: "'s turn to ask a question",
      guessPrompt: "Guess the location:",
      makeGuess: "Make Guess",
      timeRemaining: "Time Remaining",
      gameStatus: "Game Status",
      spiesCount: "Number of Spies:",
      copyGameId: "Copy Game ID",
      spiesRevealed: "The spies were:",
      locationWas: "The location was:"
    },
    fa: {
      welcomeTitle: "به بازی جاسوس خوش آمدید",
      setupTitle: "تنظیمات بازی",
      nameLabel: "نام شما:",
      createGame: "ایجاد بازی جدید",
      joinGame: "پیوستن به بازی",
      gameIdPlaceholder: "شناسه بازی",
      lobbyTitle: "لابی بازی",
      gameIdLabel: "شناسه بازی",
      playersTitle: "بازیکنان",
      startGame: "شروع بازی",
      endTurn: "پایان نوبت من",
      accuseButton: "متهم کردن شخصی",
      voteYes: "بله",
      voteNo: "خیر",
      votingTitle: "رأی گیری",
      gameOver: "پایان بازی",
      playAgain: "بازی مجدد",
      yourRole: "نقش شما: ",
      location: "مکان: ",
      spy: "شما جاسوس هستید! سعی کنید مکان را حدس بزنید.",
      player: "شما بازیکن در مکان هستید:",
      currentTurn: " نوبت سوال پرسیدن است",
      guessPrompt: "حدس مکان:",
      makeGuess: "حدس بزن",
      timeRemaining: "زمان باقی مانده",
      gameStatus: "وضعیت بازی",
      spiesCount: "تعداد جاسوسان:",
      copyGameId: "کپی شناسه بازی",
      spiesRevealed: "جاسوسان:",
      locationWas: "مکان بازی:"
    }
  };

  // Initialize event listeners
  initEventListeners();
  
  // Socket event listeners
  setupSocketListeners();

  function initEventListeners() {
    // Language Selection
    document.getElementById('english-btn').addEventListener('click', () => selectLanguage('en'));
    document.getElementById('persian-btn').addEventListener('click', () => selectLanguage('fa'));
    
    // Game Setup
    document.getElementById('create-game-btn').addEventListener('click', createGame);
    document.getElementById('join-game-btn').addEventListener('click', joinGame);
    
    // Lobby
    document.getElementById('start-game-btn').addEventListener('click', startGame);
    document.getElementById('copy-id-btn').addEventListener('click', copyGameId);
    document.getElementById('increase-spies').addEventListener('click', increaseSpies);
    document.getElementById('decrease-spies').addEventListener('click', decreaseSpies);
    
    // Game Play
    document.getElementById('next-turn-btn').addEventListener('click', nextTurn);
    document.getElementById('accuse-btn').addEventListener('click', showAccusationOptions);
    document.getElementById('make-guess-btn').addEventListener('click', makeLocationGuess);
    document.getElementById('vote-yes').addEventListener('click', () => castVote(true));
    document.getElementById('vote-no').addEventListener('click', () => castVote(false));
    
    // Game End
    document.getElementById('new-game-btn').addEventListener('click', resetToSetup);
  }

  function setupSocketListeners() {
    socket.on('gameCreated', handleGameCreated);
    socket.on('gameJoined', handleGameJoined);
    socket.on('gameStateUpdate', handleGameStateUpdate);
    socket.on('gameInfo', handleGameInfo);
    socket.on('numSpiesUpdated', handleNumSpiesUpdated);
    socket.on('error', handleError);
  }

  function selectLanguage(language) {
    currentLanguage = language;
    document.body.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
    updateUITexts();
    showScreen('gameSetup', 'animate__fadeIn');
  }

  function updateUITexts() {
    const texts = textResources[currentLanguage];
    
    // Update all text elements according to selected language
    document.getElementById('setup-title').textContent = texts.setupTitle;
    document.getElementById('name-label').textContent = texts.nameLabel;
    document.getElementById('create-game-btn').textContent = texts.createGame;
    document.getElementById('join-game-btn').textContent = texts.joinGame;
    document.getElementById('game-id-input').placeholder = texts.gameIdPlaceholder;
    document.getElementById('lobby-title').textContent = texts.lobbyTitle;
    document.getElementById('game-id-label').textContent = texts.gameIdLabel;
    document.getElementById('players-title').textContent = texts.playersTitle;
    document.getElementById('spies-label').textContent = texts.spiesCount;
    document.getElementById('start-game-btn').textContent = texts.startGame;
    document.getElementById('next-turn-btn').textContent = texts.endTurn;
    document.getElementById('accuse-btn').textContent = texts.accuseButton;
    document.getElementById('vote-yes').textContent = texts.voteYes;
    document.getElementById('vote-no').textContent = texts.voteNo;
    document.getElementById('voting-title').textContent = texts.votingTitle;
    document.getElementById('end-title').textContent = texts.gameOver;
    document.getElementById('new-game-btn').textContent = texts.playAgain;
    document.getElementById('guess-prompt').textContent = texts.guessPrompt;
    document.getElementById('make-guess-btn').textContent = texts.makeGuess;
    document.getElementById('timer-label').textContent = texts.timeRemaining;
    document.getElementById('game-status').textContent = texts.gameStatus;
  }

  function createGame() {
    playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
      alert(currentLanguage === 'en' ? 'Please enter your name' : 'لطفا نام خود را وارد کنید');
      return;
    }
    
    socket.emit('createGame', { language: currentLanguage, playerName });
    isGameCreator = true;
  }

  function joinGame() {
    playerName = document.getElementById('player-name').value.trim();
    const gameIdInput = document.getElementById('game-id-input').value.trim();
    
    if (!playerName) {
      alert(currentLanguage === 'en' ? 'Please enter your name' : 'لطفا نام خود را وارد کنید');
      return;
    }
    
    if (!gameIdInput) {
      alert(currentLanguage === 'en' ? 'Please enter a game ID' : 'لطفا شناسه بازی را وارد کنید');
      return;
    }
    
    socket.emit('joinGame', { gameId: gameIdInput, playerName });
  }

  function startGame() {
    socket.emit('startGame');
  }

  function nextTurn() {
    socket.emit('nextTurn');
  }

  function copyGameId() {
    const gameIdText = document.getElementById('game-id').textContent;
    navigator.clipboard.writeText(gameIdText).then(() => {
      const copyBtn = document.getElementById('copy-id-btn');
      copyBtn.textContent = '✓';
      setTimeout(() => {
        copyBtn.textContent = '📋';
      }, 1500);
    });
  }

  function increaseSpies() {
    const numSpiesInput = document.getElementById('num-spies');
    const currentValue = parseInt(numSpiesInput.value);
    if (currentValue < maxSpies) {
      const newValue = currentValue + 1;
      numSpiesInput.value = newValue;
      socket.emit('setNumSpies', { numSpies: newValue });
    }
  }

  function decreaseSpies() {
    const numSpiesInput = document.getElementById('num-spies');
    const currentValue = parseInt(numSpiesInput.value);
    if (currentValue > 1) {
      const newValue = currentValue - 1;
      numSpiesInput.value = newValue;
      socket.emit('setNumSpies', { numSpies: newValue });
    }
  }

  function showAccusationOptions() {
    if (!gameState || gameState.status !== 'playing') return;
    
    const gamePlayersList = document.getElementById('game-players');
    const players = gamePlayersList.querySelectorAll('li');
    
    // First, remove any existing accusation handlers
    players.forEach(playerEl => {
      const clone = playerEl.cloneNode(true);
      playerEl.parentNode.replaceChild(clone, playerEl);
    });
    
    // Then add new click handlers
    const newPlayers = gamePlayersList.querySelectorAll('li');
    newPlayers.forEach(playerEl => {
      playerEl.classList.add('accusable');
      playerEl.addEventListener('click', () => {
        const accusedId = playerEl.dataset.playerId;
        socket.emit('accusePlayer', { accusedId });
        newPlayers.forEach(p => p.classList.remove('accusable'));
      });
    });
    
    alert(currentLanguage === 'en' ? 'Click on a player to accuse them' : 'برای متهم کردن روی یک بازیکن کلیک کنید');
  }

  function makeLocationGuess() {
    const locationSelect = document.getElementById('location-guess');
    const locationGuess = locationSelect.value;
    
    socket.emit('guessLocation', { locationGuess });
  }

  function castVote(vote) {
    socket.emit('castVote', { vote });
  }

  function resetToSetup() {
    showScreen('gameSetup', 'animate__fadeIn');
  }

  function startTimer(timeRemaining) {
    // Clear any existing timer
    clearInterval(timerInterval);
    
    const totalTime = 8 * 60; // 8 minutes in seconds
    const timerEl = document.getElementById('timer');
    const progressEl = document.getElementById('timer-progress');
    
    // Update timer on first call
    updateTimerDisplay(timeRemaining);
    
    timerInterval = setInterval(() => {
      timeRemaining--;
      
      if (timeRemaining <= 0) {
        clearInterval(timerInterval);
      }
      
      updateTimerDisplay(timeRemaining);
    }, 1000);
    
    function updateTimerDisplay(seconds) {
      timerEl.textContent = formatTime(seconds);
      
      // Update progress bar
      const percentLeft = (seconds / totalTime) * 100;
      progressEl.style.width = `${percentLeft}%`;
      
      // Change color when time is running out
      if (percentLeft < 25) {
        progressEl.style.backgroundColor = '#f44336'; // Red
      } else if (percentLeft < 50) {
        progressEl.style.backgroundColor = '#ff9800'; // Orange
      } else {
        progressEl.style.backgroundColor = '#4caf50'; // Green
      }
    }
  }

  // Socket event handlers
  function handleGameCreated(data) {
    gameId = data.gameId;
    playerId = data.playerId;
    
    document.getElementById('game-id').textContent = gameId;
    updateLobbyPlayers([{ id: playerId, name: playerName }]);
    showScreen('lobby', 'animate__fadeIn');
  }

  function handleGameJoined(data) {
    gameId = data.gameId;
    playerId = data.playerId;
    showScreen('lobby', 'animate__fadeIn');
  }

  function handleNumSpiesUpdated(data) {
    document.getElementById('num-spies').value = data.numSpies;
  }

  function handleGameStateUpdate(state) {
    gameState = state;
    
    // Update game UI based on game state
    if (state.status === 'playing') {
      showScreen('gamePlay', 'animate__fadeIn');
      updateGamePlayUI(state);
      startTimer(state.timeRemaining);
    } else if (state.status === 'voting') {
      showScreen('gamePlay', 'animate__fadeIn');
      showVotingSection(state);
    } else if (state.status === 'finished') {
      clearInterval(timerInterval);
      showGameResult(state);
    }
  }

  function handleGameInfo(info) {
    if (info.status === 'waiting') {
      updateLobbyPlayers(info.players);
      document.getElementById('start-game-btn').disabled = !isGameCreator;
      
      // Calculate max spies based on player count
      maxSpies = Math.floor(info.players.length / 3);
      maxSpies = Math.max(1, Math.min(3, maxSpies));
      
      // Update spin buttons state
      document.getElementById('increase-spies').disabled = parseInt(document.getElementById('num-spies').value) >= maxSpies;
      document.getElementById('decrease-spies').disabled = parseInt(document.getElementById('num-spies').value) <= 1;
    }
  }

  function handleError(error) {
    alert(error.message);
  }

  function updateLobbyPlayers(players) {
    const playersList = document.getElementById('players');
    playersList.innerHTML = '';
    
    players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = player.name;
      if (player.id === playerId) {
        li.textContent += currentLanguage === 'en' ? ' (You)' : ' (شما)';
        li.style.fontWeight = 'bold';
      }
      playersList.appendChild(li);
    });
  }

  function updateGamePlayUI(state) {
    const texts = textResources[currentLanguage];
    
    // Hide voting section if visible
    document.getElementById('voting-section').classList.add('hidden');
    
    // Update role and location
    const roleText = document.getElementById('your-role');
    const locationText = document.getElementById('location');
    const roleIcon = document.getElementById('role-icon');
    
    if (state.playerRole === 'spy') {
      roleText.textContent = texts.yourRole + texts.spy;
      locationText.textContent = '';
      document.getElementById('spy-controls').classList.remove('hidden');
      roleIcon.textContent = '🕵️';
      
      // Populate location dropdown
      const locationSelect = document.getElementById('location-guess');
      locationSelect.innerHTML = '';
      
      state.possibleLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
      });
    } else {
      roleText.textContent = texts.yourRole + texts.player;
      locationText.textContent = texts.location + state.location;
      document.getElementById('spy-controls').classList.add('hidden');
      roleIcon.textContent = '🧑‍🤝‍🧑';
    }
    
    // Update turn indicator
    const currentPlayerName = state.players.find(p => p.id === state.currentPlayer)?.name;
    const turnIndicator = document.getElementById('turn-indicator');
    turnIndicator.textContent = currentPlayerName + texts.currentTurn;
    
    if (state.currentPlayer === playerId) {
      turnIndicator.classList.add('pulse');
    } else {
      turnIndicator.classList.remove('pulse');
    }
    
    // Enable/disable buttons based on whose turn it is
    const isMyTurn = state.currentPlayer === playerId;
    document.getElementById('next-turn-btn').disabled = !isMyTurn;
    
    // Update players list
    const gamePlayersList = document.getElementById('game-players');
    gamePlayersList.innerHTML = '';
    
    state.players.forEach(player => {
      const li = document.createElement('li');
      li.textContent = player.name;
      li.dataset.playerId = player.id;
      if (player.id === playerId) {
        li.textContent += currentLanguage === 'en' ? ' (You)' : ' (شما)';
        li.style.fontWeight = 'bold';
      }
      gamePlayersList.appendChild(li);
    });
    
    // Update game state info
    document.getElementById('game-status').textContent = state.status === 'playing' ? 
      (currentLanguage === 'en' ? 'Game in Progress' : 'بازی در جریان است') :
      state.status;
  }

  function showVotingSection(state) {
    const votingSection = document.getElementById('voting-section');
    votingSection.classList.remove('hidden');
    
    // In a real implementation, you would need to get more information from the backend
    // about the accusation details
    const accusationText = document.getElementById('accusation-text');
    
    // This is placeholder - in real app, you'd get this info from state
    accusationText.textContent = currentLanguage === 'en' ? 
      'A player has been accused of being the spy. Vote now!' :
      'یک بازیکن متهم به جاسوس بودن شده است. رأی دهید!';
  }

  function showGameResult(state) {
    showScreen('gameEnd', 'animate__fadeInUp');
    
    const resultDiv = document.getElementById('result');
    const spiesReveal = document.getElementById('spies-reveal');
    const locationReveal = document.getElementById('location-reveal');
    const texts = textResources[currentLanguage];
    
    resultDiv.innerHTML = '';
    spiesReveal.innerHTML = '';
    
    if (state.result === 'spy_caught') {
      resultDiv.textContent = currentLanguage === 'en' ? 
        'The spy was caught! Players win!' :
        'جاسوس گرفتار شد! بازیکنان برنده شدند!';
      resultDiv.className = 'result-box spy-caught';
    } else if (state.result === 'spy_wins') {
      resultDiv.textContent = currentLanguage === 'en' ? 
        'The spy has won!' :
        'جاسوس برنده شد!';
      resultDiv.className = 'result-box spy-wins';
    }
    
    // Add spies reveal
    const spyTitle = document.createElement('h3');
    spyTitle.textContent = texts.spiesRevealed;
    spiesReveal.appendChild(spyTitle);
    
    // This assumes you have spy names in state
    // In a real implementation, you would get this from state
    const spyList = document.createElement('p');
    spyList.textContent = state.spyNames ? state.spyNames.join(', ') : 'Unknown';
    spiesReveal.appendChild(spyList);
    
    // Add location reveal
    locationReveal.textContent = texts.locationWas + ' ' + state.location;
  }

  function showScreen(screenId, animationClass) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
      screen.classList.add('hidden');
      screen.classList.remove('animate__fadeIn', 'animate__fadeInUp');
    });
    
    // Show selected screen with animation
    screens[screenId].classList.remove('hidden');
    if (animationClass) {
      screens[screenId].classList.add(animationClass);
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
});

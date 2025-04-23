// spy-game-backend.js

/**
 * Language configuration
 */
const LANGUAGES = {
    ENGLISH: 'en',
    PERSIAN: 'fa'
  };
  
  /**
   * Text resources for multilingual support
   */
  const textResources = {
    [LANGUAGES.ENGLISH]: {
      gameName: "Spy Game",
      spy: "Spy",
      location: "Location",
      startGame: "Game started!",
      askQuestion: "It's your turn to ask a question",
      accusation: "has accused",
      spyGuess: "The spy is trying to guess the location",
      spyWin: "The spy has won!",
      playersWin: "The players have won!",
      voteResults: "Vote results",
      timeRemaining: "Time remaining",
      gameEnded: "Game has ended",
      invalidAction: "Invalid action",
      waitingForPlayers: "Waiting for players",
      locations: [
        "Amusement Park",
        "School",
        "Pirate Ship",
        "Cinema",
        "Hospital",
        "Restaurant",
        "Space Station",
        "Library",
        "Beach",
        "Bank",
        "Airport",
        "Mall",
        "Zoo",
        "Museum",
        "Hotel"
      ]
    },
    [LANGUAGES.PERSIAN]: {
      gameName: "بازی جاسوس",
      spy: "جاسوس",
      location: "مکان",
      startGame: "بازی شروع شد!",
      askQuestion: "نوبت شماست که سوال بپرسید",
      accusation: "متهم کرده است",
      spyGuess: "جاسوس در حال حدس زدن مکان است",
      spyWin: "جاسوس برنده شد!",
      playersWin: "بازیکنان برنده شدند!",
      voteResults: "نتایج رای‌گیری",
      timeRemaining: "زمان باقی مانده",
      gameEnded: "بازی تمام شده است",
      invalidAction: "عملیات نامعتبر",
      waitingForPlayers: "در انتظار بازیکنان",
      locations: [
        "پارک تفریحی",
        "مدرسه",
        "کشتی دزدان دریایی",
        "سینما",
        "بیمارستان",
        "رستوران",
        "ایستگاه فضایی",
        "کتابخانه",
        "ساحل",
        "بانک",
        "فرودگاه",
        "مرکز خرید",
        "باغ وحش",
        "موزه",
        "هتل"
      ]
    }
  };
  
  /**
   * Game status enum
   */
  const GameStatus = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    VOTING: 'voting',
    FINISHED: 'finished'
  };
  
  /**
   * SpyGame class that handles the game logic
   */
  class SpyGame {
    constructor(gameId, language = LANGUAGES.ENGLISH) {
      this.gameId = gameId;
      this.language = language;
      this.players = [];
      this.status = GameStatus.WAITING;
      this.location = null;
      this.spyIds = []; // Changed from single spyId to array of spyIds
      this.numSpies = 1; // Default number of spies
      this.round = 0;
      this.currentPlayerIndex = 0;
      this.timeLimit = 8 * 60; // 8 minutes in seconds
      this.startTime = null;
      this.votes = {};
      this.accusedId = null;
      this.texts = textResources[language];
    }
    
    // Add this method to SpyGame class
    setNumSpies(num) {
      const maxAllowedSpies = Math.floor(this.players.length / 3);
      this.numSpies = Math.min(Math.max(1, num), maxAllowedSpies);
      return this.numSpies;
    }
    /**
     * Add a player to the game
     */
    addPlayer(playerId, playerName) {
      if (this.status !== GameStatus.WAITING) {
        throw new Error("Cannot add players after game has started");
      }
  
      const player = {
        id: playerId,
        name: playerName,
        role: null,
        card: null
      };
  
      this.players.push(player);
      return player;
    }
  
    /**
     * Remove a player from the game
     */
    removePlayer(playerId) {
      const index = this.players.findIndex(p => p.id === playerId);
      if (index !== -1) {
        this.players.splice(index, 1);
      }
    }
  
    /**
     * Start the game and deal cards to players
     */
    startGame() {
      if (this.players.length < 4) {
        throw new Error("Need at least 4 players to start the game");
      }
    
      this.status = GameStatus.PLAYING;
      this.round++;
      
      // Select a random location
      const locations = this.texts.locations;
      this.location = locations[Math.floor(Math.random() * locations.length)];
      
      // Reset spy IDs array
      this.spyIds = [];
      
      // Create a copy of players array to randomly select spies
      const playerPool = [...this.players];
      
      // Select random spies
      for (let i = 0; i < this.numSpies; i++) {
        if (playerPool.length === 0) break;
        
        const randomIndex = Math.floor(Math.random() * playerPool.length);
        const selectedPlayer = playerPool.splice(randomIndex, 1)[0];
        this.spyIds.push(selectedPlayer.id);
      }
      
      // Assign cards to players
      this.players.forEach(player => {
        if (this.spyIds.includes(player.id)) {
          player.role = 'spy';
          player.card = this.texts.spy;
        } else {
          player.role = 'player';
          player.card = this.location;
        }
      });
      
      // Randomly choose starting player
      this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
      
      // Set start time
      this.startTime = Date.now();
      
      return {
        message: this.texts.startGame,
        currentPlayer: this.getCurrentPlayer()
      };
    }

    isSpy(playerId) {
      return this.spyIds.includes(playerId);
    }
  
    /**
     * Get the current player whose turn it is
     */
    getCurrentPlayer() {
      return this.players[this.currentPlayerIndex];
    }
  
    /**
     * End the current player's turn and move to the next player
     */
    nextTurn() {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      return {
        currentPlayer: this.getCurrentPlayer()
      };
    }
  
    /**
     * Return time remaining in the round
     */
    getTimeRemaining() {
      if (!this.startTime || this.status !== GameStatus.PLAYING) {
        return 0;
      }
      
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      return Math.max(0, this.timeLimit - elapsed);
    }
  
    /**
     * Handle a player voting to accuse someone
     */
    accusePlayer(accuserId, accusedId) {
      if (this.status !== GameStatus.PLAYING) {
        throw new Error("Accusations can only happen during play");
      }
      
      // Start voting phase
      this.status = GameStatus.VOTING;
      this.votes = {};
      this.accusedId = accusedId;
      
      // The accuser automatically votes yes
      this.votes[accuserId] = true;
      
      return {
        accuser: this.players.find(p => p.id === accuserId).name,
        accused: this.players.find(p => p.id === accusedId).name,
        message: `${this.players.find(p => p.id === accuserId).name} ${this.texts.accusation} ${this.players.find(p => p.id === accusedId).name}`
      };
    }
  
    /**
     * Register a vote from a player during voting
     */
    castVote(voterId, voteInFavor) {
      if (this.status !== GameStatus.VOTING) {
        throw new Error("Voting is not currently active");
      }
      
      this.votes[voterId] = voteInFavor;
      
      // Check if everyone has voted
      const allVoted = this.players.every(p => this.votes.hasOwnProperty(p.id));
      
      if (allVoted) {
        return this.resolveVotes();
      }
      
      return {
        message: "Vote recorded"
      };
    }
  
    /**
     * Count votes and determine outcome
     */
    resolveVotes() {
      // Count votes
      let yesVotes = 0;
      let totalVotes = 0;
      
      for (const vote of Object.values(this.votes)) {
        totalVotes++;
        if (vote === true) {
          yesVotes++;
        }
      }
      
      const majorityNeeded = Math.floor(this.players.length / 2) + 1;
      
      if (yesVotes >= majorityNeeded) {
        const accused = this.players.find(p => p.id === this.accusedId);
        
        // Game over - determine winner
        this.status = GameStatus.FINISHED;
        
        if (this.isSpy(accused.id)) {
          return {
            result: "spy_caught",
            message: this.texts.playersWin,
            spyName: accused.name,
            location: this.location,
            remainingSpies: this.spyIds.length - 1
          };
        } else {
          return {
            result: "spy_wins",
            message: this.texts.spyWin,
            accusedName: accused.name,
            spyNames: this.players.filter(p => this.isSpy(p.id)).map(p => p.name),
            location: this.location
          };
        }
      } else {
        // No consensus, continue play
        this.status = GameStatus.PLAYING;
        return {
          result: "no_majority",
          message: "No consensus reached, continuing play"
        };
      }
    }
  
    /**
     * Handle the spy making a guess at the location
     */
    makeLocationGuess(playerId, locationGuess) {
      if (!this.isSpy(playerId)) {
        throw new Error("Only spies can guess the location");
      }
      
      this.status = GameStatus.FINISHED;
      
      if (locationGuess === this.location) {
        return {
          result: "spy_wins",
          message: this.texts.spyWin,
          location: this.location
        };
      } else {
        return {
          result: "players_win",
          message: this.texts.playersWin,
          actualLocation: this.location,
          spyGuess: locationGuess
        };
      }
    }
  
    /**
     * Get game state information that can be sent to a specific player
     */
    getPlayerView(playerId) {
      const player = this.players.find(p => p.id === playerId);
      if (!player) {
        throw new Error("Player not found");
      }
      
      const isSpy = player.role === 'spy';
      
      return {
        gameId: this.gameId,
        language: this.language,
        playerId: playerId,
        playerName: player.name,
        playerRole: player.role,
        card: player.card,
        players: this.players.map(p => ({
          id: p.id,
          name: p.name
        })),
        currentPlayer: this.getCurrentPlayer().id,
        timeRemaining: this.getTimeRemaining(),
        status: this.status,
        // If spy and game is ongoing, hide location
        location: (isSpy && this.status !== GameStatus.FINISHED) ? null : this.location,
        possibleLocations: isSpy ? this.texts.locations : null
      };
    }
  
    /**
     * Change the language of the game
     */
    changeLanguage(newLanguage) {
      if (!textResources[newLanguage]) {
        throw new Error("Unsupported language");
      }
      
      this.language = newLanguage;
      this.texts = textResources[newLanguage];
      
      return {
        message: "Language changed successfully"
      };
    }
  }
  
  /**
   * Game Manager to handle multiple game instances
   */
  class GameManager {
    constructor() {
      this.games = {};
    }
  
    /**
     * Create a new game
     */
    createGame(language = LANGUAGES.ENGLISH) {
      const gameId = this.generateGameId();
      this.games[gameId] = new SpyGame(gameId, language);
      return gameId;
    }
  
    /**
     * Get a game by ID
     */
    getGame(gameId) {
      const game = this.games[gameId];
      if (!game) {
        throw new Error("Game not found");
      }
      return game;
    }
  
    /**
     * Generate a unique game ID
     */
    generateGameId() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
  
    /**
     * Remove a game after it's complete
     */
    removeGame(gameId) {
      delete this.games[gameId];
    }
  }
  
  // Export the classes for use in application
  module.exports = {
    GameManager,
    SpyGame,
    LANGUAGES
  };
  
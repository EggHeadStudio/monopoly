import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, addDoc,
  onSnapshot, query, orderBy, limit, serverTimestamp, runTransaction,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { createBoardController, BOARD_SPACES, playerBoardPosition, cardMovementRoute, CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from "./board.js?v=20261003-8";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const STARTING_BALANCE = 1500;
const PLAYER_ICONS = [
  { id: "car", label: { en: "Car", fi: "Auto" } },
  { id: "hat", label: { en: "Hat", fi: "Hattu" } },
  { id: "ship", label: { en: "Ship", fi: "Laiva" } },
  { id: "shoe", label: { en: "Shoe", fi: "Kenkä" } },
  { id: "dog", label: { en: "Dog", fi: "Koira" } },
  { id: "cat", label: { en: "Cat", fi: "Kissa" } },
  { id: "iron", label: { en: "Iron", fi: "Silitysrauta" } },
  { id: "thimble", label: { en: "Thimble", fi: "Sormustin" } }
];
const PLAYER_COLORS = [
  { id: "red", value: "#d64545" },
  { id: "blue", value: "#2f6fd6" },
  { id: "green", value: "#2f8b57" },
  { id: "yellow", value: "#d5a62f" },
  { id: "black", value: "#29313a" },
  { id: "pink", value: "#cc5f93" },
  { id: "teal", value: "#218b8f" },
  { id: "orange", value: "#d66d2f" }
];
const PROPERTY_PRESETS = [
  // =========================
  // BROWN
  // =========================
  {
    id: "Korkeavuorenkatu",
    name: { en: "Korkeavuori Street", fi: "Korkeavuorenkatu" },
    price: 60,
    mortgageValue: 30,
    color: "#7a4b2a",
    group: "brown",
    canBuild: true,
    houseCost: 50,
    rents: [2, 10, 30, 90, 160, 250]
  },
  {
    id: "Kasarmikatu",
    name: { en: "Kasarmi Street", fi: "Kasarmikatu" },
    price: 60,
    mortgageValue: 30,
    color: "#7a4b2a",
    group: "brown",
    canBuild: true,
    houseCost: 50,
    rents: [4, 20, 60, 180, 320, 450]
  },

  // =========================
  // LIGHT BLUE
  // =========================
  {
    id: "Rantatie",
    name: { en: "Shore Road", fi: "Rantatie" },
    price: 100,
    mortgageValue: 50,
    color: "#8ed8f8",
    group: "lightblue",
    canBuild: true,
    houseCost: 50,
    rents: [6, 30, 90, 270, 400, 550]
  },
  {
    id: "Kauppatori",
    name: { en: "Market Square", fi: "Kauppatori" },
    price: 100,
    mortgageValue: 50,
    color: "#8ed8f8",
    group: "lightblue",
    canBuild: true,
    houseCost: 50,
    rents: [6, 30, 90, 270, 400, 550]
  },
  {
    id: "Esplanadi",
    name: { en: "Esplanade", fi: "Esplanadi" },
    price: 120,
    mortgageValue: 60,
    color: "#8ed8f8",
    group: "lightblue",
    canBuild: true,
    houseCost: 50,
    rents: [8, 40, 100, 300, 450, 600]
  },

  // =========================
  // PINK
  // =========================
  {
    id: "Hämeentie",
    name: { en: "Häme Road", fi: "Hämeentie" },
    price: 140,
    mortgageValue: 70,
    color: "#d93a96",
    group: "pink",
    canBuild: true,
    houseCost: 100,
    rents: [10, 50, 150, 450, 625, 750]
  },
  {
    id: "Siltasaari",
    name: { en: "Siltasaari", fi: "Siltasaari" },
    price: 140,
    mortgageValue: 70,
    color: "#d93a96",
    group: "pink",
    canBuild: true,
    houseCost: 100,
    rents: [10, 50, 150, 450, 625, 750]
  },
  {
    id: "Kaisaniemenkatu",
    name: { en: "Kaisaniemi Street", fi: "Kaisaniemenkatu" },
    price: 160,
    mortgageValue: 80,
    color: "#d93a96",
    group: "pink",
    canBuild: true,
    houseCost: 100,
    rents: [12, 60, 180, 500, 700, 900]
  },

  // =========================
  // ORANGE
  // =========================
  {
    id: "Liisankatu",
    name: { en: "Liisa Street", fi: "Liisankatu" },
    price: 180,
    mortgageValue: 90,
    color: "#f7941d",
    group: "orange",
    canBuild: true,
    houseCost: 100,
    rents: [14, 70, 200, 550, 750, 950]
  },
  {
    id: "Snellmaninkatu",
    name: { en: "Snellman Street", fi: "Snellmaninkatu" },
    price: 180,
    mortgageValue: 90,
    color: "#f7941d",
    group: "orange",
    canBuild: true,
    houseCost: 100,
    rents: [14, 70, 200, 550, 750, 950]
  },
  {
    id: "Unioninkatu",
    name: { en: "Union Street", fi: "Unioninkatu" },
    price: 200,
    mortgageValue: 100,
    color: "#f7941d",
    group: "orange",
    canBuild: true,
    houseCost: 100,
    rents: [16, 80, 220, 600, 800, 1000]
  },

  // =========================
  // RED
  // =========================
  {
    id: "Lönnrotinkatu",
    name: { en: "Lönnrot Street", fi: "Lönnrotinkatu" },
    price: 220,
    mortgageValue: 110,
    color: "#ed1c24",
    group: "red",
    canBuild: true,
    houseCost: 150,
    rents: [18, 90, 250, 700, 875, 1050]
  },
  {
    id: "Annankatu",
    name: { en: "Anna Street", fi: "Annankatu" },
    price: 220,
    mortgageValue: 110,
    color: "#ed1c24",
    group: "red",
    canBuild: true,
    houseCost: 150,
    rents: [18, 90, 250, 700, 875, 1050]
  },
  {
    id: "Simonkatu",
    name: { en: "Simon Street", fi: "Simonkatu" },
    price: 240,
    mortgageValue: 120,
    color: "#ed1c24",
    group: "red",
    canBuild: true,
    houseCost: 150,
    rents: [20, 100, 300, 750, 925, 1100]
  },

  // =========================
  // YELLOW
  // =========================
  {
    id: "Mikonkatu",
    name: { en: "Mikko Street", fi: "Mikonkatu" },
    price: 260,
    mortgageValue: 130,
    color: "#f9e547",
    group: "yellow",
    canBuild: true,
    houseCost: 150,
    rents: [22, 110, 330, 800, 975, 1150]
  },
  {
    id: "Aleksanterinkatu",
    name: { en: "Aleksanteri Street", fi: "Aleksanterinkatu" },
    price: 260,
    mortgageValue: 130,
    color: "#f9e547",
    group: "yellow",
    canBuild: true,
    houseCost: 150,
    rents: [22, 110, 330, 800, 975, 1150]
  },
  {
    id: "Keskuskatu",
    name: { en: "Central Street", fi: "Keskuskatu" },
    price: 280,
    mortgageValue: 140,
    color: "#f9e547",
    group: "yellow",
    canBuild: true,
    houseCost: 150,
    rents: [24, 120, 360, 850, 1025, 1200]
  },

  // =========================
  // GREEN
  // =========================
  {
    id: "Tehtaankatu",
    name: { en: "Factory Street", fi: "Tehtaankatu" },
    price: 300,
    mortgageValue: 150,
    color: "#1b9e55",
    group: "green",
    canBuild: true,
    houseCost: 200,
    rents: [26, 130, 390, 900, 1100, 1275]
  },
  {
    id: "Eira",
    name: { en: "Eira", fi: "Eira" },
    price: 300,
    mortgageValue: 150,
    color: "#1b9e55",
    group: "green",
    canBuild: true,
    houseCost: 200,
    rents: [26, 130, 390, 900, 1100, 1275]
  },
  {
    id: "Bulevardi",
    name: { en: "Boulevard", fi: "Bulevardi" },
    price: 320,
    mortgageValue: 160,
    color: "#1b9e55",
    group: "green",
    canBuild: true,
    houseCost: 200,
    rents: [28, 150, 450, 1000, 1200, 1400]
  },

  // =========================
  // DARK BLUE
  // =========================
  {
    id: "Mannerheimintie",
    name: { en: "Mannerheim Road", fi: "Mannerheimintie" },
    price: 350,
    mortgageValue: 175,
    color: "#244a9b",
    group: "darkblue",
    canBuild: true,
    houseCost: 200,
    rents: [35, 175, 500, 1100, 1300, 1500]
  },
  {
    id: "Erottaja",
    name: { en: "Erottaja", fi: "Erottaja" },
    price: 400,
    mortgageValue: 200,
    color: "#244a9b",
    group: "darkblue",
    canBuild: true,
    houseCost: 200,
    rents: [50, 200, 600, 1400, 1700, 2000]
  },

  // =========================
  // STATIONS
  // =========================
  {
    id: "Pasilan asema",
    name: { en: "Pasila Station", fi: "Pasilan asema" },
    price: 200,
    mortgageValue: 100,
    color: "#222222",
    group: "station",
    canBuild: false,
    houseCost: 0,
    rents: [25, 50, 100, 200]
  },
  {
    id: "Sörnäisten asema",
    name: { en: "Sörnäinen Station", fi: "Sörnäisten asema" },
    price: 200,
    mortgageValue: 100,
    color: "#222222",
    group: "station",
    canBuild: false,
    houseCost: 0,
    rents: [25, 50, 100, 200]
  },
  {
    id: "Rautatieasema",
    name: { en: "Railway Station", fi: "Rautatieasema" },
    price: 200,
    mortgageValue: 100,
    color: "#222222",
    group: "station",
    canBuild: false,
    houseCost: 0,
    rents: [25, 50, 100, 200]
  },
  {
    id: "Tavara-asema",
    name: { en: "Freight Station", fi: "Tavara-asema" },
    price: 200,
    mortgageValue: 100,
    color: "#222222",
    group: "station",
    canBuild: false,
    houseCost: 0,
    rents: [25, 50, 100, 200]
  },

  // =========================
  // UTILITIES
  // =========================
  {
    id: "Sähkölaitos",
    name: { en: "Electric Company", fi: "Sähkölaitos" },
    price: 150,
    mortgageValue: 75,
    color: "#dddddd",
    group: "utility",
    canBuild: false,
    houseCost: 0,
    rents: []
  },
  {
    id: "Vesijohtolaitos",
    name: { en: "Water Works", fi: "Vesijohtolaitos" },
    price: 150,
    mortgageValue: 75,
    color: "#dddddd",
    group: "utility",
    canBuild: false,
    houseCost: 0,
    rents: []
  }
];
// Removed the extra closing bracket
let user = null;
let gameId = localStorage.getItem("monopolyGameId") || null;
let currentPlayerId = localStorage.getItem("monopolyPlayerId") || null;
let gameData = {};
let players = [];
let transactions = [];
let properties = [];
let privateMessages = [];
let replyToMessage = null;
let diceDoubleStreaks = new Map();
let diceLastTotals = new Map();
let diceRollInProgress = false;
let activeDiceRollId = "";
let boardSessionGeneration = 0;
let jailCardUseInProgress = false;
let cardSnapshotInitialized = false;
let seenCardDraws = new Set();
let expandedPlayerOwnership = new Set();
let lastObservedTurn = null;
let lastVibrationTurnKey = "";
let privateMessageSnapshotInitialized = false;
let privateMessageToastTimer = null;
let knownGames = [];
let discoveredGames = [];
let discoveredGameCodes = new Set(loadDiscoveredGameCodes());
let gameLookupTimer = null;
let gameLookupInFlight = new Set();
let pendingPasswordGame = null;
let passwordPromptResolver = null;
let createdGameCode = "";
let createdGamePassword = "";
let unsubscribeGames = null;
let unsubscribeGame = null;
let unsubscribePlayers = null;
let unsubscribeTransactions = null;
let unsubscribeProperties = null;
let unsubscribePrivateMessages = null;
let moneyMode = null;
let propertySaleId = null;
let openPropertyDetails = new Set();
let propertyChoicesOpen = false;
let auctionFinalizeTimer = null;
let turnAlertTimer = null;
let dismissedAuctionId = localStorage.getItem("monopolyDismissedAuctionId") || "";
let language = localStorage.getItem("monopolyLanguage") || "en";

const translations = {
  en: {
    appEyebrow: "DIGITAL MONEY MANAGER",
    leaveGame: "Leave game",
    connecting: "Connecting…",
    signingIn: "Signing in…",
    ready: "Ready.",
    startGame: "Start a game",
    startGameCopy: "Create a new shared game or join one using its code.",
    createNewGame: "Create new game",
    gameVisibility: "Game visibility",
    publicGame: "Public game",
    passwordGame: "Password-protected",
    secretGame: "Secret (code only)",
    visibilityHelp: "Public games appear in the games list. Secret games are hidden from the list.",
    gameCreatedTitle: "Game created",
    shareGameCode: "Share this game code with players.",
    oneTimePassword: "One-time game password — save it now",
    passwordShownOnce: "This password will not be shown again.",
    continue: "Continue",
    passwordRequired: "Password required",
    gamePassword: "Game password",
    wrongGamePassword: "Incorrect password.",
    protected: "Password",
    passwordRequiredForCode: "Enter the one-time password shared by the game creator.",
    or: "or",
    gameCode: "Game code",
    gameCodePlaceholder: "e.g. K7Q9F2MX",
    gameCodeLookupHelp: "Enter the 8-character code to find a game. It will appear below.",
    gameCodeUpper: "GAME CODE",
    joinGame: "Join game",
    savedGames: "Games",
    savedGamesCopy: "Open or delete an existing game.",
    copy: "Copy",
    players: "Players",
    playersCopy: "Choose your player, or add a new one.",
    playerName: "Player name",
    startingBalance: "Starting balance",
    playerIcon: "Icon",
    playerColor: "Color",
    color_red: "Red",
    color_blue: "Blue",
    color_green: "Green",
    color_yellow: "Yellow",
    color_black: "Black",
    color_pink: "Pink",
    color_teal: "Teal",
    color_orange: "Orange",
    add: "Add",
    yourBalance: "YOUR BALANCE",
    monopolyMoney: "Monopoly money",
    payPlayer: "Pay player",
    payPlayerCopy: "Transfer money instantly",
    payBank: "Pay bank",
    payBankCopy: "Make a payment to the bank",
    receive: "Receive",
    claim: "Claim",
    pay: "Pay",
    gameActions: "Game actions",
    receiveCopy: "Salary, GO, bank…",
    payFreeParking: "Pay to center",
    payFreeParkingCopy: "Add money to the pot",
    claimFreeParking: "Free Parking",
    claimPotPrefix: "Claim pot:",
    properties: "Properties",
    propertiesCopy: "Buy and mortgage",
    privateMessages: "Private messages",
    privateMessagesCopy: "Chat privately with a player",
    newPrivateMessage: "New message from {name}",
    messagePlayer: "Conversation with",
    writeMessage: "Message",
    sendMessage: "Send",
    cancelReply: "Cancel reply",
    reply: "Reply",
    you: "You",
    noPrivateMessages: "No messages in this conversation yet.",
    chooseAnotherPlayer: "Add another player to start messaging.",
    replyTo: "Replying to",
    switchPlayer: "Switch player",
    recentActivity: "Recent activity",
    undoLast: "Undo last",
    rollDice: "Roll dice",
    rollDiceCopy: "Roll two dice",
    diceTotal: "Total",
    startingRoll: "Starting roll",
    startingRollResult: "Starting roll result — it does not change the turn.",
    diceDoubleAgain: "Double! You may roll again.",
    diceJailed: "Third double in a row — go to jail!",
    diceNotDouble: "No double. End your turn when you are ready.",
    diceRolling: "Rolling…",
    boardStaleRevision: "Another device already moved this player. This roll was not applied again.",
    boardMovementCancelled: "Board movement cancelled.",
    jailFreeCard: "Get Out of Jail Free",
    jailCardHelp: "Use one card from Jail / Just Visiting. It returns to its original deck; your token stays here and you can roll normally.",
    jailCardReceived: "This card is now yours. Find it beside the Board button; it cannot be drawn again until you use it.",
    jailCardHeld: "Cards held: {count}",
    jailCardUse: "Use card",
    jailCardUsed: "Card used and returned to its deck. You can roll normally.",
    jailCardUnavailable: "You no longer hold this card.",
    jailCardNotInJail: "Use this card from the Jail / Just Visiting space.",
    chanceDeck: "Chance",
    communityDeck: "Community Chest",
    acknowledge: "Acknowledge",
    cardDrawnBy: "Card drawn by {name}",
    cardManualMoney: "Card movement is automatic. Pay charges to the center / Free Parking pot and collect bank money manually. Rent and player payments remain manual.",
    jailCardShared: "The player who drew this card keeps it until use; it is removed from the deck while held.",
    diceTurnHint: "It is {name}'s turn. Switch to that player to roll; starting rolls are always available.",
    turn: "Turn",
    turnOrder: "Order",
    moveUp: "Move earlier",
    moveDown: "Move later",
    turnOrderNotStarted: "Set player order in the lobby, then choose the first player to begin.",
    turnOrderLocked: "Turn order is locked after the game begins.",
    turnNotYours: "It is not your turn.",
    turnStarted: "{name} starts the game.",
    endTurn: "End turn",
    turnEnded: "Turn ended.",
    ownedProperties: "Owned properties",
    noOwnedProperties: "No properties owned",
    currentRent: "Rent now",
    diceRentFormula: "{multiplier} × dice roll",
    housesCount: "{count} houses",
    hotelCount: "Hotel",
    payment: "Payment",
    payAnotherPlayer: "Pay another player",
    receiveFromBank: "Receive from bank",
    toPlayer: "To player",
    amount: "Amount",
    reason: "Reason",
    optionalNote: "Optional note",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    propertyName: "Property name",
    chooseProperty: "Choose property",
    boardwalk: "Boardwalk",
    purchasePrice: "Purchase price",
    mortgageValue: "Mortgage value",
    buyProperty: "Buy property",
    yourProperties: "Your properties",
    noAvailableProperties: "No free properties available.",
    group: "Group",
    group_brown: "Brown",
    group_lightblue: "Light blue",
    group_pink: "Pink",
    group_orange: "Orange",
    group_red: "Red",
    group_yellow: "Yellow",
    group_green: "Green",
    group_darkblue: "Dark blue",
    group_station: "Stations",
    group_utility: "Utilities",
    group_custom: "Custom",
    housePrice: "House price",
    canBuildHouses: "Houses allowed",
    noHouses: "No houses",
    rent: "Rent",
    houses: "Houses",
    hotel: "Hotel",
    buyHouse: "+ house",
    sellHouse: "- house",
    details: "Details",
    sell: "Sell",
    given: "Given",
    auction: "Auction",
    silentAuction: "Silent auction",
    bidAmount: "Bid amount",
    placeBid: "Place bid",
    declineAuction: "Decline",
    auctionStarted: "Silent auction started.",
    auctionAlreadyActive: "There is already an active auction.",
    auctionBidPlaced: "Bid placed.",
    auctionDeclined: "Auction declined.",
    auctionEnded: "Auction ended.",
    auctionNoWinner: "Auction ended without bids.",
    auctionWinner: "{name} won the auction with {amount}.",
    auctionWaiting: "Waiting for bids. Time left: {seconds}s",
    auctionYourBid: "Your bid: {amount}. Waiting for others.",
    auctionSellerWaiting: "Auction is active. Waiting for other players.",
    auctionDeclinedStatus: "You declined this auction.",
    returnToBank: "Return to bank",
    sellProperty: "Sell property",
    buyer: "Buyer",
    salePrice: "Sale price",
    propertyReturned: "Property returned to bank.",
    propertySold: "Property sold.",
    propertyUnavailable: "This property is no longer available.",
    noBuyerAvailable: "Add another player before selling.",
    mustOwnGroup: "You must own the full color group first.",
    evenBuild: "Houses must be built evenly across the group.",
    evenSell: "Houses must be sold evenly across the group.",
    maxHouses: "This property already has a hotel.",
    noHouseToSell: "There are no houses to sell.",
    houseBought: "House bought.",
    houseSold: "House sold.",
    utilityRentOne: "If one utility is owned, rent is 4 times the dice roll.",
    utilityRentBoth: "If both utilities are owned, rent is 10 times the dice roll.",
    selected: "Selected",
    choose: "Choose",
    noPlayersYet: "No players yet.",
    noPlayers: "No players.",
    bank: "Bank",
    player: "Player",
    noTransactionsYet: "No transactions yet.",
    transaction: "Transaction",
    undone: "undone",
    noPropertiesYet: "No properties yet.",
    purchase: "Purchase",
    mortgage: "Mortgage",
    mortgaged: "MORTGAGED",
    unmortgage: "Unmortgage",
    createGameStatus: "Creating game…",
    createGameSuccess: "Game created. Add players and share the code.",
    createGameError: "Could not generate a unique game code. Try again.",
    enterGameCode: "Enter a game code.",
    checkingGameCode: "Checking game code…",
    gameCodeFound: "Game found. Use the game list below to open or delete it.",
    gameNotFound: "Game not found. Check the code.",
    gameFound: "Game found. Choose your player.",
    addOtherPlayer: "Add at least one other player first.",
    transactionCompleted: "Transaction completed.",
    defaultPlayerPayment: "Player payment",
    defaultBankPayment: "Payment to bank",
    defaultBankReceive: "Payment from bank",
    defaultFreeParkingPayment: "Payment to Free Parking",
    defaultFreeParkingClaim: "Free Parking payout",
    playerGone: "Player no longer exists.",
    notEnoughPayment: "Not enough money for this payment.",
    noUndo: "There is no reversible money transaction to undo.",
    alreadyUndone: "This transaction was already undone.",
    cannotUndo: "Cannot undo: recipient no longer has enough money.",
    lastUndone: "Last transaction undone.",
    freeParkingEmpty: "Free Parking is empty.",
    freeParkingPaid: "Payment added to Free Parking.",
    freeParkingClaimed: "Free Parking claimed.",
    claimFreeParkingConfirm: "Claim the whole Free Parking pot of {amount}?",
    notEnoughProperty: "Not enough money to buy this property.",
    propertyGone: "Property no longer exists.",
    notYourProperty: "This is not your property.",
    notEnoughUnmortgage: "Not enough money to unmortgage this property.",
    bought: "Bought",
    mortgagedAction: "Mortgaged",
    unmortgagedAction: "Unmortgaged",
    somethingWrong: "Something went wrong.",
    gameCodeCopied: "Game code copied.",
    noGamesYet: "No games yet.",
    chooseUnusedColor: "Choose an unused color.",
    allColorsUsed: "All player colors are already used.",
    colorAlreadyUsed: "That color is already used by another player.",
    openGame: "Open",
    deleteGame: "Delete",
    deleteGameConfirm: "Delete game {code} and all of its data?",
    deletingGame: "Deleting game…",
    gameDeleted: "Game deleted.",
    deletePlayer: "Delete",
    deletePlayerConfirm: "Delete player {name}? Their properties will also be removed.",
    deletingPlayer: "Deleting player…",
    playerDeleted: "Player deleted.",
    created: "Created",
    switchLanguage: "Switch language"
  },
  fi: {
    appEyebrow: "DIGITAALINEN RAHANHOITAJA",
    leaveGame: "Poistu pelistä",
    connecting: "Yhdistetään…",
    signingIn: "Kirjaudutaan…",
    ready: "Valmis.",
    startGame: "Aloita peli",
    startGameCopy: "Luo uusi jaettu peli tai liity pelikoodilla.",
    createNewGame: "Luo uusi peli",
    gameVisibility: "Pelin näkyvyys",
    publicGame: "Julkinen peli",
    passwordGame: "Salasanasuojattu",
    secretGame: "Salainen (vain koodilla)",
    visibilityHelp: "Julkiset pelit näkyvät pelilistassa. Salaiset pelit piilotetaan listalta.",
    gameCreatedTitle: "Peli luotu",
    shareGameCode: "Jaa pelikoodi muille pelaajille.",
    oneTimePassword: "Kertakäyttöinen pelin salasana — tallenna se nyt",
    passwordShownOnce: "Salasanaa ei näytetä uudelleen.",
    continue: "Jatka",
    passwordRequired: "Salasana vaaditaan",
    gamePassword: "Pelin salasana",
    wrongGamePassword: "Väärä salasana.",
    protected: "Salasana",
    passwordRequiredForCode: "Syötä pelin luojalta saamasi kertakäyttöinen salasana.",
    or: "tai",
    gameCode: "Pelikoodi",
    gameCodePlaceholder: "esim. K7Q9F2MX",
    gameCodeLookupHelp: "Syötä 8-merkkinen koodi etsiäksesi pelin. Löydetty peli ilmestyy alle.",
    gameCodeUpper: "PELIKOODI",
    joinGame: "Liity peliin",
    savedGames: "Pelit",
    savedGamesCopy: "Avaa tai poista olemassa oleva peli.",
    copy: "Kopioi",
    players: "Pelaajat",
    playersCopy: "Valitse pelaajasi tai lisää uusi.",
    playerName: "Pelaajan nimi",
    startingBalance: "Aloitussaldo",
    playerIcon: "Kuvake",
    playerColor: "Väri",
    color_red: "Punainen",
    color_blue: "Sininen",
    color_green: "Vihreä",
    color_yellow: "Keltainen",
    color_black: "Musta",
    color_pink: "Vaaleanpunainen",
    color_teal: "Sinivihreä",
    color_orange: "Oranssi",
    add: "Lisää",
    yourBalance: "SALDOSI",
    monopolyMoney: "Monopoly-rahaa",
    payPlayer: "Maksa pelaajalle",
    payPlayerCopy: "Siirrä rahaa heti",
    payBank: "Maksa pankille",
    payBankCopy: "Suorita maksu pankille",
    receive: "Vastaanota",
    claim: "Lunasta",
    pay: "Maksa",
    gameActions: "Pelitoiminnot",
    receiveCopy: "Palkka, lähtöruutu, pankki…",
    payFreeParking: "Maksa keskelle",
    payFreeParkingCopy: "Lisää rahaa pottiin",
    claimFreeParking: "Vapaa pysäköinti",
    claimPotPrefix: "Lunasta potti:",
    properties: "Tontit",
    propertiesCopy: "Osta ja kiinnitä",
    privateMessages: "Yksityisviestit",
    privateMessagesCopy: "Viestittele yksityisesti pelaajan kanssa",
    newPrivateMessage: "Uusi viesti pelaajalta {name}",
    messagePlayer: "Keskustelu pelaajan kanssa",
    writeMessage: "Viesti",
    sendMessage: "Lähetä",
    cancelReply: "Peruuta vastaus",
    reply: "Vastaa",
    you: "Sinä",
    noPrivateMessages: "Tässä keskustelussa ei ole vielä viestejä.",
    chooseAnotherPlayer: "Lisää toinen pelaaja aloittaaksesi viestittelyn.",
    replyTo: "Vastaat viestiin",
    switchPlayer: "Vaihda pelaajaa",
    recentActivity: "Viime tapahtumat",
    undoLast: "Kumoa viimeisin",
    rollDice: "Heitä noppaa",
    rollDiceCopy: "Heitä kahta noppaa",
    diceTotal: "Yhteensä",
    startingRoll: "Aloitusheitto",
    startingRollResult: "Aloitusheitto — ei vaikuta vuoroon.",
    diceDoubleAgain: "Tuplat! Saat heittää uudelleen.",
    diceJailed: "Kolmannet tuplat peräkkäin — vankilaan!",
    diceNotDouble: "Ei tuplia. Päätä vuoro, kun olet valmis.",
    diceRolling: "Heitetään…",
    boardStaleRevision: "Toinen laite on jo siirtänyt tätä pelaajaa. Heittoa ei käytetty uudelleen.",
    boardMovementCancelled: "Pelilaudalla liikkuminen peruttiin.",
    jailFreeCard: "Vapaudu vankilasta ilmaiseksi",
    jailCardHelp: "Käytä yksi kortti Vankila / Vierailulla -ruudussa. Kortti palautuu alkuperäiseen pakkaan; nappulasi jää tähän ja voit heittää normaalisti.",
    jailCardReceived: "Tämä kortti on nyt sinun. Löydät sen Pelilauta-painikkeen vierestä. Sitä ei voi nostaa uudelleen ennen käyttöä.",
    jailCardHeld: "Kortteja hallussa: {count}",
    jailCardUse: "Käytä kortti",
    jailCardUsed: "Kortti käytetty ja palautettu pakkaan. Voit heittää normaalisti.",
    jailCardUnavailable: "Tämä kortti ei ole enää hallussasi.",
    jailCardNotInJail: "Käytä kortti Vankila / Vierailulla -ruudussa.",
    chanceDeck: "Sattuma",
    communityDeck: "Yhteismaa",
    acknowledge: "Ymmärretty",
    cardDrawnBy: "Kortin nosti {name}",
    cardManualMoney: "Kortin liikkuminen tapahtuu automaattisesti. Maksa maksut keskelle / vapaan pysäköinnin pottiin ja vastaanota rahat pankilta käsin. Vuokrat ja pelaajien väliset maksut hoidetaan käsin.",
    jailCardShared: "Kortin nostanut pelaaja säilyttää sen käyttöön asti. Kortti on poissa pakasta hallussapidon ajan.",
    diceTurnHint: "Nyt on pelaajan {name} vuoro. Vaihda kyseiseen pelaajaan heittääksesi; aloitusheitto on aina käytettävissä.",
    turn: "Vuoro",
    turnOrder: "Järjestys",
    moveUp: "Siirrä aikaisemmaksi",
    moveDown: "Siirrä myöhemmäksi",
    turnOrderNotStarted: "Aseta pelaajien järjestys aulassa ja aloita valitsemalla ensimmäinen pelaaja.",
    turnOrderLocked: "Vuorojärjestystä ei voi enää muuttaa pelin alettua.",
    turnNotYours: "Nyt ei ole sinun vuorosi.",
    turnStarted: "{name} aloittaa pelin.",
    endTurn: "Päätä vuoro",
    turnEnded: "Vuoro päätetty.",
    ownedProperties: "Omistetut kohteet",
    noOwnedProperties: "Ei omistettuja kohteita",
    currentRent: "Vuokra nyt",
    diceRentFormula: "{multiplier} × noppien summa",
    housesCount: "{count} taloa",
    hotelCount: "Hotelli",
    payment: "Maksu",
    payAnotherPlayer: "Maksa toiselle pelaajalle",
    receiveFromBank: "Vastaanota pankilta",
    toPlayer: "Pelaajalle",
    amount: "Summa",
    reason: "Syy",
    optionalNote: "Vapaaehtoinen huomio",
    cancel: "Peruuta",
    confirm: "Vahvista",
    close: "Sulje",
    propertyName: "Tontin nimi",
    chooseProperty: "Valitse tontti",
    boardwalk: "Boardwalk",
    purchasePrice: "Ostohinta",
    mortgageValue: "Kiinnitysarvo",
    buyProperty: "Osta tontti",
    yourProperties: "Omat tontit",
    noAvailableProperties: "Vapaita tontteja ei ole.",
    group: "Ryhmä",
    group_brown: "Ruskea",
    group_lightblue: "Vaaleansininen",
    group_pink: "Vaaleanpunainen",
    group_orange: "Oranssi",
    group_red: "Punainen",
    group_yellow: "Keltainen",
    group_green: "Vihreä",
    group_darkblue: "Tummansininen",
    group_station: "Asemat",
    group_utility: "Laitokset",
    group_custom: "Mukautettu",
    housePrice: "Talon hinta",
    canBuildHouses: "Talot sallittu",
    noHouses: "Ei taloja",
    rent: "Vuokra",
    houses: "Talot",
    hotel: "Hotelli",
    buyHouse: "+ talo",
    sellHouse: "- talo",
    details: "Tiedot",
    sell: "Myy",
    given: "Annettu",
    auction: "Huutokauppa",
    silentAuction: "Hiljainen huutokauppa",
    bidAmount: "Tarjous",
    placeBid: "Tarjoa",
    declineAuction: "Kieltäydy",
    auctionStarted: "Hiljainen huutokauppa aloitettu.",
    auctionAlreadyActive: "Yksi huutokauppa on jo käynnissä.",
    auctionBidPlaced: "Tarjous lähetetty.",
    auctionDeclined: "Kieltäydyit huutokaupasta.",
    auctionEnded: "Huutokauppa päättynyt.",
    auctionNoWinner: "Huutokauppa päättyi ilman tarjouksia.",
    auctionWinner: "{name} voitti huutokaupan summalla {amount}.",
    auctionWaiting: "Odotetaan tarjouksia. Aikaa jäljellä: {seconds}s",
    auctionYourBid: "Tarjouksesi: {amount}. Odotetaan muita.",
    auctionSellerWaiting: "Huutokauppa on käynnissä. Odotetaan muita pelaajia.",
    auctionDeclinedStatus: "Kieltäydyit tästä huutokaupasta.",
    returnToBank: "Palauta pankkiin",
    sellProperty: "Myy tontti",
    buyer: "Ostaja",
    salePrice: "Myyntihinta",
    propertyReturned: "Tontti palautettu pankkiin.",
    propertySold: "Tontti myyty.",
    propertyUnavailable: "Tämä tontti ei ole enää vapaana.",
    noBuyerAvailable: "Lisää toinen pelaaja ennen myyntiä.",
    mustOwnGroup: "Sinun täytyy omistaa koko väriryhmä ensin.",
    evenBuild: "Taloja täytyy rakentaa tasaisesti koko ryhmään.",
    evenSell: "Taloja täytyy myydä tasaisesti koko ryhmästä.",
    maxHouses: "Tällä tontilla on jo hotelli.",
    noHouseToSell: "Tällä tontilla ei ole myytäviä taloja.",
    houseBought: "Talo ostettu.",
    houseSold: "Talo myyty.",
    utilityRentOne: "Jos samalla omistajalla on yksi laitos, vuokra on yhtä kuin 4 kertaa arpakuutioiden osoittama luku.",
    utilityRentBoth: "Jos samalla omistajalla on molemmat laitokset, vuokra on yhtä kuin 10 kertaa arpakuutioiden osoittama luku.",
    selected: "Valittu",
    choose: "Valitse",
    noPlayersYet: "Ei pelaajia vielä.",
    noPlayers: "Ei pelaajia.",
    bank: "Pankki",
    player: "Pelaaja",
    noTransactionsYet: "Ei tapahtumia vielä.",
    transaction: "Tapahtuma",
    undone: "kumottu",
    noPropertiesYet: "Ei tontteja vielä.",
    purchase: "Osto",
    mortgage: "Kiinnitys",
    mortgaged: "KIINNITETTY",
    unmortgage: "Poista kiinnitys",
    createGameStatus: "Luodaan peliä…",
    createGameSuccess: "Peli luotu. Lisää pelaajat ja jaa koodi.",
    createGameError: "Yksilöllistä pelikoodia ei voitu luoda. Yritä uudelleen.",
    enterGameCode: "Syötä pelikoodi.",
    checkingGameCode: "Tarkistetaan pelikoodia…",
    gameCodeFound: "Peli löytyi. Avaa tai poista se alla olevasta pelilistasta.",
    gameNotFound: "Peliä ei löytynyt. Tarkista koodi.",
    gameFound: "Peli löytyi. Valitse pelaajasi.",
    addOtherPlayer: "Lisää ensin vähintään yksi toinen pelaaja.",
    transactionCompleted: "Tapahtuma tehty.",
    defaultPlayerPayment: "Maksu pelaajalle",
    defaultBankPayment: "Maksu pankille",
    defaultBankReceive: "Maksu pankilta",
    defaultFreeParkingPayment: "Maksu vapaapysäköintiin",
    defaultFreeParkingClaim: "Vapaapysäköinnin lunastus",
    playerGone: "Pelaajaa ei enää ole.",
    notEnoughPayment: "Rahat eivät riitä tähän maksuun.",
    noUndo: "Kumottavaa rahatapahtumaa ei ole.",
    alreadyUndone: "Tämä tapahtuma on jo kumottu.",
    cannotUndo: "Ei voi kumota: vastaanottajalla ei ole enää tarpeeksi rahaa.",
    lastUndone: "Viimeisin tapahtuma kumottu.",
    freeParkingEmpty: "Vapaapysäköinti on tyhjä.",
    freeParkingPaid: "Maksu lisätty vapaapysäköintiin.",
    freeParkingClaimed: "Vapaapysäköinti lunastettu.",
    claimFreeParkingConfirm: "Lunastetaanko koko vapaapysäköinnin potti {amount}?",
    notEnoughProperty: "Rahat eivät riitä tämän tontin ostoon.",
    propertyGone: "Tonttia ei enää ole.",
    notYourProperty: "Tämä ei ole sinun tonttisi.",
    notEnoughUnmortgage: "Rahat eivät riitä kiinnityksen poistoon.",
    bought: "Ostettu",
    mortgagedAction: "Kiinnitetty",
    unmortgagedAction: "Kiinnitys poistettu",
    somethingWrong: "Jokin meni pieleen.",
    gameCodeCopied: "Pelikoodi kopioitu.",
    noGamesYet: "Ei pelejä vielä.",
    chooseUnusedColor: "Valitse vapaa väri.",
    allColorsUsed: "Kaikki pelaajavärit ovat jo käytössä.",
    colorAlreadyUsed: "Tämä väri on jo toisella pelaajalla.",
    openGame: "Avaa",
    deleteGame: "Poista",
    deleteGameConfirm: "Poistetaanko peli {code} ja kaikki sen tiedot?",
    deletingGame: "Poistetaan peliä…",
    gameDeleted: "Peli poistettu.",
    deletePlayer: "Poista",
    deletePlayerConfirm: "Poistetaanko pelaaja {name}? Myös pelaajan tontit poistetaan.",
    deletingPlayer: "Poistetaan pelaajaa…",
    playerDeleted: "Pelaaja poistettu.",
    created: "Luotu",
    switchLanguage: "Vaihda kieli"
  }
};

const $ = (id) => document.getElementById(id);
const els = {
  statusBar: $("statusBar"), homeView: $("homeView"), lobbyView: $("lobbyView"), gameView: $("gameView"),
  leaveGameBtn: $("leaveGameBtn"), createGameBtn: $("createGameBtn"), joinCodeInput: $("joinCodeInput"),
  gameSetupDialog: $("gameSetupDialog"), gameSetupForm: $("gameSetupForm"), closeGameSetup: $("closeGameSetup"), cancelGameSetup: $("cancelGameSetup"), gameVisibilitySelect: $("gameVisibilitySelect"),
  createdGameDialog: $("createdGameDialog"), createdGameCode: $("createdGameCode"), createdGamePasswordWrap: $("createdGamePasswordWrap"), createdGamePassword: $("createdGamePassword"), closeCreatedGame: $("closeCreatedGame"),
  gamePasswordDialog: $("gamePasswordDialog"), gamePasswordForm: $("gamePasswordForm"), gamePasswordInput: $("gamePasswordInput"), closeGamePassword: $("closeGamePassword"), cancelGamePassword: $("cancelGamePassword"),
  gameCodeText: $("gameCodeText"), copyCodeBtn: $("copyCodeBtn"),
  savedGamesCard: $("savedGamesCard"), savedGamesList: $("savedGamesList"),
  lobbyPlayers: $("lobbyPlayers"), addPlayerForm: $("addPlayerForm"), newPlayerName: $("newPlayerName"),
  startBalance: $("startBalance"), playerIconSelect: $("playerIconSelect"), playerColorChoices: $("playerColorChoices"),
  currentPlayerName: $("currentPlayerName"), currentBalance: $("currentBalance"),
  turnStatus: $("turnStatus"), endTurnBtn: $("endTurnBtn"),
  payPlayerBtn: $("payPlayerBtn"), payBankBtn: $("payBankBtn"), receiveBankBtn: $("receiveBankBtn"),
  payFreeParkingBtn: $("payFreeParkingBtn"), claimFreeParkingBtn: $("claimFreeParkingBtn"), freeParkingPot: $("freeParkingPot"),
  diceRollBtn: $("diceRollBtn"), diceDialog: $("diceDialog"), closeDiceDialog: $("closeDiceDialog"),
  dicePlayerName: $("dicePlayerName"), dicePair: $("dicePair"), diceTotal: $("diceTotal"), diceResult: $("diceResult"), rollDiceAgainBtn: $("rollDiceAgainBtn"), startingRollBtn: $("startingRollBtn"),
  privateMessagesBtn: $("privateMessagesBtn"), privateMessageBadge: $("privateMessageBadge"), messageToast: $("messageToast"),
  privateMessagesDialog: $("privateMessagesDialog"), closePrivateMessages: $("closePrivateMessages"),
  messageRecipientSelect: $("messageRecipientSelect"), privateMessageList: $("privateMessageList"), privateMessageForm: $("privateMessageForm"),
  privateMessageText: $("privateMessageText"), replyContext: $("replyContext"), cancelReplyBtn: $("cancelReplyBtn"),
  propertyBtn: $("propertyBtn"), gamePlayers: $("gamePlayers"), backToLobbyBtn: $("backToLobbyBtn"),
  transactionList: $("transactionList"), undoBtn: $("undoBtn"), moneyDialog: $("moneyDialog"),
  moneyForm: $("moneyForm"), moneyDialogTitle: $("moneyDialogTitle"), recipientWrap: $("recipientWrap"),
  recipientSelect: $("recipientSelect"), moneyAmount: $("moneyAmount"), moneyReason: $("moneyReason"),
  closeMoneyDialog: $("closeMoneyDialog"), cancelMoneyDialog: $("cancelMoneyDialog"), languageToggle: $("languageToggle"),
  propertyDialog: $("propertyDialog"), closePropertyDialog: $("closePropertyDialog"),
  addPropertyForm: $("addPropertyForm"), propertyPresetSelect: $("propertyPresetSelect"), propertyPresetToggle: $("propertyPresetToggle"), propertyPresetChoices: $("propertyPresetChoices"), auctionSelectedPropertyBtn: $("auctionSelectedPropertyBtn"), propertyList: $("propertyList"),
  propertySaleDialog: $("propertySaleDialog"), propertySaleForm: $("propertySaleForm"), propertySaleTitle: $("propertySaleTitle"),
  closePropertySaleDialog: $("closePropertySaleDialog"), cancelPropertySaleDialog: $("cancelPropertySaleDialog"),
  propertyBuyerSelect: $("propertyBuyerSelect"), propertySaleAmount: $("propertySaleAmount"),
  auctionDialog: $("auctionDialog"), auctionTitle: $("auctionTitle"), auctionPropertyInfo: $("auctionPropertyInfo"), auctionStatus: $("auctionStatus"),
  auctionBidForm: $("auctionBidForm"), auctionBidAmount: $("auctionBidAmount"), declineAuctionBtn: $("declineAuctionBtn"),
  auctionResultActions: $("auctionResultActions"), closeAuctionDialog: $("closeAuctionDialog")
};

function t(key) {
  return translations[language]?.[key] || translations.en[key] || key;
}

function loadDiscoveredGameCodes() {
  try {
    const stored = JSON.parse(localStorage.getItem("monopolyDiscoveredGameCodes") || "[]");
    return Array.isArray(stored) ? stored.filter(code => typeof code === "string") : [];
  } catch {
    return [];
  }
}

function iconLabel(icon) {
  return icon.label[language] || icon.label.en;
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => { element.placeholder = t(element.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach(element => { element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel)); });
  els.languageToggle.textContent = language.toUpperCase();
  els.languageToggle.setAttribute("aria-label", t("switchLanguage"));
  const statusKey = els.statusBar.dataset.statusKey;
  if (statusKey) els.statusBar.textContent = t(statusKey);
  els.joinCodeInput.placeholder = t("gameCodePlaceholder");
  updateMoneyDialogTitle();
  if (els.moneyDialog.open && moneyMode === "player") renderMoneyRecipients();
  updatePropertySaleTitle();
  renderDiceLabels();
  renderPlayerOptions();
  renderPropertySelect();
  renderKnownGames();
  renderPlayers();
  renderCurrentPlayer();
  renderTransactions();
  renderProperties();
  renderAuction(true);
  renderPrivateMessageBadge();
  if (els.privateMessagesDialog.open) renderPrivateMessages();
  if (els.messageToast.dataset.senderName !== undefined) renderPrivateMessageToast();
  boardController.sync();
  renderHeldJailCards();
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  localStorage.setItem("monopolyLanguage", language);
  applyLanguage();
}

function setStatus(message, isError = false, key = "") {
  els.statusBar.dataset.statusKey = key;
  els.statusBar.textContent = key ? t(key) : (message || "");
  els.statusBar.classList.toggle("error", isError);
  boardController.sync();
}

function money(value) {
  return new Intl.NumberFormat(language === "fi" ? "fi-FI" : "en", { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function renderFreeParking() {
  if (els.freeParkingPot) els.freeParkingPot.textContent = money(gameData.freeParkingPot || 0);
  boardController.sync();
  renderHeldJailCards();
}

function showOnly(view) {
  if (view !== els.gameView && $("heldJailCardsDialog").open) $("heldJailCardsDialog").close();
  if (view !== els.gameView) boardController.reset();
  for (const element of [els.homeView, els.lobbyView, els.gameView]) element.classList.add("hidden");
  view.classList.remove("hidden");
  els.leaveGameBtn.classList.toggle("hidden", view === els.homeView);
  els.savedGamesCard.classList.toggle("hidden", view !== els.homeView);
}

function makeGameCode(length = 8) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join("");
}

async function createUniqueGameCode() {
  for (let i = 0; i < 8; i++) {
    const code = makeGameCode();
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return code;
  }
  throw new Error(t("createGameError"));
}

function closeDialogAndWait(dialog) {
  if (!dialog.open) return Promise.resolve();
  return new Promise(resolve => {
    dialog.addEventListener("close", resolve, { once: true });
    dialog.close();
  });
}

async function createGame(event) {
  event?.preventDefault();
  if (!user) return;
  setStatus("", false, "createGameStatus");
  try {
    const code = await createUniqueGameCode();
    const visibility = els.gameVisibilitySelect.value;
    const password = visibility === "password" ? generateGamePassword() : "";
    const passwordSalt = visibility === "password" ? randomHex(16) : "";
    const passwordHash = visibility === "password" ? await hashGamePassword(password, passwordSalt) : "";
    await setDoc(doc(db, "games", code), {
      status: "active",
      visibility,
      passwordSalt,
      passwordHash,
      createdAt: serverTimestamp(),
      createdBy: user.uid
    });
    await closeDialogAndWait(els.gameSetupDialog);
    createdGameCode = code;
    createdGamePassword = password;
    els.createdGameCode.value = code;
    els.createdGamePassword.value = password;
    els.createdGamePasswordWrap.classList.toggle("hidden", visibility !== "password");
    els.createdGameDialog.showModal();
    setStatus("", false, "createGameSuccess");
  } catch (err) { handleError(err); }
}

function scheduleGameCodeLookup() {
  if (gameLookupTimer) clearTimeout(gameLookupTimer);
  renderKnownGames();
  const code = els.joinCodeInput.value.trim().toUpperCase();
  if (code.length !== 8) {
    if (["checkingGameCode", "gameCodeFound"].includes(els.statusBar.dataset.statusKey)) setStatus("", false, "ready");
    return;
  }
  setStatus("", false, "checkingGameCode");
  gameLookupTimer = setTimeout(() => findGameByCode(code), 350);
}

async function findGameByCode(code = els.joinCodeInput.value.trim().toUpperCase()) {
  if (gameLookupTimer) {
    clearTimeout(gameLookupTimer);
    gameLookupTimer = null;
  }
  if (code.length !== 8) return setStatus("", true, "enterGameCode");
  if (gameLookupInFlight.has(code)) return;
  gameLookupInFlight.add(code);
  try {
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return setStatus("", true, "gameNotFound");
    rememberDiscoveredGame({ id: snap.id, ...snap.data() });
    setStatus("", false, "gameCodeFound");
  } catch (err) { handleError(err); }
  finally { gameLookupInFlight.delete(code); }
}

function persistDiscoveredGameCodes() {
  localStorage.setItem("monopolyDiscoveredGameCodes", JSON.stringify([...discoveredGameCodes]));
}

function rememberDiscoveredGame(game) {
  discoveredGameCodes.add(game.id);
  persistDiscoveredGameCodes();
  const existingIndex = discoveredGames.findIndex(item => item.id === game.id);
  if (existingIndex >= 0) discoveredGames[existingIndex] = game;
  else discoveredGames.unshift(game);
  renderKnownGames();
}

async function loadDiscoveredGames() {
  const codes = [...discoveredGameCodes];
  if (!codes.length) return;
  const snapshots = await Promise.all(codes.map(code => getDoc(doc(db, "games", code)).catch(() => null)));
  const activeCodes = new Set();
  discoveredGames = snapshots.filter(snap => snap?.exists()).map(snap => {
    activeCodes.add(snap.id);
    return { id: snap.id, ...snap.data() };
  });
  if (activeCodes.size !== discoveredGameCodes.size) {
    discoveredGameCodes = activeCodes;
    persistDiscoveredGameCodes();
  }
  renderKnownGames();
}

function randomHex(byteCount) {
  return Array.from(crypto.getRandomValues(new Uint8Array(byteCount)), byte => byte.toString(16).padStart(2, "0")).join("");
}

function generateGamePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), byte => alphabet[byte % alphabet.length]).join("");
}

async function hashGamePassword(password, salt) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${password}`));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

function requestGamePassword(game) {
  pendingPasswordGame = game;
  els.gamePasswordInput.value = "";
  els.gamePasswordDialog.showModal();
  els.gamePasswordInput.focus();
  return new Promise(resolve => { passwordPromptResolver = resolve; });
}

function finishPasswordPrompt(accepted) {
  if (els.gamePasswordDialog.open) els.gamePasswordDialog.close();
  pendingPasswordGame = null;
  const resolve = passwordPromptResolver;
  passwordPromptResolver = null;
  resolve?.(accepted);
}

async function submitGamePassword(event) {
  event.preventDefault();
  if (!pendingPasswordGame) return finishPasswordPrompt(false);
  try {
    const candidateHash = await hashGamePassword(els.gamePasswordInput.value, pendingPasswordGame.passwordSalt || "");
    if (candidateHash !== pendingPasswordGame.passwordHash) {
      els.gamePasswordInput.setCustomValidity(t("wrongGamePassword"));
      els.gamePasswordInput.reportValidity();
      els.gamePasswordInput.setCustomValidity("");
      els.gamePasswordInput.select();
      return;
    }
    finishPasswordPrompt(true);
  } catch (err) { handleError(err); }
}

async function openGameByCode(code) {
  try {
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return setStatus("", true, "gameNotFound");
    const game = { id: snap.id, ...snap.data() };
    if (game.visibility === "password") {
      const accepted = await requestGamePassword(game);
      if (!accepted) return;
    }
    enterGame(code, null);
    setStatus("", false, "gameFound");
  } catch (err) { handleError(err); }
}

function enterGame(code, playerId = null) {
  gameId = code;
  currentPlayerId = playerId;
  localStorage.setItem("monopolyGameId", code);
  if (playerId) localStorage.setItem("monopolyPlayerId", playerId);
  else localStorage.removeItem("monopolyPlayerId");
  els.gameCodeText.textContent = code;
  subscribeToGame();
  showOnly(playerId ? els.gameView : els.lobbyView);
}

function leaveGame() {
  stopSubscriptions();
  if (els.privateMessagesDialog.open) els.privateMessagesDialog.close();
  gameId = null;
  currentPlayerId = null;
  gameData = {};
  players = [];
  transactions = [];
  properties = [];
  privateMessages = [];
  replyToMessage = null;
  localStorage.removeItem("monopolyGameId");
  localStorage.removeItem("monopolyPlayerId");
  showOnly(els.homeView);
  setStatus("", false, "ready");
}

async function endTurn(expectedPlayerId = currentPlayerId) {
  if (diceRollInProgress || jailCardUseInProgress) return;
  if (!gameId || !expectedPlayerId) return;
  const gameRef = doc(db, "games", gameId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      if (!gameSnap.exists()) throw new Error(t("gameNotFound"));
      const data = gameSnap.data();
      if (data.currentTurnPlayerId !== expectedPlayerId) throw new Error(t("turnNotYours"));
      const ordered = orderedPlayers();
      if (!ordered.length) return;
      const currentIndex = ordered.findIndex(player => player.id === expectedPlayerId);
      const nextPlayer = ordered[(currentIndex + 1 + ordered.length) % ordered.length];
      tx.update(gameRef, {
        currentTurnPlayerId: nextPlayer.id,
        turnNumber: Number(data.turnNumber || 1) + 1,
        turnStartedAt: serverTimestamp()
      });
    });
    diceDoubleStreaks.set(diceStreakKey(expectedPlayerId), 0);
    if (currentPlayerId === expectedPlayerId) setStatus("", false, "turnEnded");
  } catch (err) { handleError(err); }
}

function renderTurnStatus() {
  els.endTurnBtn.disabled = diceRollInProgress;
  if (!els.turnStatus || !els.endTurnBtn) return;
  const activePlayer = players.find(player => player.id === gameData.currentTurnPlayerId);
  if (!activePlayer) {
    els.turnStatus.textContent = t("turnOrderNotStarted");
    els.endTurnBtn.classList.add("hidden");
    if (els.diceDialog.open && !diceRollInProgress) els.rollDiceAgainBtn.disabled = true;
    return;
  }
  els.turnStatus.textContent = `${t("turn")}: ${activePlayer.name} · ${t("turnOrder")} ${Number(gameData.turnNumber || 1)}`;
  els.endTurnBtn.classList.toggle("hidden", currentPlayerId !== activePlayer.id);
  if (els.diceDialog.open && !diceRollInProgress) els.rollDiceAgainBtn.disabled = currentPlayerId !== activePlayer.id;
  vibrateForCurrentTurn();
}

function vibrateForCurrentTurn() {
  if (!currentPlayerId || gameData.currentTurnPlayerId !== currentPlayerId) return;
  const turnKey = `${gameId}:${gameData.turnNumber || 1}:${gameData.currentTurnPlayerId}:${currentPlayerId}`;
  if (turnKey === lastVibrationTurnKey) return;
  lastVibrationTurnKey = turnKey;
  els.turnStatus.classList.remove("turn-alert");
  void els.turnStatus.offsetWidth;
  els.turnStatus.classList.add("turn-alert");
  if (turnAlertTimer) clearTimeout(turnAlertTimer);
  turnAlertTimer = setTimeout(() => els.turnStatus.classList.remove("turn-alert"), 2100);
  if (typeof navigator.vibrate === "function") {
    try { navigator.vibrate([500, 150, 500, 150, 500, 200]); } catch { /* unsupported or blocked by device */ }
  }
}

function diceStreakKey(playerId = currentPlayerId) {
  return `${gameId || ""}:${playerId || ""}`;
}

function stopSubscriptions() {
  cardSnapshotInitialized = false;
  seenCardDraws = new Set();
  boardController.reset();
  if (auctionFinalizeTimer) {
    clearTimeout(auctionFinalizeTimer);
    auctionFinalizeTimer = null;
  }
  for (const fn of [unsubscribeGame, unsubscribePlayers, unsubscribeTransactions, unsubscribeProperties, unsubscribePrivateMessages]) if (fn) fn();
  unsubscribeGame = unsubscribePlayers = unsubscribeTransactions = unsubscribeProperties = unsubscribePrivateMessages = null;
}

function subscribeToKnownGames() {
  if (unsubscribeGames) unsubscribeGames();
  loadDiscoveredGames().catch(handleError);
  const gamesQuery = query(collection(db, "games"), orderBy("createdAt", "desc"), limit(30));
  unsubscribeGames = onSnapshot(gamesQuery, snap => {
    knownGames = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKnownGames();
    loadDiscoveredGames().catch(handleError);
  }, handleError);
}

function renderKnownGames() {
  if (!els.savedGamesList) return;
  const codeInField = els.joinCodeInput?.value.trim().toUpperCase() || "";
  const gamesById = new Map(knownGames.map(game => [game.id, game]));
  discoveredGames.forEach(game => gamesById.set(game.id, game));
  const listedGames = [...gamesById.values()].filter(game =>
    (game.visibility || "public") !== "secret" ||
    (discoveredGameCodes.has(game.id) && codeInField === game.id)
  );
  if (!listedGames.length) {
    els.savedGamesList.innerHTML = `<div class="empty">${t("noGamesYet")}</div>`;
    return;
  }
  els.savedGamesList.innerHTML = listedGames.map(game => {
    const createdAt = formatGameDate(game.createdAt);
    const accessLabel = game.visibility === "password" ? ` · ${t("protected")}` : "";
    return `<div class="game-row">
      <div class="player-main">
        <div class="player-name">${escapeHtml(game.id)}</div>
        <div class="player-balance">${t("created")} ${escapeHtml(createdAt)}${accessLabel}</div>
      </div>
      <div class="game-actions">
        <button class="button" data-open-game="${game.id}">${t("openGame")}</button>
        <button class="button danger" data-delete-game="${game.id}">${t("deleteGame")}</button>
      </div>
    </div>`;
  }).join("");
  els.savedGamesList.querySelectorAll("[data-open-game]").forEach(btn => btn.addEventListener("click", () => openKnownGame(btn.dataset.openGame)));
  els.savedGamesList.querySelectorAll("[data-delete-game]").forEach(btn => btn.addEventListener("click", () => deleteKnownGame(btn.dataset.deleteGame)));
}

function formatGameDate(timestamp) {
  if (!timestamp?.toDate) return "-";
  return new Intl.DateTimeFormat(language === "fi" ? "fi-FI" : "en", { dateStyle: "short", timeStyle: "short" }).format(timestamp.toDate());
}

function openKnownGame(code) {
  openGameByCode(code);
}

async function deleteKnownGame(code) {
  if (!confirm(t("deleteGameConfirm").replace("{code}", code))) return;
  setStatus("", false, "deletingGame");
  try {
    if (code === gameId) stopSubscriptions();
    const gameRef = doc(db, "games", code);
    const refs = [];
    for (const subcollection of ["players", "transactions", "properties", "privateMessages"]) {
      const snap = await getDocs(collection(db, "games", code, subcollection));
      snap.docs.forEach(document => refs.push(document.ref));
    }
    refs.push(gameRef);
    for (let index = 0; index < refs.length; index += 450) {
      const batch = writeBatch(db);
      refs.slice(index, index + 450).forEach(ref => batch.delete(ref));
      await batch.commit();
    }
    if (code === gameId || localStorage.getItem("monopolyGameId") === code) {
      gameId = null;
      currentPlayerId = null;
      players = [];
      transactions = [];
      properties = [];
      privateMessages = [];
      gameData = {};
      localStorage.removeItem("monopolyGameId");
      localStorage.removeItem("monopolyPlayerId");
      showOnly(els.homeView);
    }
    discoveredGameCodes.delete(code);
    discoveredGames = discoveredGames.filter(game => game.id !== code);
    persistDiscoveredGameCodes();
    setStatus("", false, "gameDeleted");
  } catch (err) { handleError(err); }
}

function subscribeToGame() {
  stopSubscriptions();
  if (!gameId) return;

  unsubscribeGame = onSnapshot(doc(db, "games", gameId), { includeMetadataChanges: true }, snap => {
    const nextGameData = snap.exists() ? snap.data() : {};
    if (lastObservedTurn && lastObservedTurn.gameId === gameId && lastObservedTurn.playerId && nextGameData.currentTurnPlayerId !== lastObservedTurn.playerId) {
      diceDoubleStreaks.set(diceStreakKey(lastObservedTurn.playerId), 0);
    }
    lastObservedTurn = { gameId, playerId: nextGameData.currentTurnPlayerId || null };
    gameData = nextGameData;
    observeCardDraws(gameData.cardDrawEvents || [], Boolean(snap.metadata?.hasPendingWrites));
    renderFreeParking();
    renderPlayers();
    renderAuction();
  }, handleError);

  unsubscribePlayers = onSnapshot(collection(db, "games", gameId, "players"), snap => {
    players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    players.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    renderPlayers();
    renderCurrentPlayer();
    renderAuction();
    boardController.sync();
    if (currentPlayerId) initializeTurnIfNeeded();
  }, handleError);

  const txQuery = query(collection(db, "games", gameId, "transactions"), orderBy("createdAt", "desc"), limit(25));
  unsubscribeTransactions = onSnapshot(txQuery, snap => {
    transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTransactions();
  }, handleError);

  unsubscribeProperties = onSnapshot(collection(db, "games", gameId, "properties"), snap => {
    properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderPropertySelect();
    renderProperties();
    renderPlayers();
    boardController.sync();
  }, handleError);

  privateMessageSnapshotInitialized = false;
  unsubscribePrivateMessages = onSnapshot(
    query(collection(db, "games", gameId, "privateMessages"), orderBy("createdAt", "asc"), limit(300)),
    snap => {
      const previousIds = new Set(privateMessages.map(message => message.id));
      privateMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const newIncoming = privateMessages.filter(message =>
        !previousIds.has(message.id) && message.recipientId === currentPlayerId && message.senderId !== currentPlayerId
      );
      if (privateMessageSnapshotInitialized && newIncoming.length) {
        const activeRecipientId = els.messageRecipientSelect.value;
        const viewingConversation = els.privateMessagesDialog.open && activeRecipientId === newIncoming[newIncoming.length - 1].senderId;
        if (viewingConversation) markConversationRead(activeRecipientId);
        else {
          const sender = players.find(player => player.id === newIncoming[newIncoming.length - 1].senderId);
          showPrivateMessageToast(sender?.name || "");
        }
      }
      privateMessageSnapshotInitialized = true;
      renderPrivateMessageBadge();
      renderPrivateMessages();
    },
    handleError
  );
}

function renderPlayerOptions() {
  if (!els.playerIconSelect || !els.playerColorChoices) return;
  const selectedIcon = els.playerIconSelect.value || PLAYER_ICONS[0].id;
  const usedColors = new Set(players.map(p => p.color).filter(Boolean));
  const currentColor = selectedPlayerColor();
  const availableColor = firstAvailableColor();
  const selectedColor = currentColor && !usedColors.has(currentColor) ? currentColor : availableColor;
  els.playerIconSelect.innerHTML = PLAYER_ICONS.map(icon => `<option value="${icon.id}">${iconLabel(icon)}</option>`).join("");
  els.playerIconSelect.value = PLAYER_ICONS.some(icon => icon.id === selectedIcon) ? selectedIcon : PLAYER_ICONS[0].id;
  els.playerColorChoices.innerHTML = PLAYER_COLORS.map(color => {
    const used = usedColors.has(color.value);
    const checked = selectedColor === color.value;
    const label = escapeHtml(t(`color_${color.id}`));
    return `<label class="color-choice ${used ? "disabled" : ""}" title="${label}">
      <input type="radio" name="playerColor" value="${color.value}" aria-label="${label}" ${checked ? "checked" : ""} ${used ? "disabled" : ""} required />
      <span style="--player-color: ${color.value}"></span>
    </label>`;
  }).join("");
}

function firstAvailableColor() {
  const usedColors = new Set(players.map(p => p.color).filter(Boolean));
  return PLAYER_COLORS.find(color => !usedColors.has(color.value))?.value || "";
}

function selectedPlayerColor() {
  return els.playerColorChoices?.querySelector("input[name='playerColor']:checked")?.value || "";
}

async function addPlayer(event) {
  event.preventDefault();
  const name = els.newPlayerName.value.trim();
  const balance = Number(els.startBalance.value || STARTING_BALANCE);
  const icon = PLAYER_ICONS.some(option => option.id === els.playerIconSelect.value) ? els.playerIconSelect.value : PLAYER_ICONS[0].id;
  const color = selectedPlayerColor() || firstAvailableColor();
  if (!name || balance < 0) return;
  if (!color) return setStatus("", true, "allColorsUsed");
  if (players.some(player => player.color === color)) return setStatus("", true, "colorAlreadyUsed");
  try {
    const ordered = orderedPlayers();
    const playerRef = doc(collection(db, "games", gameId, "players"));
    const batch = writeBatch(db);
    ordered.forEach((player, index) => {
      if (!Number.isInteger(player.turnOrder) || player.turnOrder !== index) {
        batch.update(doc(db, "games", gameId, "players", player.id), { turnOrder: index });
      }
    });
    batch.set(playerRef, {
      name,
      balance,
      icon,
      color,
      position: 0,
      turnOrder: ordered.length,
      createdAt: serverTimestamp()
    });
    await batch.commit();
    els.newPlayerName.value = "";
    renderPlayerOptions();
  } catch (err) { handleError(err); }
}

function orderedPlayers(source = players) {
  return [...source].sort((a, b) => {
    const aOrder = Number.isInteger(a.turnOrder) ? a.turnOrder : Number.MAX_SAFE_INTEGER;
    const bOrder = Number.isInteger(b.turnOrder) ? b.turnOrder : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder || (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0);
  });
}

async function selectPlayer(playerId) {
  currentPlayerId = playerId;
  localStorage.setItem("monopolyPlayerId", playerId);
  showOnly(els.gameView);
  renderCurrentPlayer();
  renderPlayers();
  renderTransactions();
  await initializeTurnIfNeeded();
  renderTurnStatus();
  boardController.sync();
}

async function initializeTurnIfNeeded() {
  if (!gameId || !players.length) return;
  const gameRef = doc(db, "games", gameId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      if (!gameSnap.exists() || gameSnap.data().currentTurnPlayerId) return;
      const firstPlayer = orderedPlayers()[0];
      if (!firstPlayer) return;
      tx.update(gameRef, { currentTurnPlayerId: firstPlayer.id, turnNumber: 1, turnStartedAt: serverTimestamp() });
    });
  } catch (err) { handleError(err); }
}

async function movePlayerOrder(playerId, direction) {
  const ordered = orderedPlayers();
  const index = ordered.findIndex(player => player.id === playerId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ordered.length) return;
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  try {
    const batch = writeBatch(db);
    ordered.forEach((player, order) => batch.update(doc(db, "games", gameId, "players", player.id), { turnOrder: order }));
    await batch.commit();
  } catch (err) { handleError(err); }
}

function openDiceDialog() {
  const player = players.find(item => item.id === currentPlayerId);
  if (!player) return;
  const activeTurnPlayer = players.find(item => item.id === gameData.currentTurnPlayerId);
  els.dicePlayerName.textContent = player.name;
  els.dicePair.innerHTML = "";
  const canRollForTurn = gameData.currentTurnPlayerId === currentPlayerId;
  setDiceLabels(null, canRollForTurn ? "" : "diceTurnHint", activeTurnPlayer?.name || "");
  els.rollDiceAgainBtn.disabled = diceRollInProgress || !canRollForTurn;
  els.startingRollBtn.disabled = diceRollInProgress;
  if (!els.diceDialog.open) els.diceDialog.showModal();
}

// Presentation data only: language changes never roll or move a token.
function setDiceLabels(total = null, resultKey = "", playerName = "") {
  els.diceTotal.dataset.total = total === null ? "" : String(total);
  els.diceResult.dataset.resultKey = resultKey;
  els.diceResult.dataset.playerName = playerName;
  renderDiceLabels();
}

function renderDiceLabels() {
  const total = els.diceTotal.dataset.total;
  const resultKey = els.diceResult.dataset.resultKey;
  els.diceTotal.textContent = total ? `${t("diceTotal")}: ${total}` : "";
  els.diceResult.textContent = resultKey
    ? t(resultKey).replace("{name}", els.diceResult.dataset.playerName || t("player"))
    : "";
}

function dieMarkup(value, rolling = false) {
  const pipsByValue = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
  };
  const pips = new Set(pipsByValue[value] || []);
  return `<div class="die-face ${rolling ? "rolling" : ""}" aria-label="${value}">${Array.from({ length: 9 }, (_, index) => `<span class="die-pip ${pips.has(index) ? "shown" : ""}"></span>`).join("")}</div>`;
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function rollDice(isStartingRoll = false) {
  const rollerId = currentPlayerId;
  if (diceRollInProgress || jailCardUseInProgress || !rollerId) return;
  if (!isStartingRoll && gameData.currentTurnPlayerId !== rollerId) return setStatus("", true, "turnNotYours");
  // Capture the revision BEFORE the dice animation. Concurrent tabs use the same
  // expected revision; only one final transaction can commit that movement.
  const rollGameId = gameId;
  const roller = players.find(player => player.id === rollerId);
  if (!roller || !rollGameId) return;
  const movement = {
    gameId: rollGameId, playerId: rollerId, from: playerBoardPosition(roller),
    version: Number(roller.boardMoveVersion || 0), turn: Number(gameData.turnNumber || 1),
    rollId: randomHex(16), session: boardSessionGeneration
  };
  activeDiceRollId = movement.rollId;
  diceRollInProgress = true;
  renderTurnStatus();
  boardController.sync();
  els.rollDiceAgainBtn.disabled = true;
  els.startingRollBtn.disabled = true;
  setDiceLabels(null, "diceRolling");
  els.dicePair.innerHTML = `${dieMarkup(1, true)}${dieMarkup(6, true)}`;
  await delay(720);
  const first = crypto.getRandomValues(new Uint32Array(1))[0] % 6 + 1;
  const second = crypto.getRandomValues(new Uint32Array(1))[0] % 6 + 1;
  if (!isCurrentBoardMovement(movement)) {
    if (activeDiceRollId === movement.rollId) {
      activeDiceRollId = "";
      diceRollInProgress = false;
      renderTurnStatus();
      boardController.sync();
    }
    return;
  }
  if (isStartingRoll) {
    els.dicePair.innerHTML = `${dieMarkup(first)}${dieMarkup(second)}`;
    setDiceLabels(first + second, "startingRollResult");
    els.rollDiceAgainBtn.disabled = gameData.currentTurnPlayerId !== currentPlayerId;
    els.startingRollBtn.disabled = false;
    diceRollInProgress = false;
    activeDiceRollId = "";
    renderTurnStatus();
    boardController.sync();
    return;
  }
  const isDouble = first === second;
  const streakKey = diceStreakKey(rollerId);
  const streak = isDouble ? (diceDoubleStreaks.get(streakKey) || 0) + 1 : 0;
  els.dicePair.innerHTML = `${dieMarkup(first)}${dieMarkup(second)}`;
  setDiceLabels(first + second, isDouble && streak >= 3 ? "diceJailed" : isDouble ? "diceDoubleAgain" : "diceNotDouble");
  let committed = false, movementError = "", movementErrorKey = "";
  try {
    // Keep the settled dice visible for one second before opening the route.
    await delay(1000);
    if (!isCurrentBoardMovement(movement)) return;
    // Display the route, not a teleport hidden behind the dice popup.
    if (els.diceDialog.open) els.diceDialog.close();
    if (!document.getElementById("boardDialog").open) boardController.openBoardDialog();
    boardController.setDice(first, second, isDouble && streak >= 3 ? "diceJailed" : isDouble ? "diceDoubleAgain" : "diceNotDouble");
    committed = await movePlayerOnBoard(movement, first + second);
    if (committed && isCurrentBoardMovement(movement)) {
      diceLastTotals.set(streakKey, first + second);
      diceDoubleStreaks.set(streakKey, isDouble && streak >= 3 ? 0 : streak);
    }
  } catch (err) {
    if (isCurrentBoardMovement(movement)) {
      handleError(err);
      movementError = err?.message || t("somethingWrong");
      movementErrorKey = err?.translationKey || "";
    }
  } finally {
    // An obsolete roll must not unlock or redraw a newer session's active roll.
    if (activeDiceRollId === movement.rollId) {
      activeDiceRollId = "";
      diceRollInProgress = false;
      boardController.finishMovement(rollerId);
      els.startingRollBtn.disabled = false;
      renderTurnStatus();
      boardController.sync();
      if (movementError) boardController.setMovementError(movementError, movementErrorKey);
    }
  }
  // Preserve the existing third-double turn behavior; no automatic jail movement.
  if (committed && isDouble && streak >= 3 && isCurrentBoardMovement(movement)) await endTurn(rollerId);
}

function isCurrentBoardMovement(movement) {
  return gameId === movement.gameId && currentPlayerId === movement.playerId && boardSessionGeneration === movement.session;
}

// Board movement writes only the final position, with an optimistic concurrency
// guard and an idempotent roll id. Bank balances and manual actions are untouched.
async function movePlayerOnBoard(movement, steps) {
  let finalPosition = await boardController.animatePlayerMovement(movement.playerId, movement.from, steps);
  if (!isCurrentBoardMovement(movement)) throw new Error(t("turnNotYours"));
  // Landing, not merely passing, sends the piece directly to Jail / Just Visiting.
  // Commit the relocation with the same guarded final-position write.
  if (BOARD_SPACES[finalPosition].type === "goToJail") {
    finalPosition = BOARD_SPACES.find(space => space.type === "jail").index;
    boardController.relocatePlayerOnBoard(movement.playerId, finalPosition);
  }
  const landing = BOARD_SPACES[finalPosition];
  // Select against the transaction's shared holders, not a possibly stale snapshot.
  // The seed is stable across transaction retries; a concurrently claimed card is excluded.
  const cardSeed = crypto.getRandomValues(new Uint32Array(1))[0];
  const gameRef = doc(db, "games", movement.gameId);
  const playerRef = doc(db, "games", movement.gameId, "players", movement.playerId);
  const result = await runTransaction(db, async tx => {
    const gameSnap = await tx.get(gameRef);
    const playerSnap = await tx.get(playerRef);
    if (!isCurrentBoardMovement(movement)) throw new Error(t("turnNotYours"));
    if (!gameSnap.exists()) throw new Error(t("gameNotFound"));
    if (!playerSnap.exists()) throw new Error(t("playerGone"));
    const data = playerSnap.data(), game = gameSnap.data();
    if (data.boardLastRollId === movement.rollId) return { applied: false };
    if (game.currentTurnPlayerId !== movement.playerId || Number(game.turnNumber || 1) !== movement.turn) throw new Error(t("turnNotYours"));
    if (Number(data.boardMoveVersion || 0) !== movement.version || playerBoardPosition(data) !== movement.from) {
      const error = new Error(t("boardStaleRevision"));
      error.translationKey = "boardStaleRevision";
      throw error;
    }
    const holders = landing.type === "chance" || landing.type === "community"
      ? await transactionJailCardHolders(tx, game, movement.gameId) : storedJailCardHolders(game);
    const cards = [], routes = [];
    let destination = finalPosition;
    for (let draw = 0; draw < 4; draw++) {
      const space = BOARD_SPACES[destination];
      const card = space.type === "chance" ? boardController.drawChanceCard(holders, (cardSeed + draw) >>> 0)
        : space.type === "community" ? boardController.drawCommunityChestCard(holders, (cardSeed + draw) >>> 0) : null;
      if (!card) break;
      cards.push(card);
      if (card.keepUntilUsed) holders[card.id] = movement.playerId;
      const route = cardMovementRoute(card, destination);
      if (!route) break;
      routes.push(route);
      destination = route.destination;
      if (BOARD_SPACES[destination].type === "goToJail") {
        routes.push({ from: destination, destination: 10, direct: true, steps: 0 });
        destination = 10;
      }
      // Back-three from Chance can land on Community Chest and draw again.
      if (!["chance", "community"].includes(BOARD_SPACES[destination].type)) break;
    }
    const card = cards[cards.length - 1] || null;
    let cardVersion = Number(game.jailCardVersion || 0);
    const inventoryChanged = cards.some(card => card.keepUntilUsed);
    const gamePatch = {};
    if (inventoryChanged) {
      cardVersion++;
      Object.assign(gamePatch, { heldJailCards: holders, jailCardVersion: cardVersion });
    }
    const event = cards.length ? {
      id: movement.rollId, playerId: movement.playerId, playerName: data.name || "",
      cards: cards.map(card => ({ id: card.id, type: card.type }))
    } : null;
    if (event) gamePatch.cardDrawEvents = [...(game.cardDrawEvents || []), event].slice(-20);
    if (Object.keys(gamePatch).length) tx.update(gameRef, gamePatch);
    tx.update(playerRef, {
      position: destination, boardMoveVersion: movement.version + 1,
      boardLastRollId: movement.rollId, boardLastDiceTotal: steps,
      boardLastCard: card ? { id: card.id, type: card.type, rollId: movement.rollId } : null
    });
    return { applied: true, card, holders, cardVersion, destination, routes, event, inventoryChanged };
  });
  if (!isCurrentBoardMovement(movement)) return false;
  if (result.applied) {
    // Card effects were atomically committed. Animate only the committed routes,
    // never rerun draws/effects on a snapshot or an acknowledgement.
    try {
      for (const route of result.routes) {
        if (!isCurrentBoardMovement(movement)) return false;
        if (route.direct) boardController.relocatePlayerOnBoard(movement.playerId, route.destination);
        else await boardController.animatePlayerMovement(movement.playerId, route.from, Math.abs(route.steps), route.steps < 0 ? -1 : 1);
      }
    } catch (err) { if (isCurrentBoardMovement(movement)) throw err; else return false; }
    finalPosition = result.destination;
  }
  if (!isCurrentBoardMovement(movement)) return false;
  // The snapshot may arrive before or after the transaction promise resolves.
  // Never roll back a newer position if another tab has already made a later move.
  players = players.map(player => player.id === movement.playerId && Number(player.boardMoveVersion || 0) <= movement.version
    ? { ...player, position: finalPosition, boardMoveVersion: movement.version + 1 } : player);
  boardController.finishMovement(movement.playerId);
  if (result.inventoryChanged) applyJailCardState(result.holders, result.cardVersion);
  renderHeldJailCards();
  if (result.applied && result.event) displayCardDraw(result.event);
  return result.applied;
}

// A bounded event history shares draws using the existing game subscription.
// Initial subscription establishes a baseline instead of replaying old cards.
function observeCardDraws(events, pendingWrites = false) {
  if (!cardSnapshotInitialized) {
    events.forEach(event => { if (event.id !== activeDiceRollId) seenCardDraws.add(event.id); });
    cardSnapshotInitialized = true;
    return;
  }
  if (pendingWrites) return;
  events.forEach(event => { if (event.id !== activeDiceRollId) displayCardDraw(event); });
}

function displayCardDraw(event) {
  if (!event?.id || seenCardDraws.has(event.id)) return;
  seenCardDraws.add(event.id);
  if (seenCardDraws.size > 200) seenCardDraws = new Set([...seenCardDraws].slice(-100));
  for (const entry of event.cards || []) {
    const deck = entry.type === "chance" ? CHANCE_CARDS : entry.type === "community" ? COMMUNITY_CHEST_CARDS : [];
    const card = deck.find(card => card.id === entry.id);
    if (card) boardController.showCard({ ...card, type: entry.type, playerName: event.playerName });
  }
}

// Shared jail-card inventory lives on the game document (no new subscription).
function jailReleaseCards() {
  return [...CHANCE_CARDS.map(card => ({ ...card, type: "chance" })),
    ...COMMUNITY_CHEST_CARDS.map(card => ({ ...card, type: "community" }))].filter(card => card.keepUntilUsed);
}

function storedJailCardHolders(game = gameData) {
  const ids = new Set(jailReleaseCards().map(card => card.id));
  return Object.fromEntries(Object.entries(game.heldJailCards || {})
    .filter(([id, owner]) => ids.has(id) && typeof owner === "string" && owner));
}

async function transactionJailCardHolders(tx, game, code) {
  const holders = storedJailCardHolders(game);
  // Player and game listeners can arrive independently. Only transactional reads
  // may release an orphaned card; never trust local player membership here.
  for (const owner of new Set(Object.values(holders))) {
    const ownerSnap = await tx.get(doc(db, "games", code, "players", owner));
    if (!ownerSnap.exists()) {
      for (const id of Object.keys(holders)) if (holders[id] === owner) delete holders[id];
    }
  }
  return holders;
}

function applyJailCardState(holders, version) {
  if (Number(gameData.jailCardVersion || 0) <= version) {
    gameData = { ...gameData, heldJailCards: holders, jailCardVersion: version };
  }
}

function renderHeldJailCards() {
  const holders = storedJailCardHolders();
  const cards = jailReleaseCards().filter(card => holders[card.id] === currentPlayerId);
  const button = $("heldJailCardBtn");
  button.classList.toggle("hidden", !cards.length);
  button.classList.toggle("is-stacked", cards.length > 1);
  button.disabled = diceRollInProgress || jailCardUseInProgress;
  $("heldJailCardCount").textContent = String(cards.length);
  $("heldJailCardHint").textContent = t("jailCardHeld").replace("{count}", cards.length);
  const inJail = playerBoardPosition(players.find(player => player.id === currentPlayerId)) === 10;
  $("heldJailCardsList").innerHTML = cards.map(card => `<div class="held-jail-card-row"><strong>${escapeHtml(t(card.type === "chance" ? "chanceDeck" : "communityDeck"))}</strong><button type="button" class="button primary" data-use-jail-card="${escapeHtml(card.id)}" ${!inJail || diceRollInProgress || jailCardUseInProgress ? "disabled" : ""}>${t("jailCardUse")}</button></div>`).join("");
  $("heldJailCardsList").querySelectorAll("[data-use-jail-card]").forEach(button => button.addEventListener("click", () => useJailReleaseCard(button.dataset.useJailCard)));
}

async function useJailReleaseCard(cardId) {
  if (!gameId || !currentPlayerId || diceRollInProgress || jailCardUseInProgress) return;
  const code = gameId, playerId = currentPlayerId, session = boardSessionGeneration;
  jailCardUseInProgress = true;
  renderHeldJailCards();
  try {
    const gameRef = doc(db, "games", code), playerRef = doc(db, "games", code, "players", playerId);
    const result = await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef), playerSnap = await tx.get(playerRef);
      if (gameId !== code || currentPlayerId !== playerId || boardSessionGeneration !== session) throw new Error(t("playerGone"));
      if (!gameSnap.exists()) throw new Error(t("gameNotFound"));
      if (!playerSnap.exists()) throw new Error(t("playerGone"));
      const holders = await transactionJailCardHolders(tx, gameSnap.data(), code);
      if (holders[cardId] !== playerId) throw new Error(t("jailCardUnavailable"));
      if (playerBoardPosition(playerSnap.data()) !== 10) throw new Error(t("jailCardNotInJail"));
      delete holders[cardId];
      const version = Number(gameSnap.data().jailCardVersion || 0) + 1;
      tx.update(gameRef, { heldJailCards: holders, jailCardVersion: version });
      return { holders, version };
    });
    if (gameId === code && currentPlayerId === playerId && boardSessionGeneration === session) {
      applyJailCardState(result.holders, result.version);
      $("heldJailCardsDialog").close();
      setStatus("", false, "jailCardUsed");
    }
  } catch (err) { if (gameId === code && boardSessionGeneration === session) handleError(err); }
  finally { jailCardUseInProgress = false; renderHeldJailCards(); boardController.sync(); }
}

function renderPlayers() {
  renderHeldJailCards();
  renderPlayerOptions();
  renderPrivateMessageBadge();
  renderTurnStatus();
  const order = orderedPlayers();
  const row = p => {
    const orderIndex = order.findIndex(player => player.id === p.id);
    const turnOrderControls = `<div class="turn-order-controls">
      <span>${orderIndex + 1}</span>
      <button class="text-button" type="button" data-order-player="${p.id}" data-order-direction="-1" aria-label="${t("moveUp")}" title="${t("moveUp")}" ${orderIndex === 0 ? "disabled" : ""}>↑</button>
      <button class="text-button" type="button" data-order-player="${p.id}" data-order-direction="1" aria-label="${t("moveDown")}" title="${t("moveDown")}" ${orderIndex === order.length - 1 ? "disabled" : ""}>↓</button>
    </div>`;
    return `
    <div class="player-row ${p.id === currentPlayerId ? "active" : ""}">
      ${playerToken(p)}
      <div class="player-main">
        <div class="player-name">${escapeHtml(p.name)}</div>
        <div class="player-balance">${money(p.balance)}</div>
      </div>
      ${turnOrderControls}
      <div class="player-actions">
        <button class="button" data-player="${p.id}">${p.id === currentPlayerId ? t("selected") : t("choose")}</button>
        <button class="button danger" data-delete-player="${p.id}">${t("deletePlayer")}</button>
      </div>
    </div>`;
  };

  els.lobbyPlayers.innerHTML = players.length ? order.map(row).join("") : `<div class="empty">${t("noPlayersYet")}</div>`;
  els.gamePlayers.innerHTML = players.length ? order.map(p => renderGamePlayer(p)).join("") : `<div class="empty">${t("noPlayers")}</div>`;

  els.lobbyPlayers.querySelectorAll("[data-player]").forEach(btn => btn.addEventListener("click", () => selectPlayer(btn.dataset.player)));
  els.lobbyPlayers.querySelectorAll("[data-delete-player]").forEach(btn => btn.addEventListener("click", () => deletePlayer(btn.dataset.deletePlayer)));
  els.lobbyPlayers.querySelectorAll("[data-order-player]").forEach(btn => btn.addEventListener("click", () => movePlayerOrder(btn.dataset.orderPlayer, Number(btn.dataset.orderDirection))));
  els.gamePlayers.querySelectorAll("[data-player-ownership]").forEach(details => details.addEventListener("toggle", () => {
    if (details.open) expandedPlayerOwnership.add(details.dataset.playerOwnership);
    else expandedPlayerOwnership.delete(details.dataset.playerOwnership);
  }));
}

function propertiesOwnedBy(playerId) {
  const presetOrder = new Map(PROPERTY_PRESETS.map((preset, index) => [preset.id, index]));
  return properties.filter(property => property.ownerId === playerId).sort((a, b) => {
    const aIndex = presetOrder.get(a.presetId || a.id) ?? Number.MAX_SAFE_INTEGER;
    const bIndex = presetOrder.get(b.presetId || b.id) ?? Number.MAX_SAFE_INTEGER;
    return aIndex - bIndex || propertyDisplayName(a).localeCompare(propertyDisplayName(b), language);
  });
}

function openPropertiesDialog() {
  renderPropertySelect();
  renderProperties();
  if (!els.propertyDialog.open) els.propertyDialog.showModal();
}

// Board shortcuts reuse the existing buying/auction UI and owner rent list.
function openBoardProperty(propertyId) {
  if (diceRollInProgress || !currentPlayerId || !propertyPreset(propertyId)) return;
  const property = properties.find(item => (item.presetId || item.id) === propertyId);
  if (!property) {
    els.propertyPresetSelect.value = propertyId;
    propertyChoicesOpen = false;
    renderPropertySelect();
    renderProperties();
    if (!els.propertyDialog.open) els.propertyDialog.showModal();
    requestAnimationFrame(() => els.propertyPresetToggle.focus({ preventScroll: true }));
    return;
  }
  const owner = players.find(player => player.id === property.ownerId);
  if (!owner) return setStatus("", true, "playerGone");
  expandedPlayerOwnership.add(owner.id);
  renderPlayers();
  const details = [...els.gamePlayers.querySelectorAll("[data-player-ownership]")]
    .find(element => element.dataset.playerOwnership === owner.id);
  const row = details && [...details.querySelectorAll("[data-owned-property]")]
    .find(element => element.dataset.ownedProperty === property.id);
  document.getElementById("boardDialog").close();
  if (details) {
    details.open = true;
    const target = row || details;
    target.classList.add("board-property-highlight");
    target.setAttribute("tabindex", "-1");
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      target.focus({ preventScroll: true });
    });
  }
}

function propertyOwnershipMarkup(property) {
  const data = propertyData(property);
  const houses = Number(property.houses || 0);
  const buildingLabel = houses >= 5 ? t("hotelCount") : houses > 0 ? t("housesCount").replace("{count}", houses) : "";
  const rentDue = propertyRentDue(property);
  return `<div class="owned-property" data-owned-property="${escapeHtml(property.id)}" style="--property-color: ${data.color}" title="${escapeHtml(data.name)}">
    <span class="owned-property-color"></span>
    <span class="owned-property-name">${escapeHtml(data.name)}</span>
    ${buildingLabel ? `<strong>${escapeHtml(buildingLabel)}</strong>` : ""}
    <span class="owned-property-rent"><span>${t("currentRent")}:</span> <strong>${escapeHtml(rentDue)}</strong></span>
    ${property.mortgaged ? `<span class="owned-property-mortgaged">${escapeHtml(t("mortgaged"))}</span>` : ""}
  </div>`;
}

function propertyRentDue(property) {
  const data = propertyData(property);
  if (data.group === "utility") {
    const utilityCount = ownedGroupProperties(property.ownerId, "utility").length;
    const multiplier = utilityCount >= 2 ? 10 : 4;
    const diceTotal = diceLastTotals.get(`${gameId || ""}:${property.ownerId}`);
    return Number.isInteger(diceTotal)
      ? money(multiplier * diceTotal)
      : t("diceRentFormula").replace("{multiplier}", multiplier);
  }
  if (data.group === "station") {
    const stationCount = ownedGroupProperties(property.ownerId, "station").length;
    const rentIndex = Math.max(0, Math.min(stationCount - 1, data.rents.length - 1));
    return data.rents.length ? money(data.rents[rentIndex]) : "-";
  }
  if (!data.rents.length) return "-";
  return money(data.rents[Math.min(Math.max(0, data.houses), data.rents.length - 1)]);
}

function renderGamePlayer(player) {
  const owned = propertiesOwnedBy(player.id);
  const isExpanded = expandedPlayerOwnership.has(player.id);
  const compactMarks = owned.length
    ? owned.slice(0, 12).map(property => {
      const color = propertyData(property).color;
      return `<span class="owned-property-mark" style="--property-color: ${color}" title="${escapeHtml(propertyDisplayName(property))}"></span>`;
    }).join("") + (owned.length > 12 ? `<span class="owned-property-overflow">+${owned.length - 12}</span>` : "")
    : `<span class="no-owned-mark">—</span>`;
  const isTurn = gameData.currentTurnPlayerId === player.id;
  return `<details class="game-player-ownership ${player.id === currentPlayerId ? "active" : ""} ${isTurn ? "turn-player" : ""}" data-player-ownership="${player.id}" ${isExpanded ? "open" : ""}>
    <summary class="game-player-summary">
      ${playerToken(player)}
      <span class="player-main"><span class="player-name">${escapeHtml(player.name)}</span><span class="player-balance">${money(player.balance)}</span></span>
      <span class="owned-property-marks" aria-label="${escapeHtml(t("ownedProperties"))}">${compactMarks}</span>
      ${isTurn ? `<span class="turn-badge">${t("turn")}</span>` : ""}
      <span class="ownership-chevron" aria-hidden="true"></span>
    </summary>
    <div class="player-ownership-details">
      ${owned.length ? owned.map(propertyOwnershipMarkup).join("") : `<div class="empty ownership-empty">${t("noOwnedProperties")}</div>`}
    </div>
  </details>`;
}

async function deletePlayer(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player || !gameId) return;
  if (!confirm(t("deletePlayerConfirm").replace("{name}", player.name))) return;
  setStatus("", false, "deletingPlayer");
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, "games", gameId, "players", playerId));
    const priorOrder = orderedPlayers();
    const remainingPlayers = priorOrder.filter(item => item.id !== playerId);
    remainingPlayers.forEach((item, index) => {
      if (item.turnOrder !== index) batch.update(doc(db, "games", gameId, "players", item.id), { turnOrder: index });
    });
    properties.filter(property => property.ownerId === playerId).forEach(property => {
      batch.delete(doc(db, "games", gameId, "properties", property.id));
    });
    if (gameData.currentTurnPlayerId === playerId) {
      const deletedIndex = priorOrder.findIndex(item => item.id === playerId);
      const nextTurnPlayer = remainingPlayers.length ? remainingPlayers[Math.max(0, Math.min(deletedIndex, remainingPlayers.length - 1))] : null;
      batch.update(doc(db, "games", gameId), {
        currentTurnPlayerId: nextTurnPlayer?.id || null,
        turnNumber: nextTurnPlayer ? Number(gameData.turnNumber || 1) + 1 : 0
      });
    }
    await batch.commit();
    if (playerId === currentPlayerId) {
      currentPlayerId = null;
      localStorage.removeItem("monopolyPlayerId");
      showOnly(els.lobbyView);
    }
    setStatus("", false, "playerDeleted");
  } catch (err) { handleError(err); }
}

function readPrivateMessageIds() {
  if (!gameId || !currentPlayerId) return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(`monopolyReadMessages:${gameId}:${currentPlayerId}`) || "[]"));
  } catch {
    return new Set();
  }
}

function saveReadPrivateMessageIds(readIds) {
  if (!gameId || !currentPlayerId) return;
  localStorage.setItem(`monopolyReadMessages:${gameId}:${currentPlayerId}`, JSON.stringify([...readIds].slice(-600)));
}

function unreadPrivateMessages() {
  const readIds = readPrivateMessageIds();
  return privateMessages.filter(message => message.recipientId === currentPlayerId && message.senderId !== currentPlayerId && !readIds.has(message.id));
}

function renderPrivateMessageBadge() {
  if (!els.privateMessageBadge) return;
  const count = unreadPrivateMessages().length;
  els.privateMessageBadge.textContent = count > 99 ? "99+" : String(count);
  els.privateMessageBadge.classList.toggle("hidden", count === 0);
  els.privateMessagesBtn.setAttribute("aria-label", `${t("privateMessages")}${count ? ` (${count})` : ""}`);
  boardController.sync();
}

function showPrivateMessageToast(senderName) {
  if (!els.messageToast) return;
  els.messageToast.dataset.senderName = senderName;
  renderPrivateMessageToast();
  els.messageToast.classList.remove("hidden");
  if (privateMessageToastTimer) clearTimeout(privateMessageToastTimer);
  privateMessageToastTimer = setTimeout(() => els.messageToast.classList.add("hidden"), 4500);
}

function renderPrivateMessageToast() {
  els.messageToast.textContent = t("newPrivateMessage").replace("{name}", els.messageToast.dataset.senderName || t("player"));
}

function markConversationRead(recipientId) {
  if (!recipientId || !currentPlayerId) return;
  const readIds = readPrivateMessageIds();
  privateMessages.forEach(message => {
    if (message.senderId === recipientId && message.recipientId === currentPlayerId) readIds.add(message.id);
  });
  saveReadPrivateMessageIds(readIds);
  renderPrivateMessageBadge();
}

function privateMessageConversation() {
  const recipientId = els.messageRecipientSelect?.value;
  if (!recipientId || !currentPlayerId) return [];
  return privateMessages.filter(message =>
    (message.senderId === currentPlayerId && message.recipientId === recipientId) ||
    (message.senderId === recipientId && message.recipientId === currentPlayerId)
  );
}

function renderPrivateMessages() {
  if (!els.privateMessageList) return;
  const conversation = privateMessageConversation();
  if (!conversation.length) {
    els.privateMessageList.innerHTML = `<div class="empty">${t("noPrivateMessages")}</div>`;
  } else {
    els.privateMessageList.innerHTML = conversation.map(message => {
      const sender = players.find(player => player.id === message.senderId);
      const isMine = message.senderId === currentPlayerId;
      const reply = message.replyTo;
      return `<article class="private-message ${isMine ? "mine" : "theirs"}">
        <div class="private-message-meta"><strong>${escapeHtml(isMine ? t("you") : (sender?.name || t("player")))}</strong><time>${escapeHtml(formatMessageTime(message.createdAt))}</time></div>
        ${reply ? `<div class="quoted-message"><strong>${escapeHtml(reply.senderName || t("player"))}</strong><span>${escapeHtml(reply.text || "")}</span></div>` : ""}
        <p>${escapeHtml(message.text || "")}</p>
        <button class="text-button" type="button" data-reply-message="${message.id}">${t("reply")}</button>
      </article>`;
    }).join("");
  }
  els.privateMessageList.querySelectorAll("[data-reply-message]").forEach(button => button.addEventListener("click", () => beginMessageReply(button.dataset.replyMessage)));
  renderReplyContext();
  els.privateMessageList.scrollTop = els.privateMessageList.scrollHeight;
}

function formatMessageTime(timestamp) {
  if (!timestamp?.toDate) return "";
  return new Intl.DateTimeFormat(language === "fi" ? "fi-FI" : "en", { hour: "2-digit", minute: "2-digit" }).format(timestamp.toDate());
}

function renderReplyContext() {
  if (!els.replyContext) return;
  if (!replyToMessage) {
    els.replyContext.classList.add("hidden");
    els.replyContext.textContent = "";
    els.cancelReplyBtn.classList.add("hidden");
    return;
  }
  els.replyContext.classList.remove("hidden");
  const senderName = replyToMessage.senderId === currentPlayerId ? t("you")
    : (replyToMessage.senderName || t("player"));
  els.replyContext.textContent = `${t("replyTo")}: ${senderName} — ${replyToMessage.text}`;
  els.cancelReplyBtn.classList.remove("hidden");
}

function beginMessageReply(messageId) {
  const message = privateMessageConversation().find(item => item.id === messageId);
  if (!message) return;
  const sender = players.find(player => player.id === message.senderId);
  replyToMessage = {
    messageId: message.id,
    senderId: message.senderId,
    senderName: message.senderId === currentPlayerId ? t("you") : (sender?.name || t("player")),
    text: String(message.text || "").slice(0, 180)
  };
  renderReplyContext();
  els.privateMessageText.focus();
}

function openPrivateMessages() {
  const recipients = players.filter(player => player.id !== currentPlayerId);
  if (!recipients.length) return setStatus("", true, "chooseAnotherPlayer");
  const previousRecipient = els.messageRecipientSelect.value;
  els.messageRecipientSelect.innerHTML = recipients.map(player => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  if (recipients.some(player => player.id === previousRecipient)) els.messageRecipientSelect.value = previousRecipient;
  replyToMessage = null;
  markConversationRead(els.messageRecipientSelect.value);
  renderPrivateMessages();
  if (!els.privateMessagesDialog.open) els.privateMessagesDialog.showModal();
}

async function sendPrivateMessage(event) {
  event.preventDefault();
  const text = els.privateMessageText.value.trim();
  const recipientId = els.messageRecipientSelect.value;
  if (!text || !recipientId || !currentPlayerId || !gameId) return;
  const recipient = players.find(player => player.id === recipientId);
  if (!recipient) return setStatus("", true, "playerGone");
  try {
    await addDoc(collection(db, "games", gameId, "privateMessages"), {
      senderId: currentPlayerId,
      recipientId,
      text,
      replyTo: replyToMessage,
      createdAt: serverTimestamp()
    });
    els.privateMessageText.value = "";
    replyToMessage = null;
    renderReplyContext();
  } catch (err) { handleError(err); }
}

function playerToken(player) {
  const icon = PLAYER_ICONS.find(option => option.id === player.icon) || PLAYER_ICONS[0];
  const color = PLAYER_COLORS.some(option => option.value === player.color) ? player.color : "#6f7a71";
  return `<div class="player-token" style="--player-color: ${color}" title="${escapeHtml(iconLabel(icon))}" aria-hidden="true">${playerIconSvg(icon.id)}</div>`;
}

function playerIconSvg(iconId) {
  const icons = {

    // CLASSIC CAR
    car: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- body -->
          <path d="M8 38
                   C8 34 11 31 15 30
                   L20 22
                   C21.5 19.5 24 18 27 18
                   H39
                   C42 18 44.5 19.5 46 22
                   L51 30
                   C55 31 57 34 57 38
                   V46
                   H52
                   C51 51 48 54 43 54
                   C38 54 35 51 34 46
                   H29
                   C28 51 25 54 20 54
                   C15 54 12 51 11 46
                   H8
                   Z"/>
          <!-- windows -->
          <path d="M23 24
                   C24 22.5 25.5 22 27.5 22
                   H31
                   V30
                   H19
                   Z"
                opacity=".35"/>
          <path d="M34 22
                   H38.5
                   C40.5 22 42 23 43 24.5
                   L46 30
                   H34
                   Z"
                opacity=".35"/>
        </g>

        <g fill="#111" opacity=".35">
          <circle cx="20" cy="46" r="5"/>
          <circle cx="44" cy="46" r="5"/>
        </g>

        <g fill="currentColor">
          <circle cx="20" cy="46" r="2.5"/>
          <circle cx="44" cy="46" r="2.5"/>
        </g>
      </svg>
    `,

    // TOP HAT
    hat: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <path d="M21 13
                   C21 10 24 8 32 8
                   C40 8 43 10 43 13
                   L46 39
                   C42 42 22 42 18 39
                   Z"/>
          <ellipse cx="32" cy="39" rx="14" ry="4"/>
          <path d="M8 41
                   C13 38 20 37 32 37
                   C44 37 51 38 56 41
                   C55 48 47 52 32 52
                   C17 52 9 48 8 41Z"/>
        </g>

        <path d="M19 33
                 C26 35 38 35 45 33
                 L46 39
                 C40 42 24 42 18 39Z"
              fill="#111"
              opacity=".22"/>
      </svg>
    `,

    // BATTLESHIP
    ship: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- hull -->
          <path d="M7 40
                   H57
                   L50 51
                   C45 54 19 54 14 51
                   Z"/>

          <!-- deck -->
          <rect x="15" y="34" width="34" height="6" rx="1"/>

          <!-- center tower -->
          <rect x="27" y="22" width="10" height="12" rx="1"/>
          <rect x="29" y="16" width="6" height="7" rx="1"/>

          <!-- chimney -->
          <rect x="39" y="25" width="5" height="9"/>

          <!-- front gun -->
          <rect x="44" y="29" width="10" height="3" rx="1"/>
          <circle cx="44" cy="30.5" r="3"/>

          <!-- rear gun -->
          <rect x="10" y="29" width="10" height="3" rx="1"/>
          <circle cx="20" cy="30.5" r="3"/>

          <!-- mast -->
          <rect x="31" y="8" width="2" height="11"/>
          <path d="M33 10 L42 13 L33 16 Z"/>
        </g>

        <path d="M12 47 H52"
              fill="none"
              stroke="#111"
              stroke-width="2"
              opacity=".25"/>
      </svg>
    `,

    // CLASSIC BOOT / SHOE
    shoe: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <path d="M15 13
                   H36
                   C35 21 34 27 36 32
                   C39 37 45 39 53 40
                   C57 41 59 44 58 48
                   C57 52 54 54 49 54
                   H13
                   C9 54 7 52 7 49
                   V44
                   C15 42 19 39 20 34
                   C21 29 18 21 15 13Z"/>

          <path d="M10 48
                   H56
                   C56 52 53 55 48 55
                   H14
                   C10 55 8 53 8 50Z"/>
        </g>

        <g fill="#111" opacity=".25">
          <rect x="20" y="22" width="14" height="2" rx="1"/>
          <rect x="20" y="27" width="14" height="2" rx="1"/>
          <rect x="19" y="32" width="15" height="2" rx="1"/>
        </g>
      </svg>
    `,

    // SCOTTIE DOG
    dog: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- body -->
          <path d="M18 31
                   C23 26 34 25 41 29
                   L46 25
                   L51 27
                   L55 34
                   L51 39
                   L45 38
                   L42 43
                   V52
                   H36
                   L35 44
                   H24
                   L23 52
                   H17
                   L16 42
                   C12 39 10 34 11 29
                   L16 34
                   Z"/>

          <!-- head -->
          <path d="M42 22
                   C45 18 51 18 54 22
                   L59 20
                   L57 28
                   C60 31 59 36 56 39
                   C52 42 45 40 42 36
                   Z"/>

          <!-- ear -->
          <path d="M47 20
                   L44 12
                   L51 16
                   L55 12
                   L54 22Z"/>
        </g>

        <circle cx="53" cy="28" r="1.4" fill="#111"/>
      </svg>
    `,

    // CAT
    cat: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- tail -->
          <path d="M43 42
                   C53 41 57 35 55 29
                   C54 25 50 24 48 27
                   C53 29 52 35 47 36
                   C45 36 43 36 41 35Z"/>

          <!-- body -->
          <path d="M21 30
                   C17 34 16 42 18 49
                   H25
                   L27 42
                   H37
                   L39 49
                   H46
                   C47 39 44 31 39 27
                   Z"/>

          <!-- head -->
          <path d="M20 16
                   L26 20
                   C30 18 34 18 38 20
                   L44 16
                   L43 29
                   C40 34 24 34 21 29
                   Z"/>

          <!-- feet -->
          <ellipse cx="22" cy="50" rx="6" ry="3"/>
          <ellipse cx="42" cy="50" rx="6" ry="3"/>
        </g>

        <g fill="#111" opacity=".45">
          <circle cx="27" cy="25" r="1.3"/>
          <circle cx="37" cy="25" r="1.3"/>
          <path d="M30 28 Q32 30 34 28 Q32 33 30 28Z"/>
        </g>
      </svg>
    `,

    // CLASSIC IRON
    iron: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- iron body -->
          <path d="M9 46
                   C15 35 25 27 42 25
                   C49 24 54 29 57 37
                   L58 46
                   Z"/>

          <!-- handle -->
          <path d="M24 27
                   C25 18 30 14 38 14
                   C46 14 50 18 51 26
                   L44 27
                   C43 22 41 20 37 20
                   C33 20 31 22 31 27
                   Z"/>

          <!-- sole -->
          <path d="M7 46 H59
                   C59 51 56 54 51 54
                   H13
                   C9 54 7 51 7 46Z"/>
        </g>

        <path d="M17 43
                 C25 34 35 30 48 30"
              fill="none"
              stroke="#111"
              stroke-width="2"
              opacity=".20"/>
      </svg>
    `,

    // THIMBLE
    thimble: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <g fill="currentColor">
          <!-- main body -->
          <path d="M18 22
                   C18 14 24 10 32 10
                   C40 10 46 14 46 22
                   L42 49
                   H22
                   Z"/>

          <!-- rim -->
          <path d="M19 46
                   H45
                   L47 52
                   C42 55 22 55 17 52
                   Z"/>
        </g>

        <!-- thimble dimples -->
        <g fill="#111" opacity=".24">
          <circle cx="25" cy="20" r="1.5"/>
          <circle cx="32" cy="18" r="1.5"/>
          <circle cx="39" cy="20" r="1.5"/>

          <circle cx="23" cy="27" r="1.5"/>
          <circle cx="30" cy="26" r="1.5"/>
          <circle cx="37" cy="27" r="1.5"/>
          <circle cx="43" cy="27" r="1.5"/>

          <circle cx="24" cy="34" r="1.5"/>
          <circle cx="32" cy="33" r="1.5"/>
          <circle cx="40" cy="34" r="1.5"/>

          <circle cx="25" cy="41" r="1.5"/>
          <circle cx="32" cy="40" r="1.5"/>
          <circle cx="39" cy="41" r="1.5"/>
        </g>
      </svg>
    `
  };

  return icons[iconId] || icons.car;
}

function renderCurrentPlayer() {
  const player = players.find(p => p.id === currentPlayerId);
  if (!player) {
    els.currentPlayerName.textContent = t("player");
    if (currentPlayerId && players.length) {
      currentPlayerId = null;
      localStorage.removeItem("monopolyPlayerId");
      showOnly(els.lobbyView);
    }
    return;
  }
  els.currentPlayerName.textContent = player.name;
  els.currentBalance.textContent = money(player.balance);
}

function openMoneyDialog(mode) {
  const me = players.find(p => p.id === currentPlayerId);
  if (!me) return;
  moneyMode = mode;
  els.moneyForm.reset();
  els.recipientWrap.classList.add("hidden");
  if (mode === "player") {
    const others = players.filter(p => p.id !== currentPlayerId);
    if (!others.length) {
      moneyMode = null;
      updateMoneyDialogTitle();
      return setStatus("", true, "addOtherPlayer");
    }
    renderMoneyRecipients();
    els.recipientWrap.classList.remove("hidden");
  }
  updateMoneyDialogTitle();
  els.moneyDialog.showModal();
}

function updateMoneyDialogTitle() {
  if (!els.moneyDialogTitle) return;
  if (moneyMode === "player") els.moneyDialogTitle.textContent = t("payAnotherPlayer");
  else if (moneyMode === "bank-pay") els.moneyDialogTitle.textContent = t("payBank");
  else if (moneyMode === "bank-receive") els.moneyDialogTitle.textContent = t("receiveFromBank");
  else if (moneyMode === "free-parking-pay") els.moneyDialogTitle.textContent = t("payFreeParking");
  else els.moneyDialogTitle.textContent = t("payment");
}

function renderMoneyRecipients() {
  const selectedRecipient = els.recipientSelect.value;
  const recipients = players.filter(player => player.id !== currentPlayerId);
  els.recipientSelect.innerHTML = recipients.map(player => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  if (recipients.some(player => player.id === selectedRecipient)) els.recipientSelect.value = selectedRecipient;
}

function closeMoneyDialog() {
  els.moneyDialog.close("cancel");
  els.moneyForm.reset();
  moneyMode = null;
}

async function handleMoneySubmit(event) {
  event.preventDefault();
  const amount = Number(els.moneyAmount.value);
  const reason = els.moneyReason.value.trim() || defaultReasonForMode(moneyMode);
  if (!Number.isFinite(amount) || amount <= 0) return;
  try {
    if (moneyMode === "player") await transferBetweenPlayers(currentPlayerId, els.recipientSelect.value, amount, reason);
    if (moneyMode === "bank-pay") await bankTransaction(currentPlayerId, -amount, reason, "bank-payment");
    if (moneyMode === "bank-receive") await bankTransaction(currentPlayerId, amount, reason, "bank-receive");
    if (moneyMode === "free-parking-pay") await freeParkingPayment(currentPlayerId, amount, reason);
    els.moneyDialog.close();
    moneyMode = null;
    setStatus("", false, "transactionCompleted");
  } catch (err) { handleError(err); }
}

function defaultReasonForMode(mode) {
  if (mode === "player") return t("defaultPlayerPayment");
  if (mode === "bank-pay") return t("defaultBankPayment");
  if (mode === "free-parking-pay") return t("defaultFreeParkingPayment");
  return t("defaultBankReceive");
}

async function freeParkingPayment(playerId, amount, reason) {
  const gameRef = doc(db, "games", gameId);
  const playerRef = doc(db, "games", gameId, "players", playerId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  await runTransaction(db, async tx => {
    const gameSnap = await tx.get(gameRef);
    const playerSnap = await tx.get(playerRef);
    if (!playerSnap.exists()) throw new Error(t("playerGone"));
    const balance = Number(playerSnap.data().balance || 0);
    if (balance < amount) throw new Error(t("notEnoughPayment"));
    const pot = Number(gameSnap.data()?.freeParkingPot || 0);
    tx.update(playerRef, { balance: balance - amount });
    tx.update(gameRef, { freeParkingPot: pot + amount });
    tx.set(txRef, { type: "free-parking-pay", fromId: playerId, toId: "free-parking", amount, reason, createdAt: serverTimestamp(), reversed: false });
  });
  setStatus("", false, "freeParkingPaid");
}

async function claimFreeParking() {
  if (!currentPlayerId || !gameId) return;
  const currentPot = Number(gameData.freeParkingPot || 0);
  if (currentPot <= 0) return setStatus("", true, "freeParkingEmpty");
  if (!confirm(t("claimFreeParkingConfirm").replace("{amount}", money(currentPot)))) return;
  const gameRef = doc(db, "games", gameId);
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      const playerSnap = await tx.get(playerRef);
      if (!playerSnap.exists()) throw new Error(t("playerGone"));
      const pot = Number(gameSnap.data()?.freeParkingPot || 0);
      if (pot <= 0) throw new Error(t("freeParkingEmpty"));
      tx.update(playerRef, { balance: Number(playerSnap.data().balance || 0) + pot });
      tx.update(gameRef, { freeParkingPot: 0 });
      tx.set(txRef, { type: "free-parking-claim", fromId: "free-parking", toId: currentPlayerId, amount: pot, reason: t("defaultFreeParkingClaim"), createdAt: serverTimestamp(), reversed: false });
    });
    setStatus("", false, "freeParkingClaimed");
  } catch (err) { handleError(err); }
}

async function transferBetweenPlayers(fromId, toId, amount, reason) {
  const fromRef = doc(db, "games", gameId, "players", fromId);
  const toRef = doc(db, "games", gameId, "players", toId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  await runTransaction(db, async tx => {
    const fromSnap = await tx.get(fromRef);
    const toSnap = await tx.get(toRef);
    if (!fromSnap.exists() || !toSnap.exists()) throw new Error(t("playerGone"));
    const fromBalance = Number(fromSnap.data().balance || 0);
    const toBalance = Number(toSnap.data().balance || 0);
    if (fromBalance < amount) throw new Error(t("notEnoughPayment"));
    tx.update(fromRef, { balance: fromBalance - amount });
    tx.update(toRef, { balance: toBalance + amount });
    tx.set(txRef, { type: "player-transfer", fromId, toId, amount, reason, createdAt: serverTimestamp(), reversed: false });
  });
}

async function bankTransaction(playerId, delta, reason, type) {
  const playerRef = doc(db, "games", gameId, "players", playerId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  await runTransaction(db, async tx => {
    const snap = await tx.get(playerRef);
    if (!snap.exists()) throw new Error(t("playerGone"));
    const oldBalance = Number(snap.data().balance || 0);
    const next = oldBalance + delta;
    if (next < 0) throw new Error(t("notEnoughPayment"));
    tx.update(playerRef, { balance: next });
    tx.set(txRef, {
      type, fromId: delta < 0 ? playerId : "bank", toId: delta > 0 ? playerId : "bank",
      amount: Math.abs(delta), reason, createdAt: serverTimestamp(), reversed: false
    });
  });
}

function renderTransactions() {
  const me = currentPlayerId;
  const playerName = id => id === "bank" ? t("bank") : id === "free-parking" ? t("claimFreeParking")
    : (players.find(p => p.id === id)?.name || t("player"));
  if (!transactions.length) {
    els.transactionList.innerHTML = `<div class="empty">${t("noTransactionsYet")}</div>`;
    return;
  }
  els.transactionList.innerHTML = transactions.map(transaction => {
    const reversed = transaction.reversed ? ` · ${t("undone")}` : "";
    let sign = ""; let cls = "neutral";
    if (transaction.toId === me) { sign = "+"; cls = "plus"; }
    else if (transaction.fromId === me) { sign = "−"; cls = "minus"; }
    const from = playerName(transaction.fromId); const to = playerName(transaction.toId);
    return `<div class="transaction">
      <div><strong>${escapeHtml(transaction.reason || t("transaction"))}</strong><div class="tx-note">${escapeHtml(from)} → ${escapeHtml(to)}${reversed}</div></div>
      <div class="amount ${cls}">${sign}${money(transaction.amount)}</div>
    </div>`;
  }).join("");
}

async function undoLastTransaction() {
  const transaction = transactions.find(x => !x.reversed && x.fromId && x.toId && (Number(x.amount) > 0 || (x.type === "property-sale" && Number(x.amount) === 0)));
  if (!transaction) return setStatus("", true, "noUndo");
  try {
    const txRef = doc(db, "games", gameId, "transactions", transaction.id);
    await runTransaction(db, async tx => {
      const latest = await tx.get(txRef);
      if (!latest.exists() || latest.data().reversed) throw new Error(t("alreadyUndone"));
      const data = latest.data();
      const refs = {};
      if (data.fromId === "free-parking" || data.toId === "free-parking") refs.game = doc(db, "games", gameId);
      if (data.fromId !== "bank") refs.from = doc(db, "games", gameId, "players", data.fromId);
      if (data.toId !== "bank") refs.to = doc(db, "games", gameId, "players", data.toId);
      if (data.propertyId) refs.property = doc(db, "games", gameId, "properties", data.propertyId);
      if (data.fromId === "free-parking") delete refs.from;
      if (data.toId === "free-parking") delete refs.to;
      const gameSnap = refs.game ? await tx.get(refs.game) : null;
      const fromSnap = refs.from ? await tx.get(refs.from) : null;
      const toSnap = refs.to ? await tx.get(refs.to) : null;
      const propertySnap = refs.property ? await tx.get(refs.property) : null;
      if ((refs.from && !fromSnap.exists()) || (refs.to && !toSnap.exists())) throw new Error(t("playerGone"));
      if (refs.property && !propertySnap.exists()) throw new Error(t("propertyGone"));
      if (refs.to && Number(toSnap.data().balance || 0) < Number(data.amount)) throw new Error(t("cannotUndo"));
      if (refs.from) tx.update(refs.from, { balance: Number(fromSnap.data().balance || 0) + Number(data.amount) });
      if (refs.to) tx.update(refs.to, { balance: Number(toSnap.data().balance || 0) - Number(data.amount) });
      if (data.type === "free-parking-pay" && refs.game) tx.update(refs.game, { freeParkingPot: Math.max(0, Number(gameSnap.data()?.freeParkingPot || 0) - Number(data.amount)) });
      if (data.type === "free-parking-claim" && refs.game) tx.update(refs.game, { freeParkingPot: Number(gameSnap.data()?.freeParkingPot || 0) + Number(data.amount) });
      if (data.type === "property-buy" && refs.property) tx.delete(refs.property);
      if (data.type === "mortgage" && refs.property) tx.update(refs.property, { mortgaged: false });
      if (data.type === "unmortgage" && refs.property) tx.update(refs.property, { mortgaged: true });
      if (data.type === "property-sale" && refs.property) tx.update(refs.property, { ownerId: data.toId });
      if (data.type === "property-auction" && refs.property) tx.delete(refs.property);
      if (data.type === "house-buy" && refs.property) tx.update(refs.property, { houses: Math.max(0, Number(propertySnap.data().houses || 0) - 1) });
      if (data.type === "house-sell" && refs.property) tx.update(refs.property, { houses: Math.min(5, Number(propertySnap.data().houses || 0) + 1) });
      tx.update(txRef, { reversed: true, reversedAt: serverTimestamp() });
    });
    setStatus("", false, "lastUndone");
  } catch (err) { handleError(err); }
}

function propertyPreset(presetId) {
  return PROPERTY_PRESETS.find(preset => preset.id === presetId) || null;
}

function propertyDisplayName(property) {
  const preset = propertyPreset(property.presetId || property.id);
  if (preset) return preset.name[language] || preset.name.en;
  return property.name || t("propertyName");
}

function propertyData(property) {
  const preset = propertyPreset(property.presetId || property.id);
  return {
    name: preset ? (preset.name[language] || preset.name.en) : (property.name || t("propertyName")),
    price: Number(preset?.price ?? property.price ?? 0),
    mortgageValue: Number(preset?.mortgageValue ?? property.mortgageValue ?? 0),
    color: preset?.color || property.color || "#dce3dc",
    group: preset?.group || property.group || "custom",
    canBuild: Boolean(preset?.canBuild ?? property.canBuild),
    houseCost: Number(preset?.houseCost ?? property.houseCost ?? 0),
    rents: preset?.rents || property.rents || [],
    houses: Number(property.houses || 0)
  };
}

function propertyGroupLabel(group) {
  const key = `group_${group}`;
  // Unknown legacy/custom group names are data, not translation keys.
  return Object.hasOwn(translations.en, key) ? t(key) : group;
}

function groupPresetIds(group) {
  return PROPERTY_PRESETS.filter(preset => preset.group === group).map(preset => preset.id);
}

function ownedGroupProperties(ownerId, group) {
  const groupIds = new Set(groupPresetIds(group));
  return properties.filter(property => property.ownerId === ownerId && groupIds.has(property.presetId || property.id));
}

function ownsFullGroup(ownerId, group) {
  const groupIds = groupPresetIds(group);
  if (!groupIds.length) return false;
  const ownedIds = new Set(ownedGroupProperties(ownerId, group).map(property => property.presetId || property.id));
  return groupIds.every(id => ownedIds.has(id));
}

function propertyChoiceMarkup(preset, showArrow = false) {
  const name = preset.name[language] || preset.name.en;
  return `<span class="property-choice-swatch" style="--property-color: ${preset.color}"></span>
      <span>${escapeHtml(name)}</span>
      <strong>${money(preset.price)}</strong>
      ${showArrow ? `<span class="property-choice-arrow">${propertyChoicesOpen ? "▲" : "▼"}</span>` : ""}`;
}

function renderPropertySelect() {
  if (!els.propertyPresetSelect || !els.propertyPresetToggle || !els.propertyPresetChoices) return;
  const ownedPresetIds = new Set(properties.map(property => property.presetId || property.id));
  const available = PROPERTY_PRESETS.filter(preset => !ownedPresetIds.has(preset.id));
  if (!available.length) {
    els.propertyPresetSelect.value = "";
    els.propertyPresetToggle.disabled = true;
    els.propertyPresetToggle.innerHTML = `<span></span><span>${t("noAvailableProperties")}</span><strong></strong><span class="property-choice-arrow">▼</span>`;
    els.propertyPresetChoices.innerHTML = `<div class="empty">${t("noAvailableProperties")}</div>`;
    els.propertyPresetChoices.classList.add("hidden");
    return;
  }
  if (!available.some(preset => preset.id === els.propertyPresetSelect.value)) els.propertyPresetSelect.value = available[0].id;
  els.propertyPresetToggle.disabled = false;
  const selectedPreset = available.find(preset => preset.id === els.propertyPresetSelect.value) || available[0];
  els.propertyPresetToggle.innerHTML = propertyChoiceMarkup(selectedPreset, true);
  els.propertyPresetToggle.style.setProperty("--property-color", selectedPreset.color);
  els.propertyPresetChoices.classList.toggle("hidden", !propertyChoicesOpen);
  els.propertyPresetChoices.innerHTML = available.map(preset => {
    const selected = preset.id === els.propertyPresetSelect.value;
    return `<button class="property-choice ${selected ? "selected" : ""}" type="button" data-property-choice="${preset.id}" style="--property-color: ${preset.color}">
      ${propertyChoiceMarkup(preset)}
    </button>`;
  }).join("");
  els.propertyPresetChoices.querySelectorAll("[data-property-choice]").forEach(btn => btn.addEventListener("click", () => {
    els.propertyPresetSelect.value = btn.dataset.propertyChoice;
    propertyChoicesOpen = false;
    renderPropertySelect();
  }));
}

async function addProperty(event) {
  event.preventDefault();
  const preset = propertyPreset(els.propertyPresetSelect.value);
  if (!preset) return setStatus("", true, "propertyUnavailable");
  const name = preset.name[language] || preset.name.en;
  const price = Number(preset.price || 0);
  const mortgageValue = Number(preset.mortgageValue || 0);
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const propertyRef = doc(db, "games", gameId, "properties", preset.id);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const playerSnap = await tx.get(playerRef);
      const propertySnap = await tx.get(propertyRef);
      if (propertySnap.exists()) throw new Error(t("propertyUnavailable"));
      const balance = Number(playerSnap.data().balance || 0);
      if (balance < price) throw new Error(t("notEnoughProperty"));
      tx.update(playerRef, { balance: balance - price });
      tx.set(propertyRef, {
        presetId: preset.id,
        name,
        ownerId: currentPlayerId,
        price,
        mortgageValue,
        color: preset.color,
        group: preset.group,
        canBuild: preset.canBuild,
        houseCost: preset.houseCost,
        rents: preset.rents,
        mortgaged: false,
        houses: 0,
        createdAt: serverTimestamp()
      });
      if (price > 0) tx.set(txRef, { type: "property-buy", fromId: currentPlayerId, toId: "bank", amount: price, reason: `${t("bought")} ${name}`, propertyId: propertyRef.id, createdAt: serverTimestamp(), reversed: false });
    });
    els.addPropertyForm.reset();
    renderPropertySelect();
  } catch (err) { handleError(err); }
}

function renderProperties() {
  const mine = propertiesOwnedBy(currentPlayerId);
  if (!mine.length) {
    els.propertyList.innerHTML = `<div class="empty">${t("noPropertiesYet")}</div>`;
    return;
  }
  els.propertyList.innerHTML = mine.map(p => {
    const data = propertyData(p);
    const detailsOpen = openPropertyDetails.has(p.id);
    return `<div class="property-item ${p.mortgaged ? "mortgaged" : ""}" style="--property-color: ${data.color}">
    <div class="property-title"><strong>${escapeHtml(data.name)}</strong><span>${escapeHtml(propertyGroupLabel(data.group))}</span></div>
    <div class="tx-note">${t("purchase")} ${money(data.price)} · ${t("mortgage")} ${money(data.mortgageValue)}${p.mortgaged ? ` · ${t("mortgaged")}` : ""}</div>
    <div class="property-details ${detailsOpen ? "" : "hidden"}" data-property-details="${p.id}">
      <div>${t("group")}: ${escapeHtml(propertyGroupLabel(data.group))}</div>
      <div>${data.canBuild ? `${t("housePrice")}: ${money(data.houseCost)} · ${t("houses")}: ${data.houses === 5 ? t("hotel") : data.houses}` : t("noHouses")}</div>
      ${propertyRentRows(data, p)}
    </div>
    <div class="property-actions">
      <button class="button" data-details-property="${p.id}">${t("details")}</button>
      <button class="button" data-mortgage="${p.id}">${p.mortgaged ? t("unmortgage") : t("mortgage")}</button>
      ${data.canBuild ? `<button class="button" data-buy-house="${p.id}">${t("buyHouse")}</button><button class="button" data-sell-house="${p.id}">${t("sellHouse")}</button>` : ""}
      <button class="button" data-sell-property="${p.id}">${t("sell")}</button>
      <button class="button danger" data-return-property="${p.id}">${t("returnToBank")}</button>
    </div>
  </div>`;
  }).join("");
  els.propertyList.querySelectorAll("[data-details-property]").forEach(btn => btn.addEventListener("click", () => togglePropertyDetails(btn.dataset.detailsProperty)));
  els.propertyList.querySelectorAll("[data-mortgage]").forEach(btn => btn.addEventListener("click", () => toggleMortgage(btn.dataset.mortgage)));
  els.propertyList.querySelectorAll("[data-buy-house]").forEach(btn => btn.addEventListener("click", () => changeHouseCount(btn.dataset.buyHouse, 1)));
  els.propertyList.querySelectorAll("[data-sell-house]").forEach(btn => btn.addEventListener("click", () => changeHouseCount(btn.dataset.sellHouse, -1)));
  els.propertyList.querySelectorAll("[data-sell-property]").forEach(btn => btn.addEventListener("click", () => openPropertySaleDialog(btn.dataset.sellProperty)));
  els.propertyList.querySelectorAll("[data-return-property]").forEach(btn => btn.addEventListener("click", () => returnPropertyToBank(btn.dataset.returnProperty)));
}

function propertyRentRows(data, property) {
  if (data.group === "utility") return utilityRentRows(property);
  if (!data.rents.length) return `<div>${t("rent")}: -</div>`;
  const activeIndex = data.canBuild ? Math.min(data.houses, data.rents.length - 1) : Math.min(ownedGroupProperties(property.ownerId, data.group).length - 1, data.rents.length - 1);
  return `<div class="rent-grid">${data.rents.map((rent, index) => `<div class="rent-row ${index === activeIndex ? "active" : ""}"><span>${rentLabel(index)}</span><strong>${money(rent)}</strong></div>`).join("")}</div>`;
}

function utilityRentRows(property) {
  const ownedUtilities = ownedGroupProperties(property.ownerId, "utility").length;
  return `<div class="utility-rents">
    <div class="rent-row ${ownedUtilities < 2 ? "active" : ""}">${t("utilityRentOne")}</div>
    <div class="rent-row ${ownedUtilities >= 2 ? "active" : ""}">${t("utilityRentBoth")}</div>
  </div>`;
}

function rentLabel(index) {
  if (index === 0) return t("rent");
  if (index === 5) return t("hotel");
  return `${index} ${t("houses")}`;
}

function togglePropertyDetails(propertyId) {
  const details = els.propertyList.querySelector(`[data-property-details="${CSS.escape(propertyId)}"]`);
  if (!details) return;
  details.classList.toggle("hidden");
  if (details.classList.contains("hidden")) openPropertyDetails.delete(propertyId);
  else openPropertyDetails.add(propertyId);
}

function validateHouseChange(property, direction) {
  const data = propertyData(property);
  if (!data.canBuild) return t("noHouses");
  if (!ownsFullGroup(currentPlayerId, data.group)) return t("mustOwnGroup");
  const group = ownedGroupProperties(currentPlayerId, data.group);
  if (direction > 0) {
    if (data.houses >= 5) return t("maxHouses");
    const minHouses = Math.min(...group.map(item => Number(item.houses || 0)));
    if (data.houses > minHouses) return t("evenBuild");
  } else {
    if (data.houses <= 0) return t("noHouseToSell");
    const maxHouses = Math.max(...group.map(item => Number(item.houses || 0)));
    if (data.houses < maxHouses) return t("evenSell");
  }
  return "";
}

async function changeHouseCount(propertyId, direction) {
  const property = properties.find(p => p.id === propertyId && p.ownerId === currentPlayerId);
  if (!property) return setStatus("", true, "propertyGone");
  const validationError = validateHouseChange(property, direction);
  if (validationError) return setStatus(validationError, true);
  const data = propertyData(property);
  const amount = Number(data.houseCost || 0);
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const propertyRef = doc(db, "games", gameId, "properties", propertyId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const playerSnap = await tx.get(playerRef);
      const propertySnap = await tx.get(propertyRef);
      if (!playerSnap.exists()) throw new Error(t("playerGone"));
      if (!propertySnap.exists()) throw new Error(t("propertyGone"));
      const latestProperty = { id: propertyId, ...propertySnap.data() };
      const latestError = validateHouseChange(latestProperty, direction);
      if (latestError) throw new Error(latestError);
      const balance = Number(playerSnap.data().balance || 0);
      const currentHouses = Number(propertySnap.data().houses || 0);
      if (direction > 0) {
        if (balance < amount) throw new Error(t("notEnoughPayment"));
        tx.update(playerRef, { balance: balance - amount });
        tx.update(propertyRef, { houses: currentHouses + 1 });
        tx.set(txRef, { type: "house-buy", fromId: currentPlayerId, toId: "bank", amount, reason: `${t("buyHouse")} ${data.name}`, propertyId, createdAt: serverTimestamp(), reversed: false });
      } else {
        tx.update(playerRef, { balance: balance + amount });
        tx.update(propertyRef, { houses: currentHouses - 1 });
        tx.set(txRef, { type: "house-sell", fromId: "bank", toId: currentPlayerId, amount, reason: `${t("sellHouse")} ${data.name}`, propertyId, createdAt: serverTimestamp(), reversed: false });
      }
    });
    setStatus("", false, direction > 0 ? "houseBought" : "houseSold");
  } catch (err) { handleError(err); }
}

function closePropertySaleDialog() {
  propertySaleId = null;
  els.propertySaleForm.reset();
  els.propertySaleDialog.close("cancel");
}

function updatePropertySaleTitle() {
  const property = properties.find(item => item.id === propertySaleId);
  els.propertySaleTitle.textContent = property
    ? `${t("sellProperty")}: ${propertyDisplayName(property)}` : t("sellProperty");
}

function openPropertySaleDialog(propertyId) {
  const property = properties.find(p => p.id === propertyId && p.ownerId === currentPlayerId);
  if (!property) return setStatus("", true, "propertyGone");
  const buyers = players.filter(player => player.id !== currentPlayerId);
  if (!buyers.length) return setStatus("", true, "noBuyerAvailable");
  propertySaleId = propertyId;
  updatePropertySaleTitle();
  els.propertyBuyerSelect.innerHTML = buyers.map(player => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  els.propertySaleAmount.value = "";
  els.propertySaleDialog.showModal();
}

async function sellProperty(event) {
  event.preventDefault();
  const propertyId = propertySaleId;
  const buyerId = els.propertyBuyerSelect.value;
  const rawAmount = els.propertySaleAmount.value.trim();
  const amount = rawAmount === "" ? 0 : Number(rawAmount);
  if (!propertyId || !buyerId || !Number.isFinite(amount) || amount < 0) return;
  const propertyRef = doc(db, "games", gameId, "properties", propertyId);
  const sellerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const buyerRef = doc(db, "games", gameId, "players", buyerId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const propertySnap = await tx.get(propertyRef);
      const sellerSnap = await tx.get(sellerRef);
      const buyerSnap = await tx.get(buyerRef);
      if (!propertySnap.exists()) throw new Error(t("propertyGone"));
      if (!sellerSnap.exists() || !buyerSnap.exists()) throw new Error(t("playerGone"));
      const property = propertySnap.data();
      if (property.ownerId !== currentPlayerId) throw new Error(t("notYourProperty"));
      const buyerBalance = Number(buyerSnap.data().balance || 0);
      if (buyerBalance < amount) throw new Error(t("notEnoughPayment"));
      tx.update(buyerRef, { balance: buyerBalance - amount });
      tx.update(sellerRef, { balance: Number(sellerSnap.data().balance || 0) + amount });
      tx.update(propertyRef, { ownerId: buyerId });
      tx.set(txRef, {
        type: "property-sale",
        fromId: buyerId,
        toId: currentPlayerId,
        amount,
        reason: `${t(amount === 0 ? "given" : "sell")} ${propertyDisplayName({ id: propertyId, ...property })}`,
        propertyId,
        createdAt: serverTimestamp(),
        reversed: false
      });
    });
    closePropertySaleDialog();
    setStatus("", false, "propertySold");
  } catch (err) { handleError(err); }
}

async function returnPropertyToBank(propertyId) {
  const property = properties.find(p => p.id === propertyId && p.ownerId === currentPlayerId);
  if (!property) return setStatus("", true, "propertyGone");
  const propertyRef = doc(db, "games", gameId, "properties", propertyId);
  try {
    await runTransaction(db, async tx => {
      const propertySnap = await tx.get(propertyRef);
      if (!propertySnap.exists()) throw new Error(t("propertyGone"));
      if (propertySnap.data().ownerId !== currentPlayerId) throw new Error(t("notYourProperty"));
      tx.delete(propertyRef);
    });
    setStatus("", false, "propertyReturned");
  } catch (err) { handleError(err); }
}

function auctionParticipantIds(auction) {
  return auction.participantIds || players.filter(player => player.id !== auction.sellerId).map(player => player.id);
}

function auctionBidMap(auction) {
  return auction.bids || {};
}

function auctionResponseCount(auction) {
  const bids = auctionBidMap(auction);
  return Object.keys(bids).length;
}

function shouldCloseAuction(auction) {
  const participantCount = auctionParticipantIds(auction).length;
  return auction?.status === "active" && (Date.now() >= Number(auction.endsAt || 0) || (participantCount > 0 && auctionResponseCount(auction) >= participantCount));
}

function auctionPropertyMarkup(auction) {
  const property = auction.property || {};
  const data = propertyData({ id: auction.propertyId, ...property });
  return `<div class="property-item" style="--property-color: ${data.color}">
    <div class="property-title"><strong>${escapeHtml(data.name)}</strong><span>${escapeHtml(propertyGroupLabel(data.group))}</span></div>
    <div class="tx-note">${t("purchase")} ${money(data.price)} · ${t("mortgage")} ${money(data.mortgageValue)}</div>
    <div class="property-details">${propertyRentRows(data, { ownerId: auction.sellerId })}</div>
  </div>`;
}

function renderAuction(preserveInput = false) {
  const auction = gameData.auction;
  if (auctionFinalizeTimer) {
    clearTimeout(auctionFinalizeTimer);
    auctionFinalizeTimer = null;
  }
  if (!auction || !currentPlayerId) {
    if (els.auctionDialog?.open) els.auctionDialog.close();
    return;
  }
  if (auction.status === "active") {
    if (shouldCloseAuction(auction)) finalizeAuction(auction.id);
    else auctionFinalizeTimer = setTimeout(() => finalizeAuction(auction.id), Math.max(250, Number(auction.endsAt || 0) - Date.now() + 50));
  }
  const myBid = auctionBidMap(auction)[currentPlayerId];
  const isSeller = currentPlayerId === auction.sellerId;
  const declined = Boolean(myBid?.declined);
  const shouldShowActive = auction.status === "active" && !isSeller && !declined;
  const shouldShowResult = auction.status === "closed" && dismissedAuctionId !== auction.id;
  if (!shouldShowActive && !shouldShowResult) {
    if (els.auctionDialog.open) els.auctionDialog.close();
    return;
  }
  els.auctionTitle.textContent = t("silentAuction");
  els.auctionPropertyInfo.innerHTML = auctionPropertyMarkup(auction);
  els.auctionBidForm.classList.toggle("hidden", auction.status !== "active");
  els.auctionResultActions.classList.toggle("hidden", auction.status !== "closed");
  if (auction.status === "active") {
    const secondsLeft = Math.max(0, Math.ceil((Number(auction.endsAt || 0) - Date.now()) / 1000));
    if (myBid?.amount) els.auctionStatus.textContent = t("auctionYourBid").replace("{amount}", money(myBid.amount));
    else els.auctionStatus.textContent = t("auctionWaiting").replace("{seconds}", secondsLeft);
    if (!preserveInput) els.auctionBidAmount.value = myBid?.amount || "";
  } else {
    const winner = players.find(player => player.id === auction.winnerId);
    els.auctionStatus.textContent = auction.winnerId
      ? t("auctionWinner").replace("{name}", winner?.name || t("player")).replace("{amount}", money(auction.winningAmount))
      : t("auctionNoWinner");
  }
  if (!els.auctionDialog.open) els.auctionDialog.showModal();
}

async function startAuction(propertyId) {
  const preset = propertyPreset(propertyId);
  if (!preset) return setStatus("", true, "propertyUnavailable");
  if (players.filter(player => player.id !== currentPlayerId).length === 0) return setStatus("", true, "noBuyerAvailable");
  if ((gameData.auction?.status || "") === "active") return setStatus("", true, "auctionAlreadyActive");
  const gameRef = doc(db, "games", gameId);
  const propertyRef = doc(db, "games", gameId, "properties", propertyId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      const propertySnap = await tx.get(propertyRef);
      if (propertySnap.exists()) throw new Error(t("propertyUnavailable"));
      if (gameSnap.data()?.auction?.status === "active") throw new Error(t("auctionAlreadyActive"));
      const now = Date.now();
      tx.update(gameRef, {
        auction: {
          id: `${propertyId}-${now}`,
          status: "active",
          propertyId,
          property: {
            presetId: preset.id,
            name: preset.name[language] || preset.name.en,
            price: preset.price,
            mortgageValue: preset.mortgageValue,
            color: preset.color,
            group: preset.group,
            canBuild: preset.canBuild,
            houseCost: preset.houseCost,
            rents: preset.rents,
            mortgaged: false,
            houses: 0
          },
          sellerId: currentPlayerId,
          participantIds: players.filter(player => player.id !== currentPlayerId).map(player => player.id),
          bids: {},
          startedAt: now,
          endsAt: now + 15000
        }
      });
    });
    setStatus("", false, "auctionStarted");
  } catch (err) { handleError(err); }
}

async function submitAuctionBid(event) {
  event.preventDefault();
  const auction = gameData.auction;
  const amount = Number(els.auctionBidAmount.value);
  if (!auction || auction.status !== "active" || !Number.isFinite(amount) || amount <= 0) return;
  const gameRef = doc(db, "games", gameId);
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      const playerSnap = await tx.get(playerRef);
      const latest = gameSnap.data()?.auction;
      if (!latest || latest.status !== "active") throw new Error(t("auctionEnded"));
      if (!playerSnap.exists()) throw new Error(t("playerGone"));
      if (Number(playerSnap.data().balance || 0) < amount) throw new Error(t("notEnoughPayment"));
      tx.update(gameRef, { [`auction.bids.${currentPlayerId}`]: { amount, declined: false, at: Date.now() } });
    });
    setStatus("", false, "auctionBidPlaced");
    setTimeout(() => finalizeAuction(auction.id), 50);
  } catch (err) { handleError(err); }
}

async function declineAuction() {
  const auction = gameData.auction;
  if (!auction || auction.status !== "active") return;
  const gameRef = doc(db, "games", gameId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      const latest = gameSnap.data()?.auction;
      if (!latest || latest.status !== "active") return;
      tx.update(gameRef, { [`auction.bids.${currentPlayerId}`]: { declined: true, at: Date.now() } });
    });
    els.auctionDialog.close();
    setStatus("", false, "auctionDeclined");
    setTimeout(() => finalizeAuction(auction.id), 50);
  } catch (err) { handleError(err); }
}

async function finalizeAuction(auctionId) {
  if (!gameId) return;
  const gameRef = doc(db, "games", gameId);
  try {
    await runTransaction(db, async tx => {
      const gameSnap = await tx.get(gameRef);
      const auction = gameSnap.data()?.auction;
      if (!auction || auction.id !== auctionId || auction.status !== "active") return;
      const participantCount = auctionParticipantIds(auction).length;
      const allResponded = participantCount > 0 && auctionResponseCount(auction) >= participantCount;
      if (!allResponded && Date.now() < Number(auction.endsAt || 0)) return;
      const validBids = Object.entries(auctionBidMap(auction)).filter(([, bid]) => !bid.declined && Number(bid.amount) > 0).sort((a, b) => Number(b[1].amount) - Number(a[1].amount));
      let winnerId = "";
      let winningAmount = 0;
      let buyerSnap = null;
      for (const [bidderId, bid] of validBids) {
        const snap = await tx.get(doc(db, "games", gameId, "players", bidderId));
        if (snap.exists() && Number(snap.data().balance || 0) >= Number(bid.amount)) {
          winnerId = bidderId;
          winningAmount = Number(bid.amount);
          buyerSnap = snap;
          break;
        }
      }
      if (!winnerId) {
        tx.update(gameRef, { "auction.status": "closed", "auction.winnerId": "", "auction.winningAmount": 0, "auction.closedAt": Date.now() });
        return;
      }
      const buyerRef = doc(db, "games", gameId, "players", winnerId);
      const propertyRef = doc(db, "games", gameId, "properties", auction.propertyId);
      const txRef = doc(collection(db, "games", gameId, "transactions"));
      const propertySnap = await tx.get(propertyRef);
      if (propertySnap.exists()) throw new Error(t("propertyUnavailable"));
      tx.update(buyerRef, { balance: Number(buyerSnap.data().balance || 0) - winningAmount });
      tx.set(propertyRef, { ...auction.property, ownerId: winnerId, createdAt: serverTimestamp() });
      tx.set(txRef, { type: "property-auction", fromId: winnerId, toId: "bank", amount: winningAmount, reason: `${t("auction")} ${propertyDisplayName({ id: auction.propertyId, ...auction.property })}`, propertyId: auction.propertyId, createdAt: serverTimestamp(), reversed: false });
      tx.update(gameRef, { "auction.status": "closed", "auction.winnerId": winnerId, "auction.winningAmount": winningAmount, "auction.closedAt": Date.now() });
    });
  } catch (err) { handleError(err); }
}

function closeAuctionDialog() {
  if (gameData.auction?.id) {
    dismissedAuctionId = gameData.auction.id;
    localStorage.setItem("monopolyDismissedAuctionId", dismissedAuctionId);
  }
  els.auctionDialog.close();
}

async function toggleMortgage(propertyId) {
  const pRef = doc(db, "games", gameId, "properties", propertyId);
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const pSnap = await tx.get(pRef);
      const playerSnap = await tx.get(playerRef);
      if (!pSnap.exists()) throw new Error(t("propertyGone"));
      const p = pSnap.data();
      if (p.ownerId !== currentPlayerId) throw new Error(t("notYourProperty"));
      const balance = Number(playerSnap.data().balance || 0);
      const value = Number(p.mortgageValue || 0);
      if (!p.mortgaged) {
        tx.update(playerRef, { balance: balance + value });
        tx.update(pRef, { mortgaged: true });
        if (value > 0) tx.set(txRef, { type: "mortgage", fromId: "bank", toId: currentPlayerId, amount: value, reason: `${t("mortgagedAction")} ${p.name}`, propertyId, createdAt: serverTimestamp(), reversed: false });
      } else {
        if (balance < value) throw new Error(t("notEnoughUnmortgage"));
        tx.update(playerRef, { balance: balance - value });
        tx.update(pRef, { mortgaged: false });
        if (value > 0) tx.set(txRef, { type: "unmortgage", fromId: currentPlayerId, toId: "bank", amount: value, reason: `${t("unmortgagedAction")} ${p.name}`, propertyId, createdAt: serverTimestamp(), reversed: false });
      }
    });
  } catch (err) { handleError(err); }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[ch]));
}

function handleError(err) {
  console.error(err);
  // Only this known application error is keyed; Firebase diagnostics stay intact.
  const key = err?.translationKey === "boardStaleRevision" ? "boardStaleRevision" : "";
  setStatus(err?.message || t("somethingWrong"), true, key);
}

// The visual board reuses the app's source-of-truth arrays and existing SVG icons.
// No additional Firestore listeners, frameworks, build tools or game rules.
const boardController = createBoardController({
  getState: () => ({ gameId, currentPlayerId, gameData, players, properties, language, diceRollInProgress: diceRollInProgress || jailCardUseInProgress,
    unreadMessageCount: unreadPrivateMessages().length,
    status: { text: els.statusBar.textContent, error: els.statusBar.classList.contains("error") } }),
  presets: PROPERTY_PRESETS, playerIconSvg, money, onRollDice: openDiceDialog, translate: t,
  onPropertySelect: openBoardProperty,
  onGameAction: action => {
    if (action === "end-turn") return endTurn();
    if (action === "messages") return openPrivateMessages();
    if (action === "properties") return openPropertiesDialog();
    if (action === "claim-pot") return claimFreeParking();
    if (["bank-receive", "player", "bank-pay", "free-parking-pay"].includes(action)) return openMoneyDialog(action);
  },
  onReset: () => {
    boardSessionGeneration++;
    activeDiceRollId = "";
    diceRollInProgress = false;
    if (els.diceDialog.open) els.diceDialog.close();
    els.startingRollBtn.disabled = false;
  }
});

applyLanguage();

$("heldJailCardBtn").addEventListener("click", () => { renderHeldJailCards(); $("heldJailCardsDialog").showModal(); });
$("closeHeldJailCards").addEventListener("click", () => $("heldJailCardsDialog").close());

els.createGameBtn.addEventListener("click", () => {
  els.gameVisibilitySelect.value = "public";
  els.gameSetupDialog.showModal();
  requestAnimationFrame(() => {
    if (els.gameSetupDialog.open) els.gameVisibilitySelect.focus({ preventScroll: true });
  });
});
els.gameSetupForm.addEventListener("submit", createGame);
els.closeGameSetup.addEventListener("click", () => els.gameSetupDialog.close());
els.cancelGameSetup.addEventListener("click", () => els.gameSetupDialog.close());
els.gameSetupDialog.addEventListener("cancel", () => {});
els.closeCreatedGame.addEventListener("click", () => {
  els.createdGamePassword.value = "";
  createdGamePassword = "";
  els.createdGameDialog.close();
  requestAnimationFrame(() => els.createGameBtn.focus({ preventScroll: true }));
});
els.gamePasswordForm.addEventListener("submit", submitGamePassword);
els.closeGamePassword.addEventListener("click", () => finishPasswordPrompt(false));
els.cancelGamePassword.addEventListener("click", () => finishPasswordPrompt(false));
els.gamePasswordDialog.addEventListener("cancel", event => { event.preventDefault(); finishPasswordPrompt(false); });
els.joinCodeInput.addEventListener("input", scheduleGameCodeLookup);
els.joinCodeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    findGameByCode();
  }
});
els.leaveGameBtn.addEventListener("click", leaveGame);
els.languageToggle.addEventListener("click", () => setLanguage(language === "en" ? "fi" : "en"));
els.copyCodeBtn.addEventListener("click", async () => { await navigator.clipboard.writeText(gameId); setStatus("", false, "gameCodeCopied"); });
els.addPlayerForm.addEventListener("submit", addPlayer);
els.backToLobbyBtn.addEventListener("click", () => { currentPlayerId = null; localStorage.removeItem("monopolyPlayerId"); showOnly(els.lobbyView); renderPlayers(); });
els.payPlayerBtn.addEventListener("click", () => openMoneyDialog("player"));
els.payBankBtn.addEventListener("click", () => openMoneyDialog("bank-pay"));
els.receiveBankBtn.addEventListener("click", () => openMoneyDialog("bank-receive"));
els.payFreeParkingBtn.addEventListener("click", () => openMoneyDialog("free-parking-pay"));
els.claimFreeParkingBtn.addEventListener("click", claimFreeParking);
els.diceRollBtn.addEventListener("click", openDiceDialog);
els.rollDiceAgainBtn.addEventListener("click", () => rollDice(false));
els.startingRollBtn.addEventListener("click", () => rollDice(true));
els.closeDiceDialog.addEventListener("click", () => els.diceDialog.close());
els.privateMessagesBtn.addEventListener("click", openPrivateMessages);
els.closePrivateMessages.addEventListener("click", () => els.privateMessagesDialog.close());
els.messageRecipientSelect.addEventListener("change", () => { replyToMessage = null; markConversationRead(els.messageRecipientSelect.value); renderPrivateMessages(); });
els.privateMessageForm.addEventListener("submit", sendPrivateMessage);
els.cancelReplyBtn.addEventListener("click", () => { replyToMessage = null; renderReplyContext(); });
els.moneyForm.addEventListener("submit", handleMoneySubmit);
els.closeMoneyDialog.addEventListener("click", closeMoneyDialog);
els.cancelMoneyDialog.addEventListener("click", closeMoneyDialog);
els.moneyDialog.addEventListener("cancel", () => { els.moneyForm.reset(); moneyMode = null; });
els.undoBtn.addEventListener("click", undoLastTransaction);
els.endTurnBtn.addEventListener("click", () => endTurn());
els.propertyBtn.addEventListener("click", openPropertiesDialog);
els.closePropertyDialog.addEventListener("click", () => els.propertyDialog.close());
els.addPropertyForm.addEventListener("submit", addProperty);
els.propertyPresetToggle.addEventListener("click", () => { propertyChoicesOpen = !propertyChoicesOpen; renderPropertySelect(); });
els.auctionSelectedPropertyBtn.addEventListener("click", () => startAuction(els.propertyPresetSelect.value));
els.propertySaleForm.addEventListener("submit", sellProperty);
els.closePropertySaleDialog.addEventListener("click", closePropertySaleDialog);
els.cancelPropertySaleDialog.addEventListener("click", closePropertySaleDialog);
els.propertySaleDialog.addEventListener("cancel", () => { propertySaleId = null; els.propertySaleForm.reset(); });
els.auctionBidForm.addEventListener("submit", submitAuctionBid);
els.declineAuctionBtn.addEventListener("click", declineAuction);
els.closeAuctionDialog.addEventListener("click", closeAuctionDialog);
els.auctionDialog.addEventListener("cancel", event => {
  if (gameData.auction?.status === "active") event.preventDefault();
});

setStatus("", false, "signingIn");
onAuthStateChanged(auth, async currentUser => {
  if (currentUser) {
    user = currentUser;
    setStatus("", false, "ready");
    subscribeToKnownGames();
    if (gameId) {
      try {
        const snap = await getDoc(doc(db, "games", gameId));
        if (snap.exists()) enterGame(gameId, currentPlayerId);
        else leaveGame();
      } catch (err) { handleError(err); }
    } else showOnly(els.homeView);
  } else {
    try { await signInAnonymously(auth); }
    catch (err) { handleError(err); }
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, addDoc,
  onSnapshot, query, orderBy, limit, serverTimestamp, runTransaction,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

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
let knownGames = [];
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
    or: "or",
    gameCode: "Game code",
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
    add: "Add",
    yourBalance: "YOUR BALANCE",
    monopolyMoney: "Monopoly money",
    payPlayer: "Pay player",
    payPlayerCopy: "Transfer money instantly",
    payBank: "Pay bank",
    payBankCopy: "Tax, property, house…",
    receive: "Receive",
    receiveCopy: "Salary, GO, bank…",
    payFreeParking: "Free Parking",
    payFreeParkingCopy: "Add money to the pot",
    claimFreeParking: "Free Parking",
    properties: "Properties",
    propertiesCopy: "Buy and mortgage",
    privateMessages: "Private messages",
    privateMessagesCopy: "Chat privately with a player",
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
    or: "tai",
    gameCode: "Pelikoodi",
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
    add: "Lisää",
    yourBalance: "SALDOSI",
    monopolyMoney: "Monopoly-rahaa",
    payPlayer: "Maksa pelaajalle",
    payPlayerCopy: "Siirrä rahaa heti",
    payBank: "Maksa pankille",
    payBankCopy: "Vero, tontti, talo…",
    receive: "Vastaanota",
    receiveCopy: "Palkka, lähtöruutu, pankki…",
    payFreeParking: "Vapaa pysäköinti",
    payFreeParkingCopy: "Lisää rahaa pottiin",
    claimFreeParking: "Vapaa pysäköinti",
    properties: "Tontit",
    propertiesCopy: "Osta ja kiinnitä",
    privateMessages: "Yksityisviestit",
    privateMessagesCopy: "Viestittele yksityisesti pelaajan kanssa",
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
  joinGameBtn: $("joinGameBtn"), gameCodeText: $("gameCodeText"), copyCodeBtn: $("copyCodeBtn"),
  savedGamesCard: $("savedGamesCard"), savedGamesList: $("savedGamesList"),
  lobbyPlayers: $("lobbyPlayers"), addPlayerForm: $("addPlayerForm"), newPlayerName: $("newPlayerName"),
  startBalance: $("startBalance"), playerIconSelect: $("playerIconSelect"), playerColorChoices: $("playerColorChoices"),
  currentPlayerName: $("currentPlayerName"), currentBalance: $("currentBalance"),
  payPlayerBtn: $("payPlayerBtn"), payBankBtn: $("payBankBtn"), receiveBankBtn: $("receiveBankBtn"),
  payFreeParkingBtn: $("payFreeParkingBtn"), claimFreeParkingBtn: $("claimFreeParkingBtn"), freeParkingPot: $("freeParkingPot"),
  privateMessagesBtn: $("privateMessagesBtn"), privateMessagesDialog: $("privateMessagesDialog"), closePrivateMessages: $("closePrivateMessages"),
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
  updateMoneyDialogTitle();
  renderPlayerOptions();
  renderPropertySelect();
  renderKnownGames();
  renderPlayers();
  renderCurrentPlayer();
  renderTransactions();
  renderProperties();
  renderAuction();
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
}

function money(value) {
  return new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function renderFreeParking() {
  if (els.freeParkingPot) els.freeParkingPot.textContent = money(gameData.freeParkingPot || 0);
}

function showOnly(view) {
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

async function createGame() {
  if (!user) return;
  setStatus("", false, "createGameStatus");
  try {
    const code = await createUniqueGameCode();
    await setDoc(doc(db, "games", code), {
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: user.uid
    });
    enterGame(code, null);
    setStatus("", false, "createGameSuccess");
  } catch (err) { handleError(err); }
}

async function joinGame() {
  const code = els.joinCodeInput.value.trim().toUpperCase();
  if (!code) return setStatus("", true, "enterGameCode");
  try {
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return setStatus("", true, "gameNotFound");
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

function stopSubscriptions() {
  if (auctionFinalizeTimer) {
    clearTimeout(auctionFinalizeTimer);
    auctionFinalizeTimer = null;
  }
  for (const fn of [unsubscribeGame, unsubscribePlayers, unsubscribeTransactions, unsubscribeProperties, unsubscribePrivateMessages]) if (fn) fn();
  unsubscribeGame = unsubscribePlayers = unsubscribeTransactions = unsubscribeProperties = unsubscribePrivateMessages = null;
}

function subscribeToKnownGames() {
  if (unsubscribeGames) unsubscribeGames();
  const gamesQuery = query(collection(db, "games"), orderBy("createdAt", "desc"), limit(30));
  unsubscribeGames = onSnapshot(gamesQuery, snap => {
    knownGames = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderKnownGames();
  }, handleError);
}

function renderKnownGames() {
  if (!els.savedGamesList) return;
  if (!knownGames.length) {
    els.savedGamesList.innerHTML = `<div class="empty">${t("noGamesYet")}</div>`;
    return;
  }
  els.savedGamesList.innerHTML = knownGames.map(game => {
    const createdAt = formatGameDate(game.createdAt);
    return `<div class="game-row">
      <div class="player-main">
        <div class="player-name">${escapeHtml(game.id)}</div>
        <div class="player-balance">${t("created")} ${escapeHtml(createdAt)}</div>
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
  enterGame(code, null);
  setStatus("", false, "gameFound");
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
    setStatus("", false, "gameDeleted");
  } catch (err) { handleError(err); }
}

function subscribeToGame() {
  stopSubscriptions();
  if (!gameId) return;

  unsubscribeGame = onSnapshot(doc(db, "games", gameId), snap => {
    gameData = snap.exists() ? snap.data() : {};
    renderFreeParking();
    renderAuction();
  }, handleError);

  unsubscribePlayers = onSnapshot(collection(db, "games", gameId, "players"), snap => {
    players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    players.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    renderPlayers();
    renderCurrentPlayer();
    renderAuction();
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
  }, handleError);

  unsubscribePrivateMessages = onSnapshot(
    query(collection(db, "games", gameId, "privateMessages"), orderBy("createdAt", "asc"), limit(300)),
    snap => {
      privateMessages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    return `<label class="color-choice ${used ? "disabled" : ""}" title="${color.id}">
      <input type="radio" name="playerColor" value="${color.value}" ${checked ? "checked" : ""} ${used ? "disabled" : ""} required />
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
    await addDoc(collection(db, "games", gameId, "players"), {
      name,
      balance,
      icon,
      color,
      createdAt: serverTimestamp()
    });
    els.newPlayerName.value = "";
    renderPlayerOptions();
  } catch (err) { handleError(err); }
}

function selectPlayer(playerId) {
  currentPlayerId = playerId;
  localStorage.setItem("monopolyPlayerId", playerId);
  showOnly(els.gameView);
  renderCurrentPlayer();
  renderPlayers();
  renderTransactions();
}

function renderPlayers() {
  renderPlayerOptions();
  const row = p => `
    <div class="player-row ${p.id === currentPlayerId ? "active" : ""}">
      ${playerToken(p)}
      <div class="player-main">
        <div class="player-name">${escapeHtml(p.name)}</div>
        <div class="player-balance">${money(p.balance)}</div>
      </div>
      <div class="player-actions">
        <button class="button" data-player="${p.id}">${p.id === currentPlayerId ? t("selected") : t("choose")}</button>
        <button class="button danger" data-delete-player="${p.id}">${t("deletePlayer")}</button>
      </div>
    </div>`;

  els.lobbyPlayers.innerHTML = players.length ? players.map(row).join("") : `<div class="empty">${t("noPlayersYet")}</div>`;
  els.gamePlayers.innerHTML = players.length ? players.map(p => `
    <div class="player-row ${p.id === currentPlayerId ? "active" : ""}">
      ${playerToken(p)}
      <div class="player-main"><div class="player-name">${escapeHtml(p.name)}</div><div class="player-balance">${money(p.balance)}</div></div>
    </div>`).join("") : `<div class="empty">${t("noPlayers")}</div>`;

  els.lobbyPlayers.querySelectorAll("[data-player]").forEach(btn => btn.addEventListener("click", () => selectPlayer(btn.dataset.player)));
  els.lobbyPlayers.querySelectorAll("[data-delete-player]").forEach(btn => btn.addEventListener("click", () => deletePlayer(btn.dataset.deletePlayer)));
}

async function deletePlayer(playerId) {
  const player = players.find(p => p.id === playerId);
  if (!player || !gameId) return;
  if (!confirm(t("deletePlayerConfirm").replace("{name}", player.name))) return;
  setStatus("", false, "deletingPlayer");
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, "games", gameId, "players", playerId));
    properties.filter(property => property.ownerId === playerId).forEach(property => {
      batch.delete(doc(db, "games", gameId, "properties", property.id));
    });
    await batch.commit();
    if (playerId === currentPlayerId) {
      currentPlayerId = null;
      localStorage.removeItem("monopolyPlayerId");
      showOnly(els.lobbyView);
    }
    setStatus("", false, "playerDeleted");
  } catch (err) { handleError(err); }
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
  els.replyContext.textContent = `${t("replyTo")}: ${replyToMessage.senderName} — ${replyToMessage.text}`;
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
  if (!recipients.length) return setStatus(t("chooseAnotherPlayer"), true);
  const previousRecipient = els.messageRecipientSelect.value;
  els.messageRecipientSelect.innerHTML = recipients.map(player => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  if (recipients.some(player => player.id === previousRecipient)) els.messageRecipientSelect.value = previousRecipient;
  replyToMessage = null;
  renderPrivateMessages();
  if (!els.privateMessagesDialog.open) els.privateMessagesDialog.showModal();
}

async function sendPrivateMessage(event) {
  event.preventDefault();
  const text = els.privateMessageText.value.trim();
  const recipientId = els.messageRecipientSelect.value;
  if (!text || !recipientId || !currentPlayerId || !gameId) return;
  const recipient = players.find(player => player.id === recipientId);
  if (!recipient) return setStatus(t("playerGone"), true);
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
    car: `<svg viewBox="0 0 64 64"><path d="M13 38h38l-5-14H21z"/><path d="M9 38h46v12H9z"/><circle cx="20" cy="51" r="6"/><circle cx="44" cy="51" r="6"/><path d="M24 28h16"/></svg>`,
    hat: `<svg viewBox="0 0 64 64"><path d="M20 37h24l-3-19H23z"/><path d="M11 41c8 6 34 6 42 0v9H11z"/><path d="M22 34h20"/></svg>`,
    ship: `<svg viewBox="0 0 64 64"><path d="M18 37h36l-7 13H14z"/><path d="M30 13v24"/><path d="M31 15l18 11-18 8z"/><path d="M29 20l-13 9 13 5z"/></svg>`,
    shoe: `<svg viewBox="0 0 64 64"><path d="M13 42c12 1 20-5 24-15 3 8 8 12 16 14v8H13z"/><path d="M21 36h17"/><path d="M26 32h11"/></svg>`,
    dog: `<svg viewBox="0 0 64 64"><path d="M17 37h25l7 7v7h-7v-5H23v5h-7z"/><path d="M42 30h9l3 5-6 4-6-3z"/><path d="M18 36l-7-7"/><circle cx="49" cy="34" r="2"/></svg>`,
    cat: `<svg viewBox="0 0 64 64"><path d="M19 27l8-9 5 9 5-9 8 9v18c0 8-26 8-26 0z"/><circle cx="27" cy="37" r="2"/><circle cx="37" cy="37" r="2"/><path d="M28 46h8"/></svg>`,
    iron: `<svg viewBox="0 0 64 64"><path d="M13 45c6-13 17-22 36-19 4 4 6 10 6 19z"/><path d="M25 27c1-8 11-8 14 0"/><path d="M14 45h41v7H14z"/></svg>`,
    thimble: `<svg viewBox="0 0 64 64"><path d="M22 52h20l5-31c-5-6-25-6-30 0z"/><path d="M20 24c6 3 18 3 24 0"/><path d="M25 31h2M32 31h2M39 31h2M24 39h2M31 39h2M38 39h2"/></svg>`
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
    els.recipientSelect.innerHTML = others.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
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
  const playerName = id => id === "bank" ? t("bank") : (players.find(p => p.id === id)?.name || t("player"));
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
  const transaction = transactions.find(x => !x.reversed && x.fromId && x.toId && Number(x.amount) > 0);
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
  const mine = properties.filter(p => p.ownerId === currentPlayerId);
  if (!mine.length) {
    els.propertyList.innerHTML = `<div class="empty">${t("noPropertiesYet")}</div>`;
    return;
  }
  els.propertyList.innerHTML = mine.map(p => {
    const data = propertyData(p);
    const detailsOpen = openPropertyDetails.has(p.id);
    return `<div class="property-item ${p.mortgaged ? "mortgaged" : ""}" style="--property-color: ${data.color}">
    <div class="property-title"><strong>${escapeHtml(data.name)}</strong><span>${escapeHtml(data.group)}</span></div>
    <div class="tx-note">${t("purchase")} ${money(data.price)} · ${t("mortgage")} ${money(data.mortgageValue)}${p.mortgaged ? ` · ${t("mortgaged")}` : ""}</div>
    <div class="property-details ${detailsOpen ? "" : "hidden"}" data-property-details="${p.id}">
      <div>${t("group")}: ${escapeHtml(data.group)}</div>
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

function openPropertySaleDialog(propertyId) {
  const property = properties.find(p => p.id === propertyId && p.ownerId === currentPlayerId);
  if (!property) return setStatus("", true, "propertyGone");
  const buyers = players.filter(player => player.id !== currentPlayerId);
  if (!buyers.length) return setStatus("", true, "noBuyerAvailable");
  propertySaleId = propertyId;
  const data = propertyData(property);
  els.propertySaleTitle.textContent = `${t("sellProperty")}: ${data.name}`;
  els.propertyBuyerSelect.innerHTML = buyers.map(player => `<option value="${player.id}">${escapeHtml(player.name)}</option>`).join("");
  els.propertySaleAmount.value = data.price;
  els.propertySaleDialog.showModal();
}

async function sellProperty(event) {
  event.preventDefault();
  const propertyId = propertySaleId;
  const buyerId = els.propertyBuyerSelect.value;
  const amount = Number(els.propertySaleAmount.value);
  if (!propertyId || !buyerId || !Number.isFinite(amount) || amount <= 0) return;
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
        reason: `${t("sell")} ${propertyDisplayName({ id: propertyId, ...property })}`,
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
    <div class="property-title"><strong>${escapeHtml(data.name)}</strong><span>${escapeHtml(data.group)}</span></div>
    <div class="tx-note">${t("purchase")} ${money(data.price)} · ${t("mortgage")} ${money(data.mortgageValue)}</div>
    <div class="property-details">${propertyRentRows(data, { ownerId: auction.sellerId })}</div>
  </div>`;
}

function renderAuction() {
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
    els.auctionBidAmount.value = myBid?.amount || "";
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
  setStatus(err?.message || t("somethingWrong"), true);
}

applyLanguage();

els.createGameBtn.addEventListener("click", createGame);
els.joinGameBtn.addEventListener("click", joinGame);
els.joinCodeInput.addEventListener("keydown", e => { if (e.key === "Enter") joinGame(); });
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
els.privateMessagesBtn.addEventListener("click", openPrivateMessages);
els.closePrivateMessages.addEventListener("click", () => els.privateMessagesDialog.close());
els.messageRecipientSelect.addEventListener("change", () => { replyToMessage = null; renderPrivateMessages(); });
els.privateMessageForm.addEventListener("submit", sendPrivateMessage);
els.cancelReplyBtn.addEventListener("click", () => { replyToMessage = null; renderReplyContext(); });
els.moneyForm.addEventListener("submit", handleMoneySubmit);
els.closeMoneyDialog.addEventListener("click", closeMoneyDialog);
els.cancelMoneyDialog.addEventListener("click", closeMoneyDialog);
els.moneyDialog.addEventListener("cancel", () => { els.moneyForm.reset(); moneyMode = null; });
els.undoBtn.addEventListener("click", undoLastTransaction);
els.propertyBtn.addEventListener("click", () => { renderPropertySelect(); renderProperties(); els.propertyDialog.showModal(); });
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

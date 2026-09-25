import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore, doc, collection, getDoc, getDocs, setDoc, addDoc, updateDoc,
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
let user = null;
let gameId = localStorage.getItem("monopolyGameId") || null;
let currentPlayerId = localStorage.getItem("monopolyPlayerId") || null;
let players = [];
let transactions = [];
let properties = [];
let knownGames = [];
let unsubscribeGames = null;
let unsubscribePlayers = null;
let unsubscribeTransactions = null;
let unsubscribeProperties = null;
let moneyMode = null;
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
    properties: "Properties",
    propertiesCopy: "Buy and mortgage",
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
    boardwalk: "Boardwalk",
    purchasePrice: "Purchase price",
    mortgageValue: "Mortgage value",
    buyProperty: "Buy property",
    yourProperties: "Your properties",
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
    playerGone: "Player no longer exists.",
    notEnoughPayment: "Not enough money for this payment.",
    noUndo: "There is no reversible money transaction to undo.",
    alreadyUndone: "This transaction was already undone.",
    cannotUndo: "Cannot undo: recipient no longer has enough money.",
    lastUndone: "Last transaction undone.",
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
    properties: "Tontit",
    propertiesCopy: "Osta ja kiinnitä",
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
    boardwalk: "Boardwalk",
    purchasePrice: "Ostohinta",
    mortgageValue: "Kiinnitysarvo",
    buyProperty: "Osta tontti",
    yourProperties: "Omat tontit",
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
    playerGone: "Pelaajaa ei enää ole.",
    notEnoughPayment: "Rahat eivät riitä tähän maksuun.",
    noUndo: "Kumottavaa rahatapahtumaa ei ole.",
    alreadyUndone: "Tämä tapahtuma on jo kumottu.",
    cannotUndo: "Ei voi kumota: vastaanottajalla ei ole enää tarpeeksi rahaa.",
    lastUndone: "Viimeisin tapahtuma kumottu.",
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
  propertyBtn: $("propertyBtn"), gamePlayers: $("gamePlayers"), backToLobbyBtn: $("backToLobbyBtn"),
  transactionList: $("transactionList"), undoBtn: $("undoBtn"), moneyDialog: $("moneyDialog"),
  moneyForm: $("moneyForm"), moneyDialogTitle: $("moneyDialogTitle"), recipientWrap: $("recipientWrap"),
  recipientSelect: $("recipientSelect"), moneyAmount: $("moneyAmount"), moneyReason: $("moneyReason"),
  closeMoneyDialog: $("closeMoneyDialog"), cancelMoneyDialog: $("cancelMoneyDialog"), languageToggle: $("languageToggle"),
  propertyDialog: $("propertyDialog"), closePropertyDialog: $("closePropertyDialog"),
  addPropertyForm: $("addPropertyForm"), propertyName: $("propertyName"), propertyPrice: $("propertyPrice"),
  mortgageValue: $("mortgageValue"), propertyList: $("propertyList")
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
  renderKnownGames();
  renderPlayers();
  renderCurrentPlayer();
  renderTransactions();
  renderProperties();
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
  gameId = null;
  currentPlayerId = null;
  players = [];
  transactions = [];
  properties = [];
  localStorage.removeItem("monopolyGameId");
  localStorage.removeItem("monopolyPlayerId");
  showOnly(els.homeView);
  setStatus("", false, "ready");
}

function stopSubscriptions() {
  for (const fn of [unsubscribePlayers, unsubscribeTransactions, unsubscribeProperties]) if (fn) fn();
  unsubscribePlayers = unsubscribeTransactions = unsubscribeProperties = null;
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
    for (const subcollection of ["players", "transactions", "properties"]) {
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

  unsubscribePlayers = onSnapshot(collection(db, "games", gameId, "players"), snap => {
    players = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    players.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    renderPlayers();
    renderCurrentPlayer();
  }, handleError);

  const txQuery = query(collection(db, "games", gameId, "transactions"), orderBy("createdAt", "desc"), limit(25));
  unsubscribeTransactions = onSnapshot(txQuery, snap => {
    transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTransactions();
  }, handleError);

  unsubscribeProperties = onSnapshot(collection(db, "games", gameId, "properties"), snap => {
    properties = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProperties();
  }, handleError);
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
      <div class="player-actions"><button class="button danger" data-delete-player="${p.id}">${t("deletePlayer")}</button></div>
    </div>`).join("") : `<div class="empty">${t("noPlayers")}</div>`;

  els.lobbyPlayers.querySelectorAll("[data-player]").forEach(btn => btn.addEventListener("click", () => selectPlayer(btn.dataset.player)));
  document.querySelectorAll("[data-delete-player]").forEach(btn => btn.addEventListener("click", () => deletePlayer(btn.dataset.deletePlayer)));
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
    els.moneyDialog.close();
    moneyMode = null;
    setStatus("", false, "transactionCompleted");
  } catch (err) { handleError(err); }
}

function defaultReasonForMode(mode) {
  if (mode === "player") return t("defaultPlayerPayment");
  if (mode === "bank-pay") return t("defaultBankPayment");
  return t("defaultBankReceive");
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
  const reversibleTypes = new Set(["player-transfer", "bank-payment", "bank-receive"]);
  const transaction = transactions.find(x => !x.reversed && reversibleTypes.has(x.type));
  if (!transaction) return setStatus("", true, "noUndo");
  try {
    const txRef = doc(db, "games", gameId, "transactions", transaction.id);
    await runTransaction(db, async tx => {
      const latest = await tx.get(txRef);
      if (!latest.exists() || latest.data().reversed) throw new Error(t("alreadyUndone"));
      const data = latest.data();
      const refs = {};
      if (data.fromId !== "bank") refs.from = doc(db, "games", gameId, "players", data.fromId);
      if (data.toId !== "bank") refs.to = doc(db, "games", gameId, "players", data.toId);
      const fromSnap = refs.from ? await tx.get(refs.from) : null;
      const toSnap = refs.to ? await tx.get(refs.to) : null;
      if (refs.to && Number(toSnap.data().balance || 0) < Number(data.amount)) throw new Error(t("cannotUndo"));
      if (refs.from) tx.update(refs.from, { balance: Number(fromSnap.data().balance || 0) + Number(data.amount) });
      if (refs.to) tx.update(refs.to, { balance: Number(toSnap.data().balance || 0) - Number(data.amount) });
      tx.update(txRef, { reversed: true, reversedAt: serverTimestamp() });
    });
    setStatus("", false, "lastUndone");
  } catch (err) { handleError(err); }
}

async function addProperty(event) {
  event.preventDefault();
  const name = els.propertyName.value.trim();
  const price = Number(els.propertyPrice.value || 0);
  const mortgageValue = Number(els.mortgageValue.value || 0);
  if (!name || price < 0 || mortgageValue < 0) return;
  const playerRef = doc(db, "games", gameId, "players", currentPlayerId);
  const propertyRef = doc(collection(db, "games", gameId, "properties"));
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  try {
    await runTransaction(db, async tx => {
      const playerSnap = await tx.get(playerRef);
      const balance = Number(playerSnap.data().balance || 0);
      if (balance < price) throw new Error(t("notEnoughProperty"));
      tx.update(playerRef, { balance: balance - price });
      tx.set(propertyRef, { name, ownerId: currentPlayerId, price, mortgageValue, mortgaged: false, createdAt: serverTimestamp() });
      if (price > 0) tx.set(txRef, { type: "property-buy", fromId: currentPlayerId, toId: "bank", amount: price, reason: `${t("bought")} ${name}`, createdAt: serverTimestamp(), reversed: false });
    });
    els.addPropertyForm.reset();
    els.propertyPrice.value = 0;
    els.mortgageValue.value = 0;
  } catch (err) { handleError(err); }
}

function renderProperties() {
  const mine = properties.filter(p => p.ownerId === currentPlayerId);
  if (!mine.length) {
    els.propertyList.innerHTML = `<div class="empty">${t("noPropertiesYet")}</div>`;
    return;
  }
  els.propertyList.innerHTML = mine.map(p => `<div class="property-item ${p.mortgaged ? "mortgaged" : ""}">
    <strong>${escapeHtml(p.name)}</strong>
    <div class="tx-note">${t("purchase")} ${money(p.price)} · ${t("mortgage")} ${money(p.mortgageValue)}${p.mortgaged ? ` · ${t("mortgaged")}` : ""}</div>
    <div class="property-actions"><button class="button" data-mortgage="${p.id}">${p.mortgaged ? t("unmortgage") : t("mortgage")}</button></div>
  </div>`).join("");
  els.propertyList.querySelectorAll("[data-mortgage]").forEach(btn => btn.addEventListener("click", () => toggleMortgage(btn.dataset.mortgage)));
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
        if (value > 0) tx.set(txRef, { type: "mortgage", fromId: "bank", toId: currentPlayerId, amount: value, reason: `${t("mortgagedAction")} ${p.name}`, createdAt: serverTimestamp(), reversed: false });
      } else {
        if (balance < value) throw new Error(t("notEnoughUnmortgage"));
        tx.update(playerRef, { balance: balance - value });
        tx.update(pRef, { mortgaged: false });
        if (value > 0) tx.set(txRef, { type: "unmortgage", fromId: currentPlayerId, toId: "bank", amount: value, reason: `${t("unmortgagedAction")} ${p.name}`, createdAt: serverTimestamp(), reversed: false });
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
els.moneyForm.addEventListener("submit", handleMoneySubmit);
els.closeMoneyDialog.addEventListener("click", closeMoneyDialog);
els.cancelMoneyDialog.addEventListener("click", closeMoneyDialog);
els.moneyDialog.addEventListener("cancel", () => { els.moneyForm.reset(); moneyMode = null; });
els.undoBtn.addEventListener("click", undoLastTransaction);
els.propertyBtn.addEventListener("click", () => { renderProperties(); els.propertyDialog.showModal(); });
els.closePropertyDialog.addEventListener("click", () => els.propertyDialog.close());
els.addPropertyForm.addEventListener("submit", addProperty);

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

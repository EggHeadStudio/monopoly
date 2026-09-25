import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getFirestore, doc, collection, getDoc, setDoc, addDoc, updateDoc,
  onSnapshot, query, orderBy, limit, serverTimestamp, runTransaction,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const STARTING_BALANCE = 1500;
let user = null;
let gameId = localStorage.getItem("monopolyGameId") || null;
let currentPlayerId = localStorage.getItem("monopolyPlayerId") || null;
let players = [];
let transactions = [];
let properties = [];
let unsubscribePlayers = null;
let unsubscribeTransactions = null;
let unsubscribeProperties = null;
let moneyMode = null;

const $ = (id) => document.getElementById(id);
const els = {
  statusBar: $("statusBar"), homeView: $("homeView"), lobbyView: $("lobbyView"), gameView: $("gameView"),
  leaveGameBtn: $("leaveGameBtn"), createGameBtn: $("createGameBtn"), joinCodeInput: $("joinCodeInput"),
  joinGameBtn: $("joinGameBtn"), gameCodeText: $("gameCodeText"), copyCodeBtn: $("copyCodeBtn"),
  lobbyPlayers: $("lobbyPlayers"), addPlayerForm: $("addPlayerForm"), newPlayerName: $("newPlayerName"),
  startBalance: $("startBalance"), currentPlayerName: $("currentPlayerName"), currentBalance: $("currentBalance"),
  payPlayerBtn: $("payPlayerBtn"), payBankBtn: $("payBankBtn"), receiveBankBtn: $("receiveBankBtn"),
  propertyBtn: $("propertyBtn"), gamePlayers: $("gamePlayers"), backToLobbyBtn: $("backToLobbyBtn"),
  transactionList: $("transactionList"), undoBtn: $("undoBtn"), moneyDialog: $("moneyDialog"),
  moneyForm: $("moneyForm"), moneyDialogTitle: $("moneyDialogTitle"), recipientWrap: $("recipientWrap"),
  recipientSelect: $("recipientSelect"), moneyAmount: $("moneyAmount"), moneyReason: $("moneyReason"),
  propertyDialog: $("propertyDialog"), closePropertyDialog: $("closePropertyDialog"),
  addPropertyForm: $("addPropertyForm"), propertyName: $("propertyName"), propertyPrice: $("propertyPrice"),
  mortgageValue: $("mortgageValue"), propertyList: $("propertyList")
};

function setStatus(message, isError = false) {
  els.statusBar.textContent = message || "";
  els.statusBar.classList.toggle("error", isError);
}

function money(value) {
  return new Intl.NumberFormat("fi-FI", { maximumFractionDigits: 0 }).format(Number(value || 0));
}

function showOnly(view) {
  for (const element of [els.homeView, els.lobbyView, els.gameView]) element.classList.add("hidden");
  view.classList.remove("hidden");
  els.leaveGameBtn.classList.toggle("hidden", view === els.homeView);
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
  throw new Error("Could not generate a unique game code. Try again.");
}

async function createGame() {
  if (!user) return;
  setStatus("Creating game…");
  try {
    const code = await createUniqueGameCode();
    await setDoc(doc(db, "games", code), {
      status: "active",
      createdAt: serverTimestamp(),
      createdBy: user.uid
    });
    enterGame(code, null);
    setStatus("Game created. Add players and share the code.");
  } catch (err) { handleError(err); }
}

async function joinGame() {
  const code = els.joinCodeInput.value.trim().toUpperCase();
  if (!code) return setStatus("Enter a game code.", true);
  try {
    const snap = await getDoc(doc(db, "games", code));
    if (!snap.exists()) return setStatus("Game not found. Check the code.", true);
    enterGame(code, null);
    setStatus("Game found. Choose your player.");
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
  setStatus("Ready.");
}

function stopSubscriptions() {
  for (const fn of [unsubscribePlayers, unsubscribeTransactions, unsubscribeProperties]) if (fn) fn();
  unsubscribePlayers = unsubscribeTransactions = unsubscribeProperties = null;
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

async function addPlayer(event) {
  event.preventDefault();
  const name = els.newPlayerName.value.trim();
  const balance = Number(els.startBalance.value || STARTING_BALANCE);
  if (!name || balance < 0) return;
  try {
    await addDoc(collection(db, "games", gameId, "players"), {
      name,
      balance,
      createdAt: serverTimestamp()
    });
    els.newPlayerName.value = "";
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
  const row = p => `
    <div class="player-row ${p.id === currentPlayerId ? "active" : ""}">
      <div class="player-main">
        <div class="player-name">${escapeHtml(p.name)}</div>
        <div class="player-balance">${money(p.balance)}</div>
      </div>
      <button class="button" data-player="${p.id}">${p.id === currentPlayerId ? "Selected" : "Choose"}</button>
    </div>`;

  els.lobbyPlayers.innerHTML = players.length ? players.map(row).join("") : `<div class="empty">No players yet.</div>`;
  els.gamePlayers.innerHTML = players.length ? players.map(p => `
    <div class="player-row ${p.id === currentPlayerId ? "active" : ""}">
      <div class="player-main"><div class="player-name">${escapeHtml(p.name)}</div><div class="player-balance">${money(p.balance)}</div></div>
    </div>`).join("") : `<div class="empty">No players.</div>`;

  els.lobbyPlayers.querySelectorAll("[data-player]").forEach(btn => btn.addEventListener("click", () => selectPlayer(btn.dataset.player)));
}

function renderCurrentPlayer() {
  const player = players.find(p => p.id === currentPlayerId);
  if (!player) {
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
    els.moneyDialogTitle.textContent = "Pay another player";
    const others = players.filter(p => p.id !== currentPlayerId);
    if (!others.length) return setStatus("Add at least one other player first.", true);
    els.recipientSelect.innerHTML = others.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
    els.recipientWrap.classList.remove("hidden");
  } else if (mode === "bank-pay") {
    els.moneyDialogTitle.textContent = "Pay bank";
  } else {
    els.moneyDialogTitle.textContent = "Receive from bank";
  }
  els.moneyDialog.showModal();
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
    setStatus("Transaction completed.");
  } catch (err) { handleError(err); }
}

function defaultReasonForMode(mode) {
  if (mode === "player") return "Player payment";
  if (mode === "bank-pay") return "Payment to bank";
  return "Payment from bank";
}

async function transferBetweenPlayers(fromId, toId, amount, reason) {
  const fromRef = doc(db, "games", gameId, "players", fromId);
  const toRef = doc(db, "games", gameId, "players", toId);
  const txRef = doc(collection(db, "games", gameId, "transactions"));
  await runTransaction(db, async tx => {
    const fromSnap = await tx.get(fromRef);
    const toSnap = await tx.get(toRef);
    if (!fromSnap.exists() || !toSnap.exists()) throw new Error("Player no longer exists.");
    const fromBalance = Number(fromSnap.data().balance || 0);
    const toBalance = Number(toSnap.data().balance || 0);
    if (fromBalance < amount) throw new Error("Not enough money for this payment.");
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
    if (!snap.exists()) throw new Error("Player no longer exists.");
    const oldBalance = Number(snap.data().balance || 0);
    const next = oldBalance + delta;
    if (next < 0) throw new Error("Not enough money for this payment.");
    tx.update(playerRef, { balance: next });
    tx.set(txRef, {
      type, fromId: delta < 0 ? playerId : "bank", toId: delta > 0 ? playerId : "bank",
      amount: Math.abs(delta), reason, createdAt: serverTimestamp(), reversed: false
    });
  });
}

function renderTransactions() {
  const me = currentPlayerId;
  const playerName = id => id === "bank" ? "Bank" : (players.find(p => p.id === id)?.name || "Player");
  if (!transactions.length) {
    els.transactionList.innerHTML = `<div class="empty">No transactions yet.</div>`;
    return;
  }
  els.transactionList.innerHTML = transactions.map(t => {
    const reversed = t.reversed ? " · undone" : "";
    let sign = ""; let cls = "neutral";
    if (t.toId === me) { sign = "+"; cls = "plus"; }
    else if (t.fromId === me) { sign = "−"; cls = "minus"; }
    const from = playerName(t.fromId); const to = playerName(t.toId);
    return `<div class="transaction">
      <div><strong>${escapeHtml(t.reason || "Transaction")}</strong><div class="tx-note">${escapeHtml(from)} → ${escapeHtml(to)}${reversed}</div></div>
      <div class="amount ${cls}">${sign}${money(t.amount)}</div>
    </div>`;
  }).join("");
}

async function undoLastTransaction() {
  const reversibleTypes = new Set(["player-transfer", "bank-payment", "bank-receive"]);
  const t = transactions.find(x => !x.reversed && reversibleTypes.has(x.type));
  if (!t) return setStatus("There is no reversible money transaction to undo.", true);
  try {
    const txRef = doc(db, "games", gameId, "transactions", t.id);
    await runTransaction(db, async tx => {
      const latest = await tx.get(txRef);
      if (!latest.exists() || latest.data().reversed) throw new Error("This transaction was already undone.");
      const data = latest.data();
      const refs = {};
      if (data.fromId !== "bank") refs.from = doc(db, "games", gameId, "players", data.fromId);
      if (data.toId !== "bank") refs.to = doc(db, "games", gameId, "players", data.toId);
      const fromSnap = refs.from ? await tx.get(refs.from) : null;
      const toSnap = refs.to ? await tx.get(refs.to) : null;
      if (refs.to && Number(toSnap.data().balance || 0) < Number(data.amount)) throw new Error("Cannot undo: recipient no longer has enough money.");
      if (refs.from) tx.update(refs.from, { balance: Number(fromSnap.data().balance || 0) + Number(data.amount) });
      if (refs.to) tx.update(refs.to, { balance: Number(toSnap.data().balance || 0) - Number(data.amount) });
      tx.update(txRef, { reversed: true, reversedAt: serverTimestamp() });
    });
    setStatus("Last transaction undone.");
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
      if (balance < price) throw new Error("Not enough money to buy this property.");
      tx.update(playerRef, { balance: balance - price });
      tx.set(propertyRef, { name, ownerId: currentPlayerId, price, mortgageValue, mortgaged: false, createdAt: serverTimestamp() });
      if (price > 0) tx.set(txRef, { type: "property-buy", fromId: currentPlayerId, toId: "bank", amount: price, reason: `Bought ${name}`, createdAt: serverTimestamp(), reversed: false });
    });
    els.addPropertyForm.reset();
    els.propertyPrice.value = 0;
    els.mortgageValue.value = 0;
  } catch (err) { handleError(err); }
}

function renderProperties() {
  const mine = properties.filter(p => p.ownerId === currentPlayerId);
  if (!mine.length) {
    els.propertyList.innerHTML = `<div class="empty">No properties yet.</div>`;
    return;
  }
  els.propertyList.innerHTML = mine.map(p => `<div class="property-item ${p.mortgaged ? "mortgaged" : ""}">
    <strong>${escapeHtml(p.name)}</strong>
    <div class="tx-note">Purchase ${money(p.price)} · Mortgage ${money(p.mortgageValue)}${p.mortgaged ? " · MORTGAGED" : ""}</div>
    <div class="property-actions"><button class="button" data-mortgage="${p.id}">${p.mortgaged ? "Unmortgage" : "Mortgage"}</button></div>
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
      if (!pSnap.exists()) throw new Error("Property no longer exists.");
      const p = pSnap.data();
      if (p.ownerId !== currentPlayerId) throw new Error("This is not your property.");
      const balance = Number(playerSnap.data().balance || 0);
      const value = Number(p.mortgageValue || 0);
      if (!p.mortgaged) {
        tx.update(playerRef, { balance: balance + value });
        tx.update(pRef, { mortgaged: true });
        if (value > 0) tx.set(txRef, { type: "mortgage", fromId: "bank", toId: currentPlayerId, amount: value, reason: `Mortgaged ${p.name}`, createdAt: serverTimestamp(), reversed: false });
      } else {
        if (balance < value) throw new Error("Not enough money to unmortgage this property.");
        tx.update(playerRef, { balance: balance - value });
        tx.update(pRef, { mortgaged: false });
        if (value > 0) tx.set(txRef, { type: "unmortgage", fromId: currentPlayerId, toId: "bank", amount: value, reason: `Unmortgaged ${p.name}`, createdAt: serverTimestamp(), reversed: false });
      }
    });
  } catch (err) { handleError(err); }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[ch]));
}

function handleError(err) {
  console.error(err);
  setStatus(err?.message || "Something went wrong.", true);
}

els.createGameBtn.addEventListener("click", createGame);
els.joinGameBtn.addEventListener("click", joinGame);
els.joinCodeInput.addEventListener("keydown", e => { if (e.key === "Enter") joinGame(); });
els.leaveGameBtn.addEventListener("click", leaveGame);
els.copyCodeBtn.addEventListener("click", async () => { await navigator.clipboard.writeText(gameId); setStatus("Game code copied."); });
els.addPlayerForm.addEventListener("submit", addPlayer);
els.backToLobbyBtn.addEventListener("click", () => { currentPlayerId = null; localStorage.removeItem("monopolyPlayerId"); showOnly(els.lobbyView); renderPlayers(); });
els.payPlayerBtn.addEventListener("click", () => openMoneyDialog("player"));
els.payBankBtn.addEventListener("click", () => openMoneyDialog("bank-pay"));
els.receiveBankBtn.addEventListener("click", () => openMoneyDialog("bank-receive"));
els.moneyForm.addEventListener("submit", handleMoneySubmit);
els.undoBtn.addEventListener("click", undoLastTransaction);
els.propertyBtn.addEventListener("click", () => { renderProperties(); els.propertyDialog.showModal(); });
els.closePropertyDialog.addEventListener("click", () => els.propertyDialog.close());
els.addPropertyForm.addEventListener("submit", addProperty);

setStatus("Signing in…");
onAuthStateChanged(auth, async currentUser => {
  if (currentUser) {
    user = currentUser;
    setStatus("Ready.");
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

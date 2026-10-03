// Board definitions reference PROPERTY_PRESETS; prices, groups and names have one source.
const propertySpace = (index, propertyId, type = "property") => ({ index, type, propertyId });
const specialSpace = (index, type, en, fi) => ({ index, type, id: `${type}_${index}`, name: { en, fi } });
export const BOARD_SPACES = [
  specialSpace(0, "go", "GO", "Lähtö"),
  propertySpace(1, "Korkeavuorenkatu"),
  specialSpace(2, "community", "Community Chest", "Yhteismaa"),
  propertySpace(3, "Kasarmikatu"),
  specialSpace(4, "tax", "Income tax", "Tulovero"),
  propertySpace(5, "Pasilan asema", "station"),
  propertySpace(6, "Rantatie"),
  specialSpace(7, "chance", "Chance", "Sattuma"),
  propertySpace(8, "Kauppatori"), propertySpace(9, "Esplanadi"),
  specialSpace(10, "jail", "Jail / Just visiting", "Vankila / Vierailulla"),
  propertySpace(11, "Hämeentie"), propertySpace(12, "Sähkölaitos", "utility"),
  propertySpace(13, "Siltasaari"), propertySpace(14, "Kaisaniemenkatu"),
  propertySpace(15, "Sörnäisten asema", "station"), propertySpace(16, "Liisankatu"),
  specialSpace(17, "community", "Community Chest", "Yhteismaa"),
  propertySpace(18, "Snellmaninkatu"), propertySpace(19, "Unioninkatu"),
  specialSpace(20, "freeParking", "Free Parking", "Vapaa pysäköinti"),
  propertySpace(21, "Lönnrotinkatu"), specialSpace(22, "chance", "Chance", "Sattuma"),
  propertySpace(23, "Annankatu"), propertySpace(24, "Simonkatu"),
  propertySpace(25, "Rautatieasema", "station"), propertySpace(26, "Mikonkatu"),
  propertySpace(27, "Aleksanterinkatu"), propertySpace(28, "Vesijohtolaitos", "utility"),
  propertySpace(29, "Keskuskatu"),
  specialSpace(30, "goToJail", "Go to Jail", "Mene vankilaan"),
  propertySpace(31, "Tehtaankatu"), propertySpace(32, "Eira"),
  specialSpace(33, "community", "Community Chest", "Yhteismaa"),
  propertySpace(34, "Bulevardi"), propertySpace(35, "Tavara-asema", "station"),
  specialSpace(36, "chance", "Chance", "Sattuma"), propertySpace(37, "Mannerheimintie"),
  specialSpace(38, "tax", "Luxury tax", "Ylellisyysvero"), propertySpace(39, "Erottaja")
];

// Movement is structured data, never parsed from translated instructions.
// Money stays manual; the two jail-release cards are retained until used.
export const CHANCE_CARDS = [
  {
    id: "chance_01",
    movement: { propertyId: "Erottaja" },
    text: {
      en: "Move to Erottaja.",
      fi: "Siirry Erottajalle."
    }
  },
  {
    id: "chance_02",
    movement: { destination: 0 },
    text: {
      en: "Move to GO and collect 200 from the bank.",
      fi: "Siirry lähtöruutuun ja vastaanota pankilta 200."
    }
  },
  {
    id: "chance_03",
    movement: { propertyId: "Simonkatu" },
    text: {
      en: "Move to Simonkatu. If you pass GO, collect 200 from the bank.",
      fi: "Siirry Simonkadulle. Jos ohitat lähtöruudun, vastaanota pankilta 200."
    }
  },
  {
    id: "chance_04",
    movement: { propertyId: "Hämeentie" },
    text: {
      en: "Move to Hämeentie. If you pass GO, collect 200 from the bank.",
      fi: "Siirry Hämeentielle. Jos ohitat lähtöruudun, vastaanota pankilta 200."
    }
  },
  {
    id: "chance_05",
    movement: { nearestType: "station" },
    text: {
      en: "Move to the nearest station. If it is owned, pay the owner a normal station rent.",
      fi: "Siirry lähimmälle asemalle. Jos asema on omistettu, maksa omistajalle normaali asemavuokra."
    }
  },
  {
    id: "chance_06",
    movement: { nearestType: "station" },
    text: {
      en: "Move to the nearest station. If it is owned, pay the owner double the normal station rent.",
      fi: "Siirry lähimmälle asemalle. Jos asema on omistettu, maksa omistajalle kaksinkertainen normaali asemavuokra."
    }
  },
  {
    id: "chance_07",
    movement: { nearestType: "utility" },
    text: {
      en: "Move to the nearest utility. If it is owned, roll the dice and pay the owner 10 times the total rolled.",
      fi: "Siirry lähimmälle laitokselle. Jos se on omistettu, heitä noppia ja maksa omistajalle 10 kertaa noppien summa."
    }
  },
  {
    id: "chance_08",
    text: {
      en: "The bank pays you a dividend. Collect 50.",
      fi: "Pankki maksaa sinulle osinkoa. Vastaanota 50."
    }
  },
  {
    id: "chance_09",
    keepUntilUsed: true,
    text: {
      en: "Get Out of Jail Free. Keep this card until you need it.",
      fi: "Vapaudu vankilasta ilmaiseksi. Säilytä kortti, kunnes tarvitset sitä."
    }
  },
  {
    id: "chance_10",
    movement: { steps: -3 },
    text: {
      en: "Move back 3 spaces.",
      fi: "Siirry 3 ruutua taaksepäin."
    }
  },
  {
    id: "chance_11",
    movement: { destination: 10, direct: true },
    text: {
      en: "Go directly to Jail. Do not pass GO and do not collect 200.",
      fi: "Siirry suoraan vankilaan. Älä kulje lähtöruudun kautta äläkä vastaanota 200."
    }
  },
  {
    id: "chance_12",
    text: {
      en: "Your properties need repairs. Pay 25 for every house and 100 for every hotel you own.",
      fi: "Kiinteistösi tarvitsevat korjauksia. Maksa 25 jokaisesta omistamastasi talosta ja 100 jokaisesta hotellista."
    }
  },
  {
    id: "chance_13",
    text: {
      en: "Pay a speeding fine of 15.",
      fi: "Maksa 15 ylinopeussakkoa."
    }
  },
  {
    id: "chance_14",
    movement: { propertyId: "Pasilan asema" },
    text: {
      en: "Take a trip to Pasilan asema. If you pass GO, collect 200 from the bank.",
      fi: "Matkusta Pasilan asemalle. Jos ohitat lähtöruudun, vastaanota pankilta 200."
    }
  },
  {
    id: "chance_15",
    text: {
      en: "You have been chosen as chairman. Pay 50 to every other player.",
      fi: "Sinut on valittu puheenjohtajaksi. Maksa jokaiselle toiselle pelaajalle 50."
    }
  },
  {
    id: "chance_16",
    text: {
      en: "Your building investment has matured. Collect 150 from the bank.",
      fi: "Rakennussijoituksesi on erääntynyt. Vastaanota pankilta 150."
    }
  }
];


export const COMMUNITY_CHEST_CARDS = [
  {
    id: "community_01",
    movement: { destination: 0 },
    text: {
      en: "Move to GO and collect 200 from the bank.",
      fi: "Siirry lähtöruutuun ja vastaanota pankilta 200."
    }
  },
  {
    id: "community_02",
    text: {
      en: "A bank error is in your favor. Collect 200.",
      fi: "Pankin virhe on eduksesi. Vastaanota pankilta 200."
    }
  },
  {
    id: "community_03",
    text: {
      en: "Pay a doctor's fee of 50.",
      fi: "Maksa lääkärikuluja 50."
    }
  },
  {
    id: "community_04",
    text: {
      en: "You receive 50 from selling shares.",
      fi: "Saat osakkeiden myynnistä 50."
    }
  },
  {
    id: "community_05",
    keepUntilUsed: true,
    text: {
      en: "Get Out of Jail Free. Keep this card until you need it.",
      fi: "Vapaudu vankilasta ilmaiseksi. Säilytä kortti, kunnes tarvitset sitä."
    }
  },
  {
    id: "community_06",
    movement: { destination: 10, direct: true },
    text: {
      en: "Go directly to Jail. Do not pass GO and do not collect 200.",
      fi: "Siirry suoraan vankilaan. Älä kulje lähtöruudun kautta äläkä vastaanota 200."
    }
  },
  {
    id: "community_07",
    text: {
      en: "Your holiday savings have matured. Collect 100.",
      fi: "Lomarahastosi on erääntynyt. Vastaanota 100."
    }
  },
  {
    id: "community_08",
    text: {
      en: "You receive an income tax refund of 20.",
      fi: "Saat veronpalautusta 20."
    }
  },
  {
    id: "community_09",
    text: {
      en: "It is your birthday. Collect 10 from every other player.",
      fi: "On syntymäpäiväsi. Vastaanota 10 jokaiselta toiselta pelaajalta."
    }
  },
  {
    id: "community_10",
    text: {
      en: "Your life insurance has matured. Collect 100.",
      fi: "Henkivakuutuksesi on erääntynyt. Vastaanota 100."
    }
  },
  {
    id: "community_11",
    text: {
      en: "Pay hospital expenses of 100.",
      fi: "Maksa sairaalakuluja 100."
    }
  },
  {
    id: "community_12",
    text: {
      en: "Pay school fees of 50.",
      fi: "Maksa koulumaksuja 50."
    }
  },
  {
    id: "community_13",
    text: {
      en: "You receive a consulting fee of 25.",
      fi: "Saat konsultointipalkkiona 25."
    }
  },
  {
    id: "community_14",
    text: {
      en: "Street repairs are required. Pay 40 for every house and 115 for every hotel you own.",
      fi: "Katujen korjauksista peritään maksu. Maksa 40 jokaisesta omistamastasi talosta ja 115 jokaisesta hotellista."
    }
  },
  {
    id: "community_15",
    text: {
      en: "You won second prize in a beauty contest. Collect 10.",
      fi: "Voitit kauneuskilpailussa toisen palkinnon. Vastaanota 10."
    }
  },
  {
    id: "community_16",
    text: {
      en: "You receive an inheritance of 100.",
      fi: "Saat perintönä 100."
    }
  }
];

const LABELS = {
  en: { board: "Board", boardCopy: "Explore the live game board", gestureHint: "Ctrl + wheel to zoom · drag to pan · two fingers on touch · arrow keys to pan", centerMe: "Center on me", fit: "Show full board", follow: "Follow my token", zoomIn: "Zoom in", zoomOut: "Zoom out", close: "Close", rollDice: "Roll dice", turn: "Current turn", gameCode: "Game code", pot: "Free Parking pot", manual: "Rent, money, taxes and jail rules remain manual", informational: "Informational only — carry out any effects manually.", moving: "Moving", landed: "Landed on", noTurn: "Waiting for a turn", owner: "Owner", mortgaged: "Mortgaged", houses: "houses", hotel: "Hotel", chance: "Chance", community: "Community Chest" },
  fi: { board: "Pelilauta", boardCopy: "Tutki pelin reaaliaikaista lautaa", gestureHint: "Ctrl + rulla: zoomaus · vedä: siirrä · kosketus: kaksi sormea · nuolinäppäimet: siirrä", centerMe: "Keskitä minuun", fit: "Näytä koko lauta", follow: "Seuraa pelinappulaani", zoomIn: "Lähennä", zoomOut: "Loitonna", close: "Sulje", rollDice: "Heitä noppaa", turn: "Vuorossa", gameCode: "Pelikoodi", pot: "Vapaan pysäköinnin potti", manual: "Vuokrat, rahat, verot ja vankilasäännöt hoidetaan käsin", informational: "Vain tiedoksi — toteuta mahdolliset vaikutukset käsin.", moving: "Liikkuu", landed: "Saapui ruutuun", noTurn: "Odotetaan vuoroa", owner: "Omistaja", mortgaged: "Kiinnitetty", houses: "taloa", hotel: "Hotelli", chance: "Sattuma", community: "Yhteismaa" }
};

export function cardMovementRoute(card, from) {
  const effect = card?.movement;
  if (!effect) return null;
  let destination;
  if (Number.isInteger(effect.steps)) destination = ((from + effect.steps) % 40 + 40) % 40;
  else if (effect.nearestType) {
    for (let step = 1; step <= 40; step++) {
      const index = (from + step) % 40;
      if (BOARD_SPACES[index].type === effect.nearestType) { destination = index; break; }
    }
  } else if (effect.propertyId) destination = BOARD_SPACES.find(space => space.propertyId === effect.propertyId)?.index;
  else destination = effect.destination;
  if (!Number.isInteger(destination) || destination < 0 || destination >= 40) throw new Error("Invalid card movement destination.");
  return { from, destination, direct: Boolean(effect.direct), steps: effect.steps ?? (destination - from + 40) % 40 };
}

export function playerBoardPosition(player) {
  return Number.isInteger(player?.position) && player.position >= 0 && player.position < 40 ? player.position : 0;
}

// Grid placement follows the familiar counter-clockwise route from bottom-right GO.
export function boardGridPosition(index) {
  if (index <= 10) return { row: 11, column: 11 - index };
  if (index <= 20) return { row: 21 - index, column: 1 };
  if (index <= 30) return { row: 1, column: index - 19 };
  return { row: index - 29, column: 11 };
}

const svg = paths => `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const SYMBOLS = {
  go: svg('<path d="M39 24H9m12-12L9 24l12 12"/>'),
  station: svg('<rect x="12" y="7" width="24" height="29" rx="5"/><path d="M12 22h24M19 7v15m10-15v15M17 36l-5 7m19-7 5 7M15 40h18"/><circle cx="18" cy="29" r="2"/><circle cx="30" cy="29" r="2"/>'),
  electricity: svg('<path d="M28 4 12 27h12l-4 17 16-25H24z"/>'),
  water: svg('<path d="M24 5S10 22 10 30a14 14 0 0 0 28 0C38 22 24 5 24 5Z"/><path d="M17 30a7 7 0 0 0 7 7"/>'),
  chance: svg('<path d="M15 16a9 9 0 1 1 15 7c-4 3-6 4-6 9"/><circle cx="24" cy="40" r="1.5" fill="currentColor"/>'),
  community: svg('<rect x="7" y="18" width="34" height="24" rx="3"/><path d="M7 24h34M7 18a17 12 0 0 1 34 0M20 24v8h8v-8M15 18v24m18-24v24"/>'),
  tax: svg('<path d="M12 5h24v38l-4-3-4 3-4-3-4 3-4-3-4 3zM18 14h12M18 21h12M18 28h7"/>'),
  jail: svg('<rect x="8" y="8" width="32" height="32" rx="3"/><path d="M16 8v32m8-32v32m8-32v32M8 16h32m-32 16h32"/>'),
  freeParking: svg('<rect x="8" y="6" width="32" height="36" rx="6"/><path d="M20 33V15h7a6 6 0 0 1 0 12h-7"/>'),
  goToJail: svg('<path d="M8 24h28M26 14l10 10-10 10M10 8h10m-10 32h10"/>')
};
const buildingSvg = hotel => `<svg viewBox="0 0 24 22" aria-hidden="true"><path fill="currentColor" stroke="#173b2a" stroke-width="1" d="${hotel ? 'M3 5h18v15H3z' : 'M2 10 12 2l10 8h-3v10H5V10z'}"/><path fill="#fff" d="${hotel ? 'M6 8h3v3H6zm9 0h3v3h-3zM6 13h3v3H6zm9 0h3v3h-3zM11 15h3v5h-3z' : 'M10 13h4v7h-4z'}"/></svg>`;

// All state comes from the existing app subscriptions; this controller owns only DOM/camera state.
export function createBoardController({ getState, presets, playerIconSvg, money, onRollDice, translate = key => key, onReset = () => {}, onPropertySelect = () => {}, onGameAction = () => {} }) {
  const $ = id => document.getElementById(id);
  const dialog = $("boardDialog"), viewport = $("boardViewport"), world = $("boardWorld"), board = $("gameBoard");
  const presetMap = new Map(presets.map(preset => [preset.id, preset]));
  const spaces = new Map(), tokens = new Map(), localPositions = new Map();
  let rendered = false, animationGeneration = 0, activeCard = null, lastDice = null;
  let movementStatus = null;
  let cardQueue = [];
  let gameActionPending = false;
  const label = key => LABELS[getState().language]?.[key] || LABELS.en[key] || key;
  const spaceName = space => {
    const names = space.propertyId ? presetMap.get(space.propertyId)?.name : space.name;
    return names?.[getState().language] || names?.en || space.propertyId;
  };
  const playerColor = player => /^#[0-9a-f]{6}$/i.test(player?.color || "") ? player.color : "#6f7a71";

  function createBoardSpace(space) {
    const element = document.createElement("div");
    const { row, column } = boardGridPosition(space.index);
    element.id = `board-space-${space.index}`;
    element.dataset.boardIndex = space.index;
    element.className = `board-space board-space--${space.type}${space.index % 10 === 0 ? " board-corner" : ""}${space.index % 10 !== 0 && (column === 1 || column === 11) ? " board-side" : ""}`;
    element.style.gridArea = `${row} / ${column}`;
    const preset = presetMap.get(space.propertyId);
    if (preset) {
      element.style.setProperty("--property-color", preset.color);
      element.classList.add("board-property-link");
      element.setAttribute("role", "button");
      element.tabIndex = 0;
      element.addEventListener("click", event => {
        // Pointer taps are handled on release because the viewport captures them.
        // Keyboard/assistive activation still uses a standard button-like click.
        if (event.detail === 0 && !getState().diceRollInProgress) onPropertySelect(space.propertyId);
      });
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); element.click(); }
      });
    }
    const symbol = space.type === "utility" ? SYMBOLS[space.propertyId === "Sähkölaitos" ? "electricity" : "water"] : SYMBOLS[space.type] || "";
    element.innerHTML = `<div class="board-color-strip"></div><div class="board-buildings"></div><div class="board-space-body">${symbol ? `<div class="board-space-symbol">${symbol}</div>` : ""}<span class="board-space-name"></span>${preset ? `<span class="board-space-price">${money(preset.price)}</span>` : ""}</div><span class="board-owner"></span><span class="board-mortgage" hidden>M</span><span class="board-space-index">${space.index}</span>`;
    spaces.set(space.index, element);
    return element;
  }

  function renderBoard() {
    if (rendered) return;
    const center = document.createElement("div");
    center.className = "board-center";
    center.innerHTML = `<div class="board-center-inner"><span class="board-city">HELSINKI</span><h2>MONOPOLY BANK</h2><div class="board-center-code"><span data-board-label="gameCode"></span> <strong id="boardGameCode"></strong></div><div class="board-center-turn"><span data-board-label="turn"></span><strong id="boardTurnName"></strong><span id="boardTurnNumber"></span></div><div class="board-pot"><span data-board-label="pot"></span><strong id="boardPotValue">0</strong></div><div id="boardDiceStatus" class="board-center-dice"></div><p class="board-manual" data-board-label="manual"></p><div class="board-center-decks"><div class="board-deck board-deck--community">${SYMBOLS.community}<span data-board-label="community"></span></div><div class="board-deck board-deck--chance">${SYMBOLS.chance}<span data-board-label="chance"></span></div></div></div>`;
    board.append(center, ...BOARD_SPACES.map(createBoardSpace));
    const layer = document.createElement("div");
    layer.className = "board-token-layer";
    layer.id = "boardTokenLayer";
    board.append(layer);
    rendered = true;
  }

  function updateBoardLanguage() {
    document.querySelectorAll("[data-board-label]").forEach(element => { element.textContent = label(element.dataset.boardLabel); });
    document.querySelectorAll("[data-board-aria]").forEach(element => element.setAttribute("aria-label", label(element.dataset.boardAria)));
    board.setAttribute("aria-label", label("board"));
    for (const space of BOARD_SPACES) {
      const element = spaces.get(space.index);
      if (element) {
        element.querySelector(".board-space-name").textContent = spaceName(space);
        const price = element.querySelector(".board-space-price");
        if (price) price.textContent = money(presetMap.get(space.propertyId).price);
      }
    }
    if (activeCard) renderCard();
    renderMovementStatus();
  }

  function renderMovementStatus() {
    if (!movementStatus) return;
    if (movementStatus.error !== undefined) {
      $("boardMovementStatus").textContent = movementStatus.key ? translate(movementStatus.key) : movementStatus.error;
      return;
    }
    const player = getState().players.find(item => item.id === movementStatus.playerId);
    $("boardMovementStatus").textContent = player
      ? `${player.name} · ${label(movementStatus.stage)}: ${spaceName(BOARD_SPACES[movementStatus.position])}` : "";
  }

  function updateBoardCenter() {
    if (!rendered) return;
    const state = getState();
    const activePlayer = state.players.find(player => player.id === state.gameData.currentTurnPlayerId);
    $("boardGameCode").textContent = state.gameId || "—";
    $("boardTurnName").textContent = activePlayer?.name || label("noTurn");
    $("boardTurnNumber").textContent = activePlayer ? `#${state.gameData.turnNumber || 1}` : "";
    $("boardPotValue").textContent = money(state.gameData.freeParkingPot || 0);
    $("boardDiceStatus").textContent = lastDice ? `${lastDice.first} + ${lastDice.second} = ${lastDice.first + lastDice.second}${lastDice.resultKey ? ` · ${translate(lastDice.resultKey)}` : ""}` : "";
    $("boardDiceBtn").disabled = state.diceRollInProgress || state.currentPlayerId !== state.gameData.currentTurnPlayerId;
    $("boardCenterMe").disabled = !state.players.some(player => player.id === state.currentPlayerId);
    const hasPlayer = state.players.some(player => player.id === state.currentPlayerId);
    const selectedPlayer = state.players.find(player => player.id === state.currentPlayerId);
    $("boardBalancePlayer").textContent = selectedPlayer?.name || "";
    $("boardBalanceValue").textContent = selectedPlayer ? money(selectedPlayer.balance) : "—";
    $("boardBalanceValue").closest(".board-player-balance").classList.toggle("is-negative", Number(selectedPlayer?.balance || 0) < 0);
    document.querySelectorAll("[data-board-action]").forEach(button => { button.disabled = !hasPlayer || gameActionPending; });
    $("boardEndTurnBtn").disabled = !hasPlayer || gameActionPending || state.diceRollInProgress || state.currentPlayerId !== state.gameData.currentTurnPlayerId;
    $("boardClaimPotBtn").disabled = !hasPlayer || gameActionPending || Number(state.gameData.freeParkingPot || 0) <= 0;
    $("boardPayPlayerBtn").disabled = !hasPlayer || gameActionPending || state.players.length < 2;
    $("boardMessagesBtn").disabled = !hasPlayer || gameActionPending || state.players.length < 2;
    $("boardClaimPotValue").textContent = money(state.gameData.freeParkingPot || 0);
    const badge = $("boardMessageBadge"), count = state.unreadMessageCount || 0;
    badge.textContent = count > 99 ? "99+" : String(count);
    badge.classList.toggle("hidden", !count);
    $("boardMessagesBtn").setAttribute("aria-label", `${translate("privateMessages")}${count ? ` (${count})` : ""}`);
    $("boardAppStatus").textContent = state.status?.text || "";
    $("boardAppStatus").classList.toggle("error", Boolean(state.status?.error));
  }

  function updateBoardBuildings() {
    if (!rendered) return;
    const owned = new Map(getState().properties.map(property => [property.presetId || property.id, property]));
    for (const space of BOARD_SPACES.filter(space => space.type === "property")) {
      const count = Math.max(0, Math.min(5, Math.trunc(Number(owned.get(space.propertyId)?.houses) || 0)));
      const buildings = spaces.get(space.index).querySelector(".board-buildings");
      if (buildings.dataset.count !== String(count)) {
        buildings.dataset.count = count;
        buildings.innerHTML = count === 5 ? `<span class="board-building board-hotel">${buildingSvg(true)}</span>` : Array.from({ length: count }, () => `<span class="board-building">${buildingSvg(false)}</span>`).join("");
      }
      buildings.setAttribute("aria-label", count === 5 ? label("hotel") : `${count} ${label("houses")}`);
    }
  }

  function updateBoardOwnership() {
    if (!rendered) return;
    const state = getState();
    const owned = new Map(state.properties.map(property => [property.presetId || property.id, property]));
    for (const space of BOARD_SPACES) {
      const element = spaces.get(space.index), property = owned.get(space.propertyId);
      const owner = state.players.find(player => player.id === property?.ownerId);
      const marker = element.querySelector(".board-owner");
      marker.hidden = !owner;
      marker.style.backgroundColor = playerColor(owner);
      marker.title = owner ? `${label("owner")}: ${owner.name}` : "";
      element.classList.toggle("is-mortgaged", Boolean(property?.mortgaged));
      element.querySelector(".board-mortgage").hidden = !property?.mortgaged;
      const count = Number(property?.houses || 0);
      element.title = [spaceName(space), owner ? `${label("owner")}: ${owner.name}` : "", property?.mortgaged ? label("mortgaged") : "", count ? count === 5 ? label("hotel") : `${count} ${label("houses")}` : ""].filter(Boolean).join(" · ");
      if (space.propertyId) {
        element.setAttribute("aria-label", element.title);
        element.setAttribute("aria-disabled", String(state.diceRollInProgress));
      }
    }
  }

  // Tokens live in an overlay, so crossing a grid boundary animates via transforms.
  // Eight players fit in a 3-column cluster, including when everyone starts on GO.
  function updateBoardPlayers() {
    if (!rendered || !dialog.open) return;
    const state = getState(), ids = new Set(state.players.map(player => player.id));
    for (const [id, token] of tokens) if (!ids.has(id)) { token.remove(); tokens.delete(id); localPositions.delete(id); }
    const occupants = new Map();
    for (const player of state.players) {
      const position = localPositions.get(player.id) ?? playerBoardPosition(player);
      if (!occupants.has(position)) occupants.set(position, []);
      occupants.get(position).push(player);
    }
    for (const [position, group] of occupants) {
      const space = spaces.get(position);
      const columns = Math.min(space.classList.contains("board-side") ? 4 : 3, group.length), rows = Math.ceil(group.length / columns);
      group.forEach((player, index) => {
        let token = tokens.get(player.id);
        if (!token) {
          token = document.createElement("div");
          token.className = "board-player-token";
          token.setAttribute("role", "img");
          tokens.set(player.id, token);
          $("boardTokenLayer").append(token);
        }
        const iconId = player.icon || "car";
        if (token.dataset.icon !== iconId) { token.innerHTML = playerIconSvg(iconId); token.dataset.icon = iconId; }
        token.style.setProperty("--player-color", playerColor(player));
        token.classList.toggle("is-me", player.id === state.currentPlayerId);
        token.classList.toggle("is-turn", player.id === state.gameData.currentTurnPlayerId);
        token.dataset.position = String(position);
        token.title = `${player.name} · ${spaceName(BOARD_SPACES[position])}`;
        token.setAttribute("aria-label", token.title);
        const x = space.offsetLeft + space.offsetWidth / 2 + (index % columns - (columns - 1) / 2) * 23 - 10;
        const bottomInset = space.classList.contains("board-side") ? 5 : 8;
        const y = space.offsetTop + space.offsetHeight - bottomInset - rows * 22 + Math.floor(index / columns) * 22;
        token.style.transform = `translate(${x}px, ${y}px)`;
      });
    }
  }

  function sync() {
    if (!rendered) { updateBoardLanguage(); return; }
    updateBoardLanguage(); updateBoardCenter(); updateBoardBuildings(); updateBoardOwnership(); updateBoardPlayers();
  }

  function openBoardDialog() {
    renderBoard();
    if (!dialog.open) {
      board.classList.add("board-opening");
      dialog.showModal();
    }
    sync();
    requestAnimationFrame(() => {
      updateBoardPlayers();
      fitBoardToViewport();
      requestAnimationFrame(() => board.classList.remove("board-opening"));
    });
  }

  function closeBoardDialog() { closeBoardActionMenus(); dialog.close(); }

  async function animatePlayerMovement(playerId, fromPosition, steps, direction = 1) {
    const generation = animationGeneration;
    $("boardMovementStatus").classList.remove("error");
    localPositions.set(playerId, fromPosition);
    updateBoardPlayers();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let step = 1; step <= steps; step++) {
      if (generation !== animationGeneration) throw new Error(translate("boardMovementCancelled"));
      const position = ((fromPosition + step * direction) % 40 + 40) % 40;
      localPositions.set(playerId, position);
      updateBoardPlayers();
      movementStatus = { stage: "moving", playerId, position };
      renderMovementStatus();
      if (dialog.open && $("boardFollow").checked && playerId === getState().currentPlayerId && Date.now() - lastManualPan > 4000) centerBoardOnPlayer(playerId, true);
      await new Promise(resolve => setTimeout(resolve, 160));
    }
    if (generation !== animationGeneration) throw new Error(translate("boardMovementCancelled"));
    return ((fromPosition + steps * direction) % 40 + 40) % 40;
  }

  function relocatePlayerOnBoard(playerId, position) {
    localPositions.set(playerId, position);
    updateBoardPlayers();
    if (dialog.open && $("boardFollow").checked && playerId === getState().currentPlayerId && Date.now() - lastManualPan > 4000) {
      centerBoardOnPlayer(playerId, true);
    }
  }

  function finishMovement(playerId) {
    localPositions.delete(playerId);
    $("boardMovementStatus").classList.remove("error");
    updateBoardPlayers(); updateBoardCenter();
    const player = getState().players.find(item => item.id === playerId);
    movementStatus = { stage: "landed", playerId, position: playerBoardPosition(player) };
    renderMovementStatus();
  }
  function setMovementError(message, key = "") {
    movementStatus = { error: message, key };
    $("boardMovementStatus").classList.add("error");
    renderMovementStatus();
  }

  function drawCard(type, holders = {}, seed = crypto.getRandomValues(new Uint32Array(1))[0]) {
    const cards = (type === "chance" ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS)
      .filter(card => !card.keepUntilUsed || !holders[card.id]);
    return cards.length ? { type, ...cards[seed % cards.length] } : null;
  }
  function drawChanceCard(holders, seed) { return drawCard("chance", holders, seed); }
  function drawCommunityChestCard(holders, seed) { return drawCard("community", holders, seed); }
  function renderCard() {
    $("boardCardDialog").dataset.type = activeCard.type;
    $("boardCardTitle").textContent = label(activeCard.type);
    $("boardCardText").textContent = activeCard.text[getState().language] || activeCard.text.en;
    $("boardCardSymbol").innerHTML = SYMBOLS[activeCard.type];
    $("boardCardPlayer").textContent = activeCard.playerName
      ? translate("cardDrawnBy").replace("{name}", activeCard.playerName) : "";
    $("closeBoardCard").textContent = translate("acknowledge");
    $("boardCardDialog").querySelector('[data-board-label="informational"]').textContent = activeCard.keepUntilUsed
      ? translate("jailCardShared") : translate("cardManualMoney");
  }
  function showCard(card) {
    if ($("boardCardDialog").open) { cardQueue.push(card); return; }
    activeCard = card;
    renderCard();
    if (!$("boardCardDialog").open) $("boardCardDialog").showModal();
  }
  function setDice(first, second, resultKey = "") { lastDice = { first, second, resultKey }; updateBoardCenter(); }
  function reset() {
    animationGeneration++;
    onReset();
    localPositions.clear(); lastDice = null; activeCard = null; movementStatus = null;
    cardQueue = [];
    if (dialog.open) closeBoardDialog();
    if ($("boardCardDialog").open) $("boardCardDialog").close();
    $("boardMovementStatus").textContent = "";
    $("boardMovementStatus").classList.remove("error");
    sync();
  }

  // Board camera: a fit basis lets the 0.55 overview fit even narrow phones,
  // while the interactive zoom remains bounded to 0.55–3.0 on every device.
  // Logical board coordinates and token rendering are unaffected by this basis.
  let zoom = 1, panX = 0, panY = 0, lastManualPan = 0;
  let isOverview = false, gesture = null;
  let propertyTap = null;
  const pointers = new Map();
  const BOARD_SIZE = 1100, MIN_ZOOM = 0.55, MAX_ZOOM = 3;
  function boardFitBasis() {
    return Math.min(1, Math.max(1, Math.min(viewport.clientWidth - 32, viewport.clientHeight - 32)) / (BOARD_SIZE * MIN_ZOOM));
  }
  function boardScale() { return zoom * boardFitBasis(); }
  function clampBoardPan() {
    const size = BOARD_SIZE * boardScale();
    // Permit centering an edge token even when the board is smaller on one axis.
    // A large board still covers half that axis; a smaller board stays visible.
    const clampAxis = (pan, dimension) => Math.max(dimension / 2 - size + 24, Math.min(dimension / 2 - 24, pan));
    panX = clampAxis(panX, viewport.clientWidth);
    panY = clampAxis(panY, viewport.clientHeight);
  }
  function applyBoardCamera(smooth = false) {
    clampBoardPan();
    world.classList.toggle("is-following", smooth);
    world.style.setProperty("--pan-x", `${panX}px`);
    world.style.setProperty("--pan-y", `${panY}px`);
    world.style.setProperty("--zoom", String(boardScale()));
    $("boardZoomReset").textContent = `${Math.round(zoom * 100)}%`;
  }
  function setBoardPan(x, y, smooth = false) {
    panX = x; panY = y;
    applyBoardCamera(smooth);
  }
  function setBoardZoom(nextZoom, anchorX = viewport.clientWidth / 2, anchorY = viewport.clientHeight / 2) {
    const previousScale = boardScale();
    const x = (anchorX - panX) / previousScale, y = (anchorY - panY) / previousScale;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    isOverview = false;
    setBoardPan(anchorX - x * boardScale(), anchorY - y * boardScale());
  }
  function centerBoardOnPlayer(playerId = getState().currentPlayerId, smooth = false) {
    const player = getState().players.find(item => item.id === playerId);
    if (!player) return;
    const position = localPositions.get(playerId) ?? playerBoardPosition(player);
    const space = spaces.get(position);
    if (!space) return;
    const token = tokens.get(playerId);
    const matrix = token ? new DOMMatrixReadOnly(token.style.transform) : null;
    const x = board.clientLeft + (matrix ? matrix.m41 + token.offsetWidth / 2 : space.offsetLeft + space.offsetWidth / 2);
    const y = board.clientTop + (matrix ? matrix.m42 + token.offsetHeight / 2 : space.offsetTop + space.offsetHeight / 2);
    setBoardPan(viewport.clientWidth / 2 - x * boardScale(), viewport.clientHeight / 2 - y * boardScale(), smooth);
    isOverview = false;
  }
  function fitBoardToViewport() {
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(viewport.clientWidth - 32, viewport.clientHeight - 32) / (BOARD_SIZE * boardFitBasis())));
    isOverview = true;
    setBoardPan((viewport.clientWidth - BOARD_SIZE * boardScale()) / 2, (viewport.clientHeight - BOARD_SIZE * boardScale()) / 2);
  }
  function markManualCamera() { lastManualPan = Date.now(); isOverview = false; }
  function handleBoardWheel(event) {
    // A normal wheel never zooms. Ctrl-wheel zooms only the board, not the page.
    if (!event.ctrlKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1);
    markManualCamera();
    setBoardZoom(zoom * Math.exp(-delta * 0.002), event.clientX - rect.left, event.clientY - rect.top);
  }
  function pointerPoint(event) {
    const rect = viewport.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, type: event.pointerType };
  }
  function gesturePoints() {
    const points = [...pointers.values()].slice(0, 2);
    if (points.length === 2) return {
      x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2,
      distance: Math.max(1, Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)), count: 2
    };
    return points.length ? { ...points[0], distance: 1, count: 1 } : null;
  }
  function beginGesture() {
    const point = gesturePoints();
    // A single touch does not accidentally pan; reserve board gestures for two fingers.
    gesture = point && (point.count === 2 || point.type === "mouse" || point.type === "pen")
      ? { ...point, zoom, scale: boardScale(), panX, panY } : null;
    viewport.classList.toggle("is-dragging", Boolean(gesture));
  }
  function handleBoardPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const token = event.target.closest(".board-player-token");
    const space = event.target.closest("[data-board-index]");
    const index = token ? Number(token.dataset.position) : space ? Number(space.dataset.boardIndex) : -1;
    propertyTap = pointers.size === 0 && BOARD_SPACES[index]?.propertyId
      ? { pointerId: event.pointerId, x: event.clientX, y: event.clientY, propertyId: BOARD_SPACES[index].propertyId } : null;
    pointers.set(event.pointerId, pointerPoint(event));
    viewport.setPointerCapture(event.pointerId);
    beginGesture();
  }
  function handleBoardPointerMove(event) {
    if (!pointers.has(event.pointerId)) return;
    if (propertyTap && Math.hypot(event.clientX - propertyTap.x, event.clientY - propertyTap.y) > 6) propertyTap = null;
    pointers.set(event.pointerId, pointerPoint(event));
    const point = gesturePoints();
    if (!gesture || !point) return;
    markManualCamera();
    const logicalX = (gesture.x - gesture.panX) / gesture.scale, logicalY = (gesture.y - gesture.panY) / gesture.scale;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, gesture.zoom * point.distance / gesture.distance));
    setBoardPan(point.x - logicalX * boardScale(), point.y - logicalY * boardScale());
  }
  function handleBoardPointerUp(event) {
    const selectedProperty = event.type === "pointerup" && propertyTap?.pointerId === event.pointerId
      && Math.hypot(event.clientX - propertyTap.x, event.clientY - propertyTap.y) <= 6 ? propertyTap.propertyId : null;
    propertyTap = null;
    pointers.delete(event.pointerId);
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    beginGesture();
    if (selectedProperty && !getState().diceRollInProgress) onPropertySelect(selectedProperty);
  }
  function clearGestures() {
    for (const id of pointers.keys()) if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    pointers.clear(); gesture = null; propertyTap = null;
    viewport.classList.remove("is-dragging");
  }

  viewport.addEventListener("wheel", handleBoardWheel, { passive: false });
  viewport.addEventListener("pointerdown", handleBoardPointerDown);
  viewport.addEventListener("pointermove", handleBoardPointerMove);
  viewport.addEventListener("pointerup", handleBoardPointerUp);
  viewport.addEventListener("pointercancel", handleBoardPointerUp);
  viewport.addEventListener("lostpointercapture", event => {
    if (pointers.has(event.pointerId)) {
      propertyTap = null;
      pointers.delete(event.pointerId);
      beginGesture();
    }
  });
  viewport.addEventListener("keydown", event => {
    const offsets = { ArrowLeft: [60, 0], ArrowRight: [-60, 0], ArrowUp: [0, 60], ArrowDown: [0, -60] };
    if (offsets[event.key]) { event.preventDefault(); markManualCamera(); setBoardPan(panX + offsets[event.key][0], panY + offsets[event.key][1]); }
    if (["+", "=", "-"].includes(event.key)) { event.preventDefault(); markManualCamera(); setBoardZoom(zoom * (event.key === "-" ? 1 / 1.2 : 1.2)); }
  });
  $("boardZoomOut").addEventListener("click", () => { markManualCamera(); setBoardZoom(zoom / 1.2); });
  $("boardZoomIn").addEventListener("click", () => { markManualCamera(); setBoardZoom(zoom * 1.2); });
  $("boardZoomReset").addEventListener("click", () => { markManualCamera(); setBoardZoom(1); });
  $("boardCenterMe").addEventListener("click", () => { markManualCamera(); centerBoardOnPlayer(); });
  $("boardFit").addEventListener("click", () => { lastManualPan = Date.now(); fitBoardToViewport(); });
  dialog.addEventListener("close", clearGestures);
  const resizeObserver = new ResizeObserver(() => {
    if (!dialog.open) return;
    clearGestures();
    if (isOverview) fitBoardToViewport();
    else applyBoardCamera();
    updateBoardPlayers();
  });
  resizeObserver.observe(viewport);

  $("openBoardBtn").addEventListener("click", openBoardDialog);
  $("closeBoardBtn").addEventListener("click", closeBoardDialog);
  $("boardDiceBtn").addEventListener("click", onRollDice);
  function closeBoardActionMenus(except = null) {
    for (const menu of [$("boardClaimMenu"), $("boardPayMenu")]) if (menu !== except) menu.open = false;
  }
  for (const menu of [$("boardClaimMenu"), $("boardPayMenu")]) {
    menu.addEventListener("toggle", () => {
      if (!menu.open) return;
      closeBoardActionMenus(menu);
      // Wrapped action buttons can sit at either edge on a phone. Keep the
      // dropdown inside the dialog instead of letting a right-aligned menu escape.
      const options = menu.querySelector(".board-action-options");
      const anchor = menu.getBoundingClientRect(), bounds = dialog.getBoundingClientRect();
      const left = Math.max(bounds.left + 12, Math.min(anchor.left, bounds.right - options.offsetWidth - 12));
      options.style.left = `${left - anchor.left}px`;
      options.style.right = "auto";
    });
    menu.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); menu.open = false; menu.querySelector("summary").focus(); }
    });
  }
  document.addEventListener("pointerdown", event => {
    if (!event.target.closest(".board-action-menu")) closeBoardActionMenus();
  });
  dialog.addEventListener("close", () => closeBoardActionMenus());
  document.querySelectorAll("[data-board-action]").forEach(button => button.addEventListener("click", async () => {
    if (button.disabled || gameActionPending) return;
    closeBoardActionMenus();
    gameActionPending = true;
    updateBoardCenter();
    try { await onGameAction(button.dataset.boardAction); }
    finally { gameActionPending = false; updateBoardCenter(); }
  }));
  function acknowledgeCard() {
    $("boardCardDialog").close();
    activeCard = null;
    const next = cardQueue.shift();
    if (next) showCard(next);
  }
  $("closeBoardCard").addEventListener("click", acknowledgeCard);
  $("boardCardDialog").addEventListener("cancel", event => { event.preventDefault(); acknowledgeCard(); });
  $("boardCardDialog").addEventListener("close", () => {
    if ($("boardCardDialog").open) return;
    activeCard = null;
    const next = cardQueue.shift();
    if (next) showCard(next);
  });
  return { sync, reset, openBoardDialog, animatePlayerMovement, relocatePlayerOnBoard, finishMovement, setMovementError, drawChanceCard, drawCommunityChestCard, showCard, setDice };
}
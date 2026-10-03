# Monopoly Bank – GitHub Pages + Firebase

A static HTML/CSS/JavaScript Monopoly money manager that runs on GitHub Pages and uses Firebase Authentication + Cloud Firestore for shared realtime data.

## What is included

- Create a game and share an 8-character game code
- Join an existing game
- Add players and choose your local player
- Realtime balances on all connected devices
- Pay another player
- Pay the bank / receive money from the bank
- Transaction history
- Undo the latest non-reversed transaction
- Buy properties
- Mortgage / unmortgage properties
- Private player-to-player messages with replies
- Delete a game and its players, transactions, properties, and private messages
- Public, password-gated, and secret (code-only) game visibility options
- Interactive 40-space Helsinki board with live tokens, buildings, ownership and mortgages
- Animated normal-turn dice movement and informational Chance / Community Chest cards
- Board-only zoom, pan, token following, player centering and full-board overview
- No Node, Flask, npm or build step required

## 1. Create the Firebase project

1. Go to Firebase Console: https://console.firebase.google.com/
2. Click **Create a project**.
3. Choose a project name, for example `monopoly-bank-family`.
4. Google Analytics is not required for this app.

## 2. Create Cloud Firestore

1. In Firebase Console open **Build -> Firestore Database**.
2. Click **Create database**.
3. Use **Production mode**.
4. Choose a region close to you. For Finland, choose a suitable European location shown by Firebase.
5. Create the database.

You do not need to manually create collections. The app creates them automatically.
Player conversations are stored in the `privateMessages` subcollection. Its access rule is included in `firestore.rules`.

## 3. Enable Anonymous Authentication

1. Open **Build -> Authentication**.
2. Click **Get started**.
3. Open **Sign-in method**.
4. Enable **Anonymous**.
5. Save.

This lets every browser receive a temporary Firebase user ID without requiring a username/password screen.

## 4. Add the Firestore rules

1. Open **Firestore Database -> Rules**.
2. Replace the rule contents with the contents of `firestore.rules` from this repository.
3. Click **Publish**.

Publish the latest repository rules after adding features that use a new Firestore collection, including private messages.

These MVP rules require a Firebase-authenticated session. The app uses anonymous authentication automatically.

Important: this app stores only board-game data. The rule set is intentionally simple for private/family use and is not appropriate for sensitive information.
Private-message conversations are separated in the app by sender and recipient, but use the same authenticated game-invitation trust model as the other game data. Do not use this for confidential or sensitive messages.
Game passwords are randomly generated and shown to the creator once. With the current broad authenticated Firestore read rules, the password prompt is an application-level gate, not a security boundary against a technically capable authenticated user. Strong password protection and truly inaccessible secret games require server-side verification or membership-based Firestore rules.

## 5. Register the web app

1. Open **Project settings** (gear icon).
2. In **Your apps**, click the **Web** icon (`</>`).
3. Give it a nickname, e.g. `Monopoly Bank Web`.
4. You do **not** need Firebase Hosting because GitHub Pages will host the site.
5. Register the app.
6. Firebase shows a `firebaseConfig` object.
7. Copy those values into `firebase-config.js`.

Example shape:

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

The Firebase web `apiKey` is not a server password. Firebase web apps normally include this configuration in client-side code. Access control is handled by Firebase Authentication and Firestore Security Rules. Never put a Firebase service-account private key in this repository.

## 6. Test locally

Because JavaScript modules are used, don't open `index.html` using a `file://` URL.

Easy VS Code option:

- Install the **Live Server** extension.
- Right-click `index.html` -> **Open with Live Server**.

Or run any local static HTTP server.

Test with two browser windows:

1. Window A -> Create game -> Add two players.
2. Window B/private window -> Join with the game code.
3. Choose different players.
4. Make a payment and verify both screens update immediately.

## 7. Publish with GitHub Pages

Create a new repository, e.g. `monopoly-bank`.

Put these files in the repository root:

```text
monopoly-bank/
├── index.html
├── style.css
├── app.js
├── board.js
├── board.css
├── firebase-config.js
├── firestore.rules
├── Monopoly_bank.png
└── README.md
```

Then push to GitHub.

For an existing Pages deployment, commit and push the updated application files,
including the new `board.js` and `board.css`. No build, dependency installation or
database migration is needed. The `tests/` directory is optional for deployment;
the application never loads it. Keeping it in the repository is recommended for
future regression checks, but leaving it out of the published site (or removing it)
does not affect the game. Test pages use isolated sample data and do not access
live Firebase games.

These board/player-position features need no changes to the current repository
Firestore rules: the existing authenticated player writes already allow the new
fields. If your Firebase project's published rules differ from `firestore.rules`,
review that difference before deployment. Pushing to GitHub does **not** deploy
Firestore rules; any required rule publication happens separately in Firebase.
The existing broad authenticated rules are still MVP/family-use rules, not
membership-based security for a publicly accessible multi-user service.

In GitHub:

1. Open the repository.
2. Go to **Settings -> Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Branch: `main`.
5. Folder: `/ (root)`.
6. Save.

The address will normally be:

```text
https://YOUR-GITHUB-USERNAME.github.io/monopoly-bank/
```

## 8. Firebase authorized domains

For anonymous authentication, localhost and your deployed domain normally work with Firebase's web authentication flow, but if Firebase reports an unauthorized-domain error:

1. Open **Authentication -> Settings -> Authorized domains**.
2. Add your GitHub Pages hostname:

```text
YOUR-GITHUB-USERNAME.github.io
```

Do not add the `/monopoly-bank/` path; only the hostname is needed.

## Firestore data layout

```text
games/{gameCode}
  status
  createdAt
  createdBy
  heldJailCards              # card id -> owning player id (missing means free)
  jailCardVersion            # shared inventory revision
  cardDrawEvents             # last 20 shared draws, with drawer and ordered card ids

  players/{playerId}
    name
    balance
    icon
    color
    position                 # integer 0–39; legacy players default to GO
    boardMoveVersion         # optimistic movement revision
    boardLastRollId          # idempotency key for the last committed roll
    boardLastDiceTotal
    boardLastCard            # informational card id/type/rollId, or null
    createdAt

  transactions/{transactionId}
    type
    fromId
    toId
    amount
    reason
    createdAt
    reversed

  properties/{propertyId}
    name
    presetId
    ownerId
    price
    mortgageValue
    mortgaged
    houses                   # 0–4 houses; 5 is one hotel
    createdAt
```

## Interactive board

Open **Board** from the game view. A normal turn roll opens the board and moves the
selected player's piece one space at a time (160 ms per step); starting rolls never
move a piece. You can also open the existing dice dialog from the board toolbar.
The settled dice and total stay visible for one second before movement starts.

Every board opening starts with **Show full board**, on desktop and mobile.
**Follow my token** is unchecked by default; you can enable it when wanted.
The board toolbar also shows your selected player's live name/balance and provides
**Properties / Tontit**, **End turn**, **Private messages** (with unread count),
and two action dropdowns:

- **Claim / Lunasta:** Receive from the bank; Free Parking (live pot amount).
- **Pay / Maksa:** Pay player; Pay bank; Pay to center.

These reuse the existing banking and messaging dialogs above the board. Closing
them reveals the same board/camera state. Pot claims retain their confirmation
prompt, and End turn is unavailable when it is not your turn or movement is active.
Selecting an action, clicking outside a dropdown or pressing Escape closes it.
Feedback from manual actions is also shown inside the board footer.

Click or tap a property, station or utility to navigate its existing controls:
free spaces open **Properties / Tontit** with that property selected for buying or
auctioning. Owned spaces close the board and expand the owner's player list,
highlighting the chosen property's rent and mortgage details without switching
your selected player. Rent payments remain manual. Dragging or pinching does not
activate these shortcuts, and shortcuts are paused while dice/movement is active.

- Desktop: drag to pan; **Ctrl + mouse wheel** to zoom. An ordinary wheel does not zoom.
- The minus/percentage/plus zoom buttons are hidden; gesture and keyboard zoom,
  **Center on me** and **Show full board** remain available.
- Touch: use two fingers to pinch and pan inside the board. One finger does not move
  the camera. Native touch scrolling is unchanged outside the board viewport.
- Keyboard: focus the board viewport and use arrow keys to pan, or + / − to zoom.
- **Center on me** preserves zoom. **Show full board** fits all 40 spaces on any screen.
- The zoom control ranges from 55% to 300% relative to a responsive fit basis.
  On small screens this basis allows a full-board overview at the minimum zoom;
  use zoom controls and **Center on me** to inspect your player's surroundings.
- **Follow my token** gently follows movement, unless the camera was adjusted manually
  within the last four seconds.

The board uses the existing game, players and properties subscriptions. No new
listeners or collections are required, and the current Firestore rules already
allow the added player fields. There is no migration: missing positions are read
as GO, and new players are stored with `position: 0`.

Intermediate animation steps stay local. A transaction writes only the final
position and last-roll metadata. A retainable jail-card draw also updates the shared
game inventory in that same transaction. It checks the original turn, position and revision
so concurrent rolls from two devices cannot apply movement twice. If a commit
fails, the local token returns to the last synchronized position and the error is
shown inside the board. Other clients receive the final position through their
existing player snapshot. Closing the board does not cancel a roll; leaving the
game cancels its pending local animation.

Landing on Chance or Community Chest draws a card after a successful commit.
Cards with `movement` metadata automatically move to a named property, GO, the
next station/utility in the forward direction, backward three spaces, or directly
to jail. Forward/backward routes animate locally; direct jail movement does not
pass GO. Back-three can trigger a follow-up Community Chest draw. All resulting
positions, retained-card ownership and shared events commit atomically, with no
per-space writes or money changes. The rolling client animates the committed card
routes; other clients see the final position through their existing snapshot.

All clients already connected to the game receive each draw, labelled with the
drawer's name. **Acknowledge / Ymmärretty** dismisses only that viewer's popup;
multiple cards queue in draw order. Dismissal never runs effects or makes writes.
Initial connection treats existing events as history, rather than reopening old
cards. A bounded history of 20 draws covers ordinary live snapshot updates; this
is not a permanent activity log or guaranteed offline notification system.
Rerendering, repeated snapshots and acknowledgement cannot repeat a draw/effect.

**Payments, bank collections, GO salary, rent and jail rules remain manual.**
For card charges, use **Pay to center** to add money to the Free Parking pot;
for bank rewards, use **Receive**. Player-to-player charges still use **Pay player**.
Landing on **Go to Jail** immediately relocates the token to **Jail / Just Visiting**
(space 10), using the same final-position write. Passing the space does not trigger
the relocation. This adds no jail fines, skipped turns or release rules.
The existing third-double turn behavior is preserved; this is not a rules engine.

**Get Out of Jail Free cards:** the Chance and Community Chest release cards have
`keepUntilUsed: true`. Drawing either awards it to that player and excludes it from
all subsequent draws while held. The shared game inventory is rechecked inside the
transaction, so a concurrent client cannot claim the same card. Ordinary cards
still draw independently with replacement; this is not a fully shuffled deck.

A held-card button appears next to **Board**. Two cards show a stacked graphic and
count; opening it lets the player choose which deck's card to use. Use is enabled
from **Jail / Just Visiting (10)**, returns only the chosen card to its original
draw pool, and changes no balance or token position. Jail confinement, skipped
turns and release rolls are not enforced, so this currently uses the space position
as eligibility (including just visiting). Players can roll normally afterward.
Cards belonging to a deleted player become available after transactional verification
that the player document no longer exists. No new listeners, collections, rule
changes or migration are required. Old games default to an empty inventory.

The **Properties / Tontit** owned-property list uses the preset color-group order,
matching the player ownership lists, rather than purchase time.

### Isolated browser checks

Serve the repository with a static HTTP server and open `tests/board.html`.
The test page executes the actual application with an in-memory Firestore substitute,
not the Firebase SDK, and never connects to or changes a live game. It checks board
definitions, legacy positions, token layout, live property/pot updates, zoom limits,
step-by-step movement, one final write, idempotency, stale turns/revisions, GO wrapping,
card destinations, backwards/chained moves, shared draw acknowledgements and
deduplication, retained-card ownership, starting rolls, the one-second dice preview, property navigation,
tap-versus-drag/multitouch handling and failed-commit recovery. It also leaves the board open
with eight test players for manual desktop and touch gesture checks.

For headless browser runs with a virtual-time budget, append `?headless=1` to the
test page URL. This test-only mode uses timer-backed animation frames and disables
token/camera transitions to keep geometry checks deterministic. Normal interactive
tests and the actual application retain their original animations.

### Finnish / English coverage

The regression page also checks translation-key and interpolation parity, app
and board labels, accessible names, placeholders, all 40 board space names, cards,
and locale changes while dice results, payment, sale and message dialogs are open.
Changing language preserves selections, amounts, notes and unsent messages.
Property/station/utility names use the existing preset names for the selected language;
brand names and player-entered content remain unchanged. Saved activity reasons
and messages are historical/user content and are not retroactively translated.
Browser-native validation prompts and raw Firebase diagnostic messages may follow
the browser/service language rather than the app's FI/EN setting.

## Notes for the next version

Good next improvements would be:

- Automatic card effects and optional rule enforcement
- Property transfer/trading between players
- Dedicated banker/admin controls
- Stronger membership-based Firestore rules
- PWA / Add to Home Screen
- Game reset / end-game summary
- Offline handling


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
├── firebase-config.js
├── firestore.rules
└── README.md
```

Then push to GitHub.

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

  players/{playerId}
    name
    balance
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
    ownerId
    price
    mortgageValue
    mortgaged
    createdAt
```

## Notes for the next version

Good next improvements would be:

- Real Monopoly property list preloaded instead of manually entering names
- Houses/hotels and automatic rent calculation
- Property transfer/trading between players
- Dedicated banker/admin controls
- Stronger membership-based Firestore rules
- PWA / Add to Home Screen
- Player icons and colors
- Game reset / end-game summary
- Offline handling


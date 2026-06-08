# Kabal App — Design Document

## Overview

Kabal (Norwegian for Solitaire) is a React Native / Expo Go mobile application that delivers a classic solitaire card game with a modifiable ruleset, persistent sessions, and user accounts. The core promise is a faithful solitaire experience that players can tune to their liking — from custom sorting behaviour and card values to pre-built "template" game modes.

---

## User Types

| Role | Description |
|---|---|
| **Anonymous / Guest** | Can explore a limited preview of the app without an account |
| **Registered User** | Full access to game sessions, profile, and persistence |
| **Returning User** | Automatically authenticated via stored session token |

---

## Feature Scope

### Needs-To-Have (MVP)

| Feature | Description |
|---|---|
| **Authentication** | Sign up, login, logout, session token handling |
| **User Profile** | Persistent profile tied to the authenticated user |
| **User Persistence** | User data stored across sessions |
| **Gameboard** | Interactive view of the full game state |
| **Game State Persistence** | Save and resume an active solitaire round |
| **Modifiable Game Logic** | Players can alter rules and behaviours between rounds |
| **Deck State** | Represents and manages the state of the card deck |
| **Card State** | Individual card tracking (face-up, position, suit, value) |
| **Controls** | Player input handling (drag, tap, move) |
| **UX / View** | Core screen layout and navigation |

### Nice-To-Have (Post-MVP)

| Feature | Description |
|---|---|
| **Leaderboards** | Global or friend-based score rankings |
| **Subscriptions** | Recurring premium access tier |
| **Microtransactions** | One-time in-app purchases |
| **Tokens / Premium Currency** | Virtual currency for unlocking content |
| **Accolades** | Badges and achievements |
| **Daily Challenges** | Time-limited special game modes |
| **Skins** | Visual themes for cards and board |
| **Unlocks** | Content gated behind progression or purchase |
| **Sound Effects** | Audio feedback during gameplay |
| **Caravan (Fallout mode)** | Alternate card game mode inspired by Fallout's Caravan |
| **Balatro / Texas Hold'em / Modifiers** | Poker-inspired scoring overlays and rule modifiers |
| **Game Explorer** | Browse and select from saved or template game configurations |
| **Paid RNG** | Purchasable deck seeds or favourable shuffle outcomes |

---

## Authentication Requirements

1. A new user can register with email and password via Firebase `createUserWithEmailAndPassword()`.
2. An existing user can log in with email and password.
3. A valid session token stored in `AsyncStorage` can authenticate a returning user without re-entering credentials.
4. A user profile is created after successful registration.
5. Sessions are invalidated after a configurable period of inactivity; the user is then redirected to the login/signup/guest screen.
6. A guest user can access a limited view of the app without registering.

---

## Game Logic Requirements

1. A player can play a full round of solitaire.
2. A player can save the state of an active game round.
3. A player can resume a session from the exact point they left off.
4. A player can interact with the gameboard, deck, and individual cards to manipulate game state.
5. A player can modify game logic (rules, card values, sorting behaviour) between rounds.
6. The game must be intuitively understandable — rules must be discoverable in-app.
7. A player can define and apply custom rule sets.

---

## User Stories

### Authentication

**Create New User**
> As an anonymous user, I want to create a new user account, so that my data is persisted.

Acceptance: The user provides an email and password in a sign-up view. Firebase `createUserWithEmailAndPassword()` returns a successful `userCredential`. A reference is stored in React Native `AsyncStorage` for session persistence. The user is then routed to the home view.

---

**Login with Session Token**
> As an existing user, I want to log in passively using my session token, so that I don't have to enter my credentials each time I open the app.

Acceptance: On app launch, if a valid session exists in `AsyncStorage`, the user is validated automatically and routed directly to the protected home view, bypassing the login screen.

---

**Logout**
> As an existing user, I want to log out, so that my session is invalidated and my account is no longer accessible on this device.

Acceptance: The app calls Firebase `signOut()` with the auth object. The user is marked as logged out and routed back to the login/signup/guest screen.

---

**Invalidate Session Token**
> As an existing user, I want my session token to expire after a period of inactivity, so that other people using my device cannot access my account passively.

Acceptance: Firebase manages session token expiry in `AsyncStorage`. If the stored session is invalid on app launch, the user is automatically redirected to the login/signup/guest screen.

---

**User Profile Setup**
> As a user, I want to personalise my profile, so that I feel ownership over my app experience.

Acceptance: After registration, the user can set up a profile (display name, avatar, etc.). Profile data is stored persistently and linked to their Firebase account.

---

**Guest / Trial User**
> As an anonymous user, I want to try the app, so that I can decide whether to register.

Acceptance: A guest user can navigate a limited guest view with a restricted app experience, giving enough context to motivate sign-up.

---

### Game Logic

**Start Solitaire Game**
> As a user, I want to start a solitaire game, so that I can play a round.

Acceptance: The user successfully initiates a new game session. The session overrides any existing active session in the user's route in Firebase Realtime Database. After game start, the user has a valid game session object.

---

**Create Game Session**
> As a user, I want to start a game session, so that it tracks my game state while I play.

Acceptance: The user initiates a game session with a provided configuration. The session is written to Firebase Realtime Database at a route keyed by a unique session UUID.

---

**Random Sorted Deck**
> As a user, I want a randomly sorted deck of cards, so that the game session can use it to start a round of solitaire.

Acceptance: Initiating a game session produces a valid, randomly ordered deck object that represents the initial `DeckState` for the session.

---

**Game Session Persistence**
> As a user, I want to resume my game from where I left off, so that I don't have to start a new session every time I open the app.

Acceptance: On app launch, if an active game session exists in Firebase Realtime Database, it is loaded automatically. If no session exists, the user can create a new one.

---

**Game State Represented on Game Board**
> As a user, I want an interactive view of the game state, so that I can manipulate it according to the rules of solitaire.

Acceptance: The gameboard view receives a game state object and renders the complete state to the user. All cards, piles, and zones are represented and interactable.

---

**Modifiable Game Rules**
> As a user, I want to modify the game rules and behaviours, so that I get a personalised experience.

Acceptance: The user can define a custom rule set and apply it as a configuration when starting a new game session.

---

**Custom Sorting Behaviour**
> As a user, I want to manipulate how the deck is sorted, so that I can personalise the difficulty of the game.

Acceptance: The user can provide or infer custom sorting behaviour for generating a `DeckState` when starting a session.

---

**Custom Card Values**
> As a user, I want to modify card values, so that I get a personalised scoring experience.

Acceptance: The user can provide or update scoring values for any card in the deck before starting a session.

---

**Template Modifiers**
> As a user, I want to pick from pre-generated play experiences, so that I can try new ways of playing solitaire.

Acceptance: The user is offered a set of templates representing valid, pre-built configuration rule sets. Selecting a template applies it as the configuration for the next game session.

---

## Technical Stack

| Concern | Technology |
|---|---|
| Mobile Framework | React Native (Expo Go) |
| Authentication | Firebase Authentication |
| Realtime Persistence | Firebase Realtime Database |
| Session Storage | React Native AsyncStorage |
| Language | TypeScript |

---

## State Model (Core)

| State Object | Responsibility |
|---|---|
| `UserState` | Authenticated user identity and profile data |
| `DeckState` | Ordered collection of all 52 cards |
| `CardState` | Per-card metadata: suit, value, face-up, position |
| `GameBoardState` | Layout of columns, foundation piles, and stock/waste |
| `GameSession` | Active session UUID, config, and a reference to current board/deck state |

---

## Views / Screens

| Screen | Access | Description |
|---|---|---|
| **Signup / Login / Guest** | Public | Entry point — register, log in, or continue as guest |
| **Home** | Authenticated | Dashboard — start game, resume session, access profile |
| **Game Board** | Authenticated | The interactive solitaire board |
| **Game Config** | Authenticated | Set rules, sorting behaviour, and card values before starting |
| **Profile** | Authenticated | View and edit user profile |
| **Guest View** | Guest | Limited preview of app features to encourage sign-up |


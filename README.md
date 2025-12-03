# Group Activity Planner (MERN Stack)

A full-stack MERN application that helps groups plan activities, track participation, coordinate availability, and manage event progression from creation → finalization → completion.

This project is built for learning real-world full-stack development patterns using Node.js, Express, MongoDB, React (Vite), and Bootstrap.

---

## Features Overview

### User Accounts

* Simple email + password authentication (no hashing, for learning only).
* The frontend stores `userId` in `localStorage` to simulate sessions.
* Backend never returns passwords.

### Activities

Each activity includes:

* Event title, description, location, cost, agenda, contact info
* Event date with time (mandatory)
* Voting date with time (optional)
* What to bring / what’s provided lists
* Auto-finalize option during creation
* Participants list with statuses and availability

Participants can have one of four statuses:

* **interested**
* **confirmed**
* **declined**
* **not_participating**

Availability is free-text (array of strings). Empty availability is interpreted by UI as “available anytime.”

---

## Activity States & Rules

### 1. Active (default)

The activity is upcoming and editable. Creator can:

* Edit all fields (except those locked by finalization).
* Manage participants.
* Finalize the event.
* Cancel the activity.

### 2. Finalized

The creator has clicked **Finalize Event**. After finalization:

* `eventDate`, `votingDate`, and `location` are locked.
* Other fields remain editable.
* The activity continues in this state until the event date/time has passed.

### 3. Completed

When an activity is finalized and the event date/time has passed, it becomes completed.

Completed activities are **strictly read-only**:

* No deleting (even by creator).
* No editing any field.
* No changing participant statuses.
* No rejoining or leaving.

### 4. Cancelled

Creator can cancel at any time. After cancellation:

* Activity becomes read-only except for the description (creator only).
* All participants switch to `not_participating`.
* Creator may delete it after 7 days.
* Participants cannot rejoin.

---

## Date & Time Rules

### Event Date/Time

* Mandatory for create and edit.
* Must always be in the future.
* Backend rejects any event whose date/time is in the past.
* Editing an activity to a past event date/time is also rejected.

### Voting Date/Time

* Fully optional.
* No automation in backend.
* Cannot exceed the event date/time.
* Allowed to be missing or earlier than the event.
* If missing, the activity has no voting requirements.

### Auto-Finalize Checkbox

* Appears **only on the Create Activity page**.
* Allows creator to immediately mark the event as finalized at creation time.
* Does not appear in edit mode.

---

## Technology Stack

### Frontend

* React 19 (Vite)
* React Router
* Axios
* Bootstrap 5
* Componentized architecture for clean code and reusability

### Backend

* Node.js + Express
* MongoDB with Mongoose
* CORS enabled
* Organized routes and controllers
* Custom schema methods for date logic

---

## API Overview

### Users

* Register
* Login
* Get all users
* Get user by ID

### Activities

* Create activity

  * Adds creator as the first participant
  * Optional voting date/time
  * Enforces event date/time validity
  * Optional auto-finalize
* Edit activity

  * Creator only
  * Denies editing finalized fields
  * Denies editing cancelled or completed activities
* Finalize activity

  * Locks certain fields
* Cancel activity

  * Read-only afterwards
* Delete activity

  * Creator only
  * Allowed only if:

    * Creator is the only participant, or
    * Activity was cancelled and `cancelledAt` ≥ 7 days
  * Not allowed for **completed** activities
* Join / Leave activity
* Update participant status
* Update availability

---

## Frontend Structure

### Pages

* Home
* Login
* Register
* Activities list
* Activity details
* Create activity

### Components (partial list)

* Navbar
* ActivityItem
* ActivityHeader
* ActivityInfoCard
* ActivityEditForm
* ParticipantsList
* ParticipationButtons
* UserStatusBox
* AvailabilityEditor
* CreatorControls
* CancelledView

---

## How to Run the Project

### 1. Backend

cd server
npm install
npm start


Runs at `http://localhost:3000`.

### 2. Frontend

cd client
npm install
npm run dev


Frontend runs at the Vite dev server URL (usually `http://localhost:5173`).

### 3. Both

do npm install on both client and server folder for missing dependencies
cd to root folder
npm install -D concurrently

add this in package.json
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "client": "npm run dev --prefix client",
    "server": "npm start --prefix server",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
  },

  npm run dev
  
---

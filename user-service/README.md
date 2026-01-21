# User Service

The **User Service** is responsible for:

* Creating users
* Persisting user identity
* Initializing a wallet entry atomically

This service does **not** manage authentication credentials.

---

## 🧱 Responsibilities

* Owns the **Users database**
* Generates the `userId`
* On user creation, initializes a wallet record in the wallet database
* Ensures atomicity across databases using transactional control

---

## 🔐 Authentication

* JWT-based authentication
* JWT validation handled by Passport
* Private key loaded from environment variable: `ILIACHALLENGE`

---

## 📌 Endpoints

### `POST /users`

Creates a new user.

**Behavior:**

* Creates the user in the Users database
* Creates a wallet entry with balance = 0 in the Wallet database
* If any step fails, the entire operation is rolled back

---

## ▶️ Running the service

### Environment variables

```env
DATABASE_URL=postgresql://postgres:pass@localhost:5433/users
WALLET_DATABASE_URL=postgresql://postgres:pass@localhost:5434/wallet
JWT_SECRET=ILIACHALLENGE
PORT=3000
```

### Install dependencies

```bash
npm install
```

### Start the service

```bash
npm run start:dev
```

## Run tests

```bash
npm run test
```

---

## 🧠 Notes

* This service **does not perform wallet operations**
* It only ensures that a wallet exists for every user

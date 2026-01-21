# ília - Code Challenge NodeJS
**English**
##### Before we start ⚠️
**Please create a fork from this repository**

## The Challenge:
One of the ília Digital verticals is Financial and to level your knowledge we will do a Basic Financial Application and for that we divided this Challenge in 2 Parts.

The first part is mandatory, which is to create a Wallet microservice to store the users' transactions, the second part is optional (*for Seniors, it's mandatory*) which is to create a Users Microservice with integration between the two microservices (Wallet and Users), using internal communications between them, that can be done in any of the following strategies: gRPC, REST, Kafka or via Messaging Queues and this communication must have a different security of the external application (JWT, SSL, ...), **Development in javascript (Node) is required.**

![diagram](diagram.png)

### General Instructions:
## Part 1 - Wallet Microservice

This microservice must be a digital Wallet where the user transactions will be stored 

### The Application must have

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.
    - Have a dedicated database (Postgres, MySQL, Mongo, DynamoDB, ...).
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Configure the Microservice port to 3001. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a team work and not just a commit.

## Part 2 - Microservice Users and Wallet Integration

### The Application must have:

    - Project setup documentation (readme.md).
    - Application and Database running on a container (Docker, ...).
    - This Microservice must receive HTTP Request.   
    - Have a dedicated database(Postgres, MySQL, Mongo, DynamoDB...), you may use an Auth service like AWS Cognito.
    - JWT authentication on all routes (endpoints) the PrivateKey must be ILIACHALLENGE (passed by env var).
    - Set the Microservice port to 3002. 
    - Gitflow applied with Code Review in each step, open a feature/branch, create at least one pull request and merge it with Main(master deprecated), this step is important to simulate a teamwork and not just a commit.
    - Internal Communication Security (JWT, SSL, ...), if it is JWT the PrivateKey must be ILIACHALLENGE_INTERNAL (passed by env var).
    - Communication between Microservices using any of the following: gRPC, REST, Kafka or via Messaging Queues (update your readme with the instructions to run if using a Docker/Container environment).

## 🧠 Architectural Decisions

### Microservices with isolated databases

Each microservice owns its own database:

- User DB → user identity data
- Wallet DB → wallet, balance, and transactions

Although databases are isolated, both services are aware of the userId, which allows:

- Faster queries
- No cross-service joins
- Clear ownership of data

This mirrors real-world financial systems where data duplication is intentional for performance and autonomy.

### Monetary safety

Because this system handles monetary movements:

- Prisma ORM was chosen

- All balance updates and transactions use SQL transactions

- Pessimistic locking (FOR UPDATE) is used to prevent race conditions

This guarantees:

- No double spending
- No inconsistent balances

### Authentication

- JWT authentication is enforced on all protected routes
- The private key is provided via environment variable (ILIACHALLENGE)
- Passwords are not handled by this system

Authentication is delegated to Firebase, which:

- Manages credentials securely
- Reduces attack surface
- Avoids handling sensitive data in application code

## 🔧 Things That Could Be Improved

- Introduce a Turbo Repository (monorepo)
- Extract Prisma Clients into shared packages
- Reduce Prisma boilerplate across services
- Simplify imports and scaling when new microservices are added

## Start Everything

```bash
docker-compose up --build
```

## ✅ Summary

This project focuses on:

- Clean separation of responsibilities
- Strong consistency guarantees
- Real-world financial backend practices
- Production-oriented architecture
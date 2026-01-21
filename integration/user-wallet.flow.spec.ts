import "dotenv/config";
import { spawn, ChildProcess } from "child_process";

// aumenta timeout global do Jest
jest.setTimeout(60_000);

let userService: ChildProcess;
let walletService: ChildProcess;
let token: string;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForService(baseUrl: string, retries = 30) {
   for (let i = 0; i < retries; i++) {
      try {
         const res = await fetch(baseUrl, { method: "GET" });
         // Se respondeu, o serviço subiu (mesmo que 404)
         if (res.status < 500) return;
      } catch (_) {
         // conexão ainda não disponível
      }
      await wait(500);
   }

   throw new Error(`Service not available: ${baseUrl}`);
}

describe("User + Wallet integration", () => {
   beforeAll(async () => {
      console.log("Starting services...");

      // USER SERVICE
      userService = spawn("npm", ["run", "start:dev"], {
         cwd: "../user-service",
         stdio: "inherit",
         env: {
            ...process.env,
            PORT: "3001",
         },
      });

      // WALLET SERVICE
      walletService = spawn("npm", ["run", "start:dev"], {
         cwd: "../wallet-service",
         stdio: "inherit",
         env: {
            ...process.env,
            PORT: "3002",
         },
      });

      await Promise.all([
         waitForService(process.env.USER_SERVICE_URL!),
         waitForService(process.env.WALLET_SERVICE_URL!),
      ]);

      console.log("Services are up 🚀");
   });

   afterAll(async () => {
      console.log("Stopping services...");

      if (userService) {
         userService.kill("SIGTERM");
      }

      if (walletService) {
         walletService.kill("SIGTERM");
      }

      await wait(1000);
   });

   it("should create user", async () => {
      const res = await fetch(`${process.env.USER_SERVICE_URL}/users`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD,
            first_name: "Integration",
            last_name: "Test",
         }),
      });

      expect(res.status).toBe(201);
   });

   it("should login", async () => {
      const res = await fetch(`${process.env.USER_SERVICE_URL}/auth/login`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            email: process.env.TEST_USER_EMAIL,
            password: process.env.TEST_USER_PASSWORD,
         }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      console.log("body: ", body);
      token = body.access_token;
      console.log("body.access_token: ", body.access_token);

      expect(token).toBeDefined();
   });

   it("should credit wallet", async () => {
      const res = await fetch(
         `${process.env.WALLET_SERVICE_URL}/transactions`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               amount: 100,
               type: "CREDIT",
            }),
         },
      );

      expect(await res.json()).toEqual({ success: true });
      expect(res.status).toBe(201);
   });

   it("should debit wallet", async () => {
      const res = await fetch(
         `${process.env.WALLET_SERVICE_URL}/transactions`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               amount: 40,
               type: "DEBIT",
            }),
         },
      );

      expect(res.status).toBe(201);
   });

   it("should return balance", async () => {
      const res = await fetch(`${process.env.WALLET_SERVICE_URL}/balance`, {
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.amount).toBe(60);
   });

   it("should fail on insufficient balance", async () => {
      const res = await fetch(
         `${process.env.WALLET_SERVICE_URL}/transactions`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               amount: 1000,
               type: "DEBIT",
            }),
         },
      );

      expect(res.status).toBe(400);
   });
});

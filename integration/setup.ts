import { execSync } from 'child_process';

export default async function setup() {
  execSync(
    'docker compose -f integration/docker-compose.integration.yml up -d',
    { stdio: 'inherit' }
  );

  execSync('sleep 5');

  execSync(
    'cd user-service && DATABASE_URL=postgresql://postgres:pass@localhost:5434/users npx prisma migrate deploy',
    { stdio: 'inherit' }
  );

  execSync(
    'cd wallet-service && DATABASE_URL=postgresql://postgres:pass@localhost:5434/wallet npx prisma migrate deploy',
    { stdio: 'inherit' }
  );
}

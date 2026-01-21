import { execSync } from 'child_process';

export default async function teardown() {
  execSync(
    'docker compose -f integration/docker-compose.integration.yml down -v',
    { stdio: 'inherit' }
  );
}

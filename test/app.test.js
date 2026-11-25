// Basic tests run by the CI pipeline (GitHub Actions) before deploying.
// They check that the app starts and that protected routes require login.
// No database is needed for these tests.
const { test, before, after } = require('node:test');
const assert = require('node:assert');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const app = require('../app');

let server;
let baseUrl;

before(() => {
  server = app.listen(0); // random free port
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test('login page loads', async () => {
  const res = await fetch(`${baseUrl}/login`);
  assert.strictEqual(res.status, 200);
});

test('register page loads', async () => {
  const res = await fetch(`${baseUrl}/register`);
  assert.strictEqual(res.status, 200);
});

for (const path of ['/dashboard', '/products', '/categories', '/suppliers', '/users']) {
  test(`${path} redirects to login when not authenticated`, async () => {
    const res = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
    assert.strictEqual(res.status, 302);
    assert.strictEqual(res.headers.get('location'), '/login');
  });
}

test('invalid token is rejected', async () => {
  const res = await fetch(`${baseUrl}/dashboard`, {
    redirect: 'manual',
    headers: { Cookie: 'token=not-a-real-token' }
  });
  assert.strictEqual(res.status, 302);
  assert.strictEqual(res.headers.get('location'), '/login');
});

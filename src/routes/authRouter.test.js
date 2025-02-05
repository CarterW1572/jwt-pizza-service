const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const badTestUser = { name: 'pizza diner', email: 'reg@test.com', password: 'b' };
const testUserMissing = { name: 'pizza diner', email: 'reg@test.com' };
let testUserAuthToken;

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  user = await DB.addUser(user);
  auth = setAuthUser(user);
  return { ...user, password: 'toomanysecrets', token: auth };
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test('register-fail', async() => {
    testUserMissing.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const registerRes = await request(app).post('/api/auth').send(testUserMissing);
    expect(registerRes.status).toBe(400);
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expectValidJwt(loginRes.body.token);
  testUserAuthToken = loginRes.body.token;

  const expectedUser = { ...testUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;
  expect(loginRes.body.user).toMatchObject(expectedUser);
  const logoutRes = await request(app).delete('/api/auth').set('Authorization', `Bearer ${testUserAuthToken}`).send(testUser);
  expect(logoutRes.status).toBe(200);
});

test('login-fail', async () => {
  const loginRes = await request(app).put('/api/auth').send(badTestUser);
  expect(loginRes.status).toBe(404);
});

test('logout-fail', async () => {
  await request(app).put('/api/auth').send(testUser);  
  const logoutRes = await request(app).delete('/api/auth').send(testUser);
  expect(logoutRes.status).toBe(401);
});
/*
test('update-user', async () => {
  user = createAdminUser();
  const updateRes = await request(app).put('/api/auth').set('Authorization', `Bearer ${user.body.token}`).send(user);
  expect(updateRes.status).toBe(200);
});
*/
function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
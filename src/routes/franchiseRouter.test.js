const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
const badTestUser = { name: 'pizza diner', email: 'reg@test.com', password: 'b' };
const testUserMissing = { name: 'pizza diner', email: 'reg@test.com' };
let testUserAuthToken;
let testAdmin;

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }
  
async function createAdminUser() {
  let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';

  console.log('Admin: ', user);
  testAdmin = user;
  
  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
  createAdminUser();
});

test('create-franchise', async () => {
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  auth = loginRes.body.token;
  console.log('Login Response: ', loginRes.body);
  const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${auth}`).send(testAdmin);
  expect(createFranchiseRes.status).toBe(200);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
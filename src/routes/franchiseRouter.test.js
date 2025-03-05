const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let testAdmin = { name: 'admin', email: 'admin@admin.com', password : 'a' };

function randomName() {
    return Math.random().toString(36).substring(2, 12);
  }
  
async function createAdminUser() {
  let user = { name: 'admin', email: 'admin@admin.com', password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
  user.name = randomName();
  user.email = user.name + '@admin.com';
  
  user = await DB.addUser(user);
  return { ...user, password: 'toomanysecrets' };
}

beforeAll(async () => {
  testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
  const registerRes = await request(app).post('/api/auth').send(testUser);
  testUserAuthToken = registerRes.body.token;
  expectValidJwt(testUserAuthToken);
});

test('create-franchise', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let adminEmail = testAdmin.email;
  let fname = randomName();
  const franchise = { name: `${fname}`, admins: [{email: `${adminEmail}`}]};
  const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${auth}`).send(franchise);
  expect(createFranchiseRes.status).toBe(200);
});

test('delete-franchise', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let adminEmail = testAdmin.email;
  let fname = randomName();
  const franchise = { name: `${fname}`, admins: [{email: `${adminEmail}`}]};
  const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${auth}`).send(franchise);
  expect(createFranchiseRes.status).toBe(200);
  let fid = createFranchiseRes.body.id;
  const deleteFranchiseRes = await request(app).delete(`/api/franchise/${fid}`).set('Authorization', `Bearer ${auth}`);
  expect(deleteFranchiseRes.status).toBe(200);
});

test('create-store', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let adminEmail = testAdmin.email;
  let fname = randomName();
  const franchise = { name: `${fname}`, admins: [{email: `${adminEmail}`}]};
  const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${auth}`).send(franchise);
  expect(createFranchiseRes.status).toBe(200);
  let fid = createFranchiseRes.body.id;
  let sname = randomName();
  const store = { franchiseId: `${fid}`, name: `${sname}` };
  const createStoreRes = await request(app).post(`/api/franchise/${fid}/store`).set('Authorization', `Bearer ${auth}`).send(store);
  expect(createStoreRes.status).toBe(200);
});

test('delete-store', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let adminEmail = testAdmin.email;
  let fname = randomName();
  const franchise = { name: `${fname}`, admins: [{email: `${adminEmail}`}]};
  const createFranchiseRes = await request(app).post('/api/franchise').set('Authorization', `Bearer ${auth}`).send(franchise);
  expect(createFranchiseRes.status).toBe(200);
  let fid = createFranchiseRes.body.id;
  let sname = randomName();
  const store = { franchiseId: `${fid}`, name: `${sname}` };
  const createStoreRes = await request(app).post(`/api/franchise/${fid}/store`).set('Authorization', `Bearer ${auth}`).send(store);
  expect(createStoreRes.status).toBe(200);
  let sid = createStoreRes.body.id;
  const deleteStoreRes = await request(app).delete(`/api/franchise/${fid}/store/${sid}`).set('Authorization', `Bearer ${auth}`);
  expect(deleteStoreRes.status).toBe(200);
});

test('get-franchises', async () => {
  const getFranchiseRes = await request(app).get('/api/franchise');
  expect(getFranchiseRes.status).toBe(200);
});

test('get-user-franchises', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let uid = loginRes.body.user.id;
  const getUserFranchises = await request(app).get(`/api/franchise/${uid}`).set('Authorization', `Bearer ${auth}`);
  expect(getUserFranchises.status).toBe(200);
});

function expectValidJwt(potentialJwt) {
  expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}

// try deploy again
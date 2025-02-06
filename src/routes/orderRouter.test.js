const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const testUser = { name: 'pizza diner', email: 'reg@test.com', password: 'a' };
let testUserAuthToken;
let testAdmin = { name: 'admin', email: 'admin@admin.com', password : 'a' };

function randomName() {
    return Math.random().toString(36).substring(2, 12);
}

function randomNum() {
    return Math.random();
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

test('get-menu', async () => {
  const getMenuRes = await request(app).get('/api/order/menu');
  expect(getMenuRes.status).toBe(200);
});

test('add-menu-item', async () => {
  testAdmin = await createAdminUser();
  const loginRes = await request(app).put('/api/auth').send(testAdmin);
  expect(loginRes.status).toBe(200);
  let auth = loginRes.body.token;
  let iname = randomName();
  let iprice = randomNum();
  const item = { title: `${iname}`, description: 'No topping, no sauce, just carbs', image: 'pizza9.png', price: `${iprice}` }
  const addMenuItemRes = await request(app).put('/api/order/menu').set('Authorization', `Bearer ${auth}`).send(item);
  expect(addMenuItemRes.status).toBe(200);
});

function expectValidJwt(potentialJwt) {
    expect(potentialJwt).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);
}
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  if (process.env.CI) {
    // Use MongoDB service in CI
    await mongoose.connect('mongodb://localhost:27017/test');
  } else {
    // Use MongoMemoryServer locally
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  // clear db
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

test('createRegistration: happy path and duplicate', async () => {
  const { GiftEvent, GiftRegistration, User, Household, Citizen } = require('../models');
  const giftEventService = require('../services/giftEventService');

  // create necessary citizen and household (household requires head)
  const citizen = await Citizen.create({ code: 'CIT1', fullName: 'Nguyen Van A', dateOfBirth: new Date('1990-01-01') });
  const household = await Household.create({ code: 'HH1', address: { street: 'A', ward: 'W', district: 'D', city: 'C' }, head: citizen._id, members: [citizen._id] });
  // link citizen -> household
  citizen.household = household._id;
  await citizen.save();

  // create event with 2 slots
  const now = new Date();
  const ev = await GiftEvent.create({ title: 'Test Event', startDate: new Date(now.getTime() - 1000*60), endDate: new Date(now.getTime() + 1000*60*60), slotsTotal: 2, slotsRemaining: 2, status: 'OPEN' });

  // first registration
  const r1 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen._id });
  expect(r1.success).toBe(true);
  expect(r1.registration).toBeDefined();
  // slotsRemaining decreased
  const eAfter1 = await GiftEvent.findById(ev._id);
  expect(eAfter1.slotsRemaining).toBe(1);

  // duplicate registration attempt
  const rDup = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen._id });
  expect(rDup.success).toBe(false);
  expect(rDup.reason).toBe('ALREADY_REGISTERED');

  // second citizen registers
  const citizen2 = await Citizen.create({ code: 'CIT2', fullName: 'Tran Thi B', dateOfBirth: new Date('1985-05-05'), household: household._id });
  const r2 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen2._id });
  expect(r2.success).toBe(true);
  const eAfter2 = await GiftEvent.findById(ev._id);
  expect(eAfter2.slotsRemaining).toBe(0);

  // third citizen should fail due to full
  const citizen3 = await Citizen.create({ code: 'CIT3', fullName: 'Le C', dateOfBirth: new Date('1970-07-07'), household: household._id });
  const r3 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen3._id });
  expect(r3.success).toBe(false);
  expect(['EVENT_FULL_OR_CLOSED','ALREADY_REGISTERED']).toContain(r3.reason);
}, 20000);

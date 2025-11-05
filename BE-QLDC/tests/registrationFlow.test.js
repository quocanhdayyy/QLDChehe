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
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  // clean collections
  const collections = Object.keys(mongoose.connection.collections);
  for (const c of collections) {
    await mongoose.connection.collections[c].deleteMany({});
  }
});

test('registration flow: create event, register, prevent duplicates, full event', async () => {
  const { GiftEvent, GiftRegistration, Citizen, Household } = require('../models');
  const giftEventService = require('../services/giftEventService');

  // create citizen and household
  const citizen = await Citizen.create({ fullName: 'Test User', dateOfBirth: new Date('1990-01-01'), code: 'CIT1' });
  const household = await Household.create({ code: 'HH1', head: citizen._id });
  citizen.household = household._id;
  await citizen.save();

  // create event via service
  const now = new Date();
  const ev = await giftEventService.create({
    title: 'Test Event',
    description: 'Desc',
    startDate: new Date(now.getTime() - 1000 * 60),
    endDate: new Date(now.getTime() + 1000 * 60 * 60),
    slotsTotal: 2,
    status: 'OPEN',
  });

  // register first time
  const r1 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen._id });
  expect(r1.success).toBe(true);
  const updatedEventAfter1 = await GiftEvent.findById(ev._id);
  expect(updatedEventAfter1.slotsRemaining).toBe(1);

  // duplicate registration should fail
  const rDup = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen._id });
  expect(rDup.success).toBe(false);
  expect(rDup.reason).toBe('ALREADY_REGISTERED');

  // register second distinct citizen
  const citizen2 = await Citizen.create({ fullName: 'Other', dateOfBirth: new Date('1992-01-01'), code: 'CIT2' });
  const hh2 = await Household.create({ code: 'HH2', head: citizen2._id });
  citizen2.household = hh2._id; await citizen2.save();

  const r2 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen2._id });
  expect(r2.success).toBe(true);
  const updatedEventAfter2 = await GiftEvent.findById(ev._id);
  expect(updatedEventAfter2.slotsRemaining).toBe(0);

  // another citizen should get EVENT_FULL_OR_CLOSED
  const citizen3 = await Citizen.create({ fullName: 'Third', dateOfBirth: new Date('1993-01-01'), code: 'CIT3' });
  const hh3 = await Household.create({ code: 'HH3', head: citizen3._id });
  citizen3.household = hh3._id; await citizen3.save();

  const r3 = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen3._id });
  expect(r3.success).toBe(false);
  expect(r3.reason).toBe('EVENT_FULL_OR_CLOSED');
});

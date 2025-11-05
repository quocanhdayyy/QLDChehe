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

test('mark registration as received and create audit log', async () => {
  const { GiftEvent, GiftRegistration, Citizen, Household, AuditLog } = require('../models');
  const giftEventService = require('../services/giftEventService');
  const auditLogService = require('../services/auditLogService');

  // create citizen and household
  const citizen = await Citizen.create({ fullName: 'Receiver', dateOfBirth: new Date('1990-01-01'), code: 'RCV1' });
  const household = await Household.create({ code: 'RHH1', head: citizen._id });
  citizen.household = household._id; await citizen.save();

  // create event
  const now = new Date();
  const ev = await giftEventService.create({
    title: 'Receive Event',
    startDate: new Date(now.getTime() - 1000 * 60),
    endDate: new Date(now.getTime() + 1000 * 60 * 60),
    slotsTotal: 1,
    status: 'OPEN',
  });

  // register
  const regRes = await giftEventService.createRegistration({ eventId: ev._id, citizenId: citizen._id });
  expect(regRes.success).toBe(true);
  const registration = await GiftRegistration.findById(regRes.registration._id).populate('event citizen');
  expect(registration.status).toBe('REGISTERED');

  // mark received by qr
  const qr = registration.qrCode;
  const marked = await giftEventService.markReceivedByQr(qr);
  expect(marked.success).toBe(true);
  const regAfter = await GiftRegistration.findById(registration._id);
  expect(regAfter.status).toBe('RECEIVED');
  expect(regAfter.receivedAt).toBeTruthy();

  // create audit log for receive action
  const al = await auditLogService.create({
    action: 'GIFT_REGISTRATION_RECEIVE',
    entityType: 'GiftRegistration',
    entityId: regAfter._id,
    performedBy: null,
    after: regAfter,
  });
  expect(al).toBeTruthy();
  const stored = await AuditLog.findById(al._id);
  expect(stored.action).toBe('GIFT_REGISTRATION_RECEIVE');
});

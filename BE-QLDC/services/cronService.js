const cron = require('node-cron');
const { GiftEvent, GiftRegistration } = require('../models');
const auditLogService = require('./auditLogService');
const notificationService = require('./notificationService');

/**
 * Cron service
 * - Reminder: send notifications to registered users X hours before event end
 * - Expire: set events to EXPIRED when endDate passed
 *
 * Env:
 *  REMINDER_HOURS_BEFORE (number) default 24
 *  CRON_EXPRESSION (string) default '0 * * * *' (every hour at minute 0)
 */
module.exports = {
  startCronJobs() {
    const reminderHours = Number(process.env.REMINDER_HOURS_BEFORE) || 24;
    const cronExpr = process.env.CRON_EXPRESSION || '0 * * * *'; // every hour

    const job = async () => {
      try {
        const now = new Date();

        // 1) Reminders: events ending in ~reminderHours (between H-1 and H)
        const from = new Date(now.getTime() + (reminderHours - 1) * 3600 * 1000);
        const to = new Date(now.getTime() + reminderHours * 3600 * 1000);
        const endingSoon = await GiftEvent.find({ endDate: { $gte: from, $lte: to }, status: 'OPEN' });
        for (const ev of endingSoon) {
          // find registrations that are still REGISTERED
          const regs = await GiftRegistration.find({ event: ev._id, status: 'REGISTERED' }).populate({ path: 'citizen', populate: { path: 'user', model: 'User' } });
          for (const r of regs) {
            const toUser = r.citizen && r.citizen.user ? r.citizen.user._id : null;
            if (!toUser) continue; // skip if no linked user
            await notificationService.create({
              toUser,
              title: `Nhắc: Sự kiện sắp kết thúc - ${ev.title}`,
              message: `Sự kiện "${ev.title}" sẽ kết thúc vào ${ev.endDate.toISOString()}. Vui lòng đến nhận quà nếu bạn đã đăng ký.`,
              type: 'SYSTEM',
              entityType: 'GiftEvent',
              entityId: ev._id,
            });
          }
        }

        // 2) Expire events that passed endDate
        const toExpire = await GiftEvent.find({ endDate: { $lt: now }, status: 'OPEN' });
        if (toExpire.length > 0) {
          const ids = toExpire.map(e => e._id);
          await GiftEvent.updateMany({ _id: { $in: ids } }, { status: 'EXPIRED' });
          for (const ev of toExpire) {
            await auditLogService.create({
              action: 'GIFT_EVENT_EXPIRE',
              entityType: 'GiftEvent',
              entityId: ev._id,
              performedBy: null,
              after: { status: 'EXPIRED' },
            });
          }
          console.log(`Cron: expired ${toExpire.length} gift events`);
        }
      } catch (err) {
        console.error('Cron job error:', err);
      }
    };

    // run immediately once
    job();

    // schedule using node-cron
    const task = cron.schedule(cronExpr, job, { scheduled: true });
    console.log('Cron jobs scheduled with expression', cronExpr, 'reminderHours=', reminderHours);
    return task;
  },
};

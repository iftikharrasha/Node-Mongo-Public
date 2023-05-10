const Notification = require("../models/notification.model");

const getAllNotificationsService = async (uid) => {
    const notifications = await Notification.find({ receivedById: uid }).sort({createdAt: -1});
    return notifications;
}

const getLimitedNotificationsService = async (uid) => {
    const notifications = await Notification.find({ receivedById: uid }).sort({createdAt: -1}).limit(10);
    return notifications;
}

const getNotificationByIdService = async (id) => {
    const notification = await Notification.findOne({ _id: id });
    return notification;
}

const createNotificationService = async (data) => {
    const notification = await Notification.create(data);
    return notification;
}

const updateNotificationByIdService = async (id, data) => {
    const result = await Notification.findOneAndUpdate({ _id: id }, data, {
        new: true,
        runValidators: false
    });
    return result;
}

// const updateReadStatusService = async (id, data) => {
//     const result = await Notification.updateOne(
//         { _id: id },
//         { $set: { read: !data.read } }
//       );
//     return result;
// }

const deleteNotificationByIdService = async (id) => {
    const result = await Notification.findByIdAndDelete({ _id: id });
    return result;
};

module.exports = {
    getAllNotificationsService,
    getLimitedNotificationsService,
    getNotificationByIdService,
    updateNotificationByIdService,
    createNotificationService,
    deleteNotificationByIdService,
    // updateReadStatusService,
}
const Inbox = require("../models/inbox.model");

const getInboxMessagesByRoomId = async (roomId) => {
    const messages = await Inbox.find({ roomId: roomId });
    return messages;
}

const getDistinceSendersById = async (uid) => {
    const senders = await Inbox.distinct('senderId', { receiverId: uid });
    return senders;
}

const getLastestMessageForUniqueSenders = async (senderId, userId) => {
    const senders = await Inbox.findOne({ senderId, receiverId: userId }).sort({createdAt: -1}).limit(1);
    return senders;
}

const createInboxMessageService = async (data) => {
    const message = await Inbox.create(data);
    return message;
}

module.exports = {
    getInboxMessagesByRoomId,
    getDistinceSendersById,
    getLastestMessageForUniqueSenders,
    createInboxMessageService,
}
const Chatroom = require("../models/chatroom.model");

const getChatroomMessagesByRoomId = async (chatRoomId) => {
    console.log(chatRoomId)
    const messages = await Chatroom.find({ roomId: chatRoomId }).limit(25);
    return messages;
}

const createChatRoomMessageService = async (data) => {
    const message = await Chatroom.create(data);
    return message;
}

// const getDistinceSendersById = async (uid) => {
//     const senders = await Chatroom.distinct('senderId', { receiverId: uid });
//     return senders;
// }

// const getLastestMessageForUniqueSenders = async (senderId, userId) => {
//     const senders = await Chatroom.findOne({ senderId, receiverId: userId }).sort({createdAt: -1}).limit(1);
//     return senders;
// }

module.exports = {
    getChatroomMessagesByRoomId,
    createChatRoomMessageService,
    // getDistinceSendersById,
    // getLastestMessageForUniqueSenders,
}
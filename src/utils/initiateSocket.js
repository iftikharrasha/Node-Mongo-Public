const dotenv = require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const moment = require('moment');
const { getAllNotificationsService, createNotificationService, getNotificationByIdService, updateNotificationByIdService, deleteNotificationByIdService } = require('../services/notification.service');
const { getDistinceSendersById, getLastestMessageForUniqueSenders, getInboxMessagesByRoomId, createInboxMessageService } = require('../services/inbox.service');
const { getChatroomMessagesByRoomId, createChatRoomMessageService } = require('../services/chatroom.service');

async function initiateSocket(app, database, port) {
    try {
        const CHAT_BOT = 'ChatBot';
        const CHAT_BOT_IMAGE = 'https://img.freepik.com/free-vector/cute-cat-gaming-cartoon_138676-2969.jpg';
        
        let chatRoomId = "";
        let timeout = 120000;
        let allUsersByRoom = {};

        const chatRoom = database.collection("chatRoom");

        // Create an io server and allow for CORS from ORIGIN with GET and POST methods
        const server = http.createServer(app);
        server.setTimeout(timeout); //timeout set to 2 minutes to keep connected due to user inactivity

        const io = new Server(server, {
            cors: {
                origin: `${process.env.APP_CLIENT_ORIGIN}`,
                methods: ['GET', 'POST'],
            },
            allowEIO3: true
        });

        const chatNamespace = io.of("/chatRoom");
        const inboxChatNamespace = io.of('/inboxchat');
        const notificationNamespace = io.of("/notifications");

        notificationNamespace.on("connection", (socket) => {
            const { userId, userName } = socket.handshake.query;

            socket.on('join_notifications', async (data) => {
                console.log(`User connected to notyf socketID: ${socket.id}`);

                 // Data sent from client when join_room event emitted
                const { userId } = data;

                // Join the user to the notification socket using their unique ID
                socket.join(userId);

                //send all messages from DB
                const last10Notifications = await getAllNotificationsService(userId);
                if (last10Notifications) {
                    socket.emit("last_10_notifications", last10Notifications);
                }

                //now to get all the latest unique messages from one to one convo
                const uniqueSenders = await getDistinceSendersById(userId);
                
                 // Get the latest message for each senderId
                const latestInbox = await Promise.all(
                    uniqueSenders.map(async (senderId) => {
                        const latestMessage = await getLastestMessageForUniqueSenders(senderId, userId);
                        return latestMessage;
                    })
                );

                socket.emit('track_uniqueInbox', latestInbox);
            })

            socket.on("send_notification", async (data) => {
                const { type, receivedById } = data; 

                // Save notification to database
                const result = await createNotificationService(data);

                // Send the created notification to the specified user only
                notificationNamespace.to(receivedById).emit("receive_notification", result); 
            });

            socket.on("update_notification", async (id, data) => { 
                const notification = await getNotificationByIdService(id);

                if (notification) {
                    const modifiedData = {
                        ...notification.toObject(),
                        ...data,
                        read: !notification.read
                    };
                    // const readNotyf = await updateReadStatusService(id, notification);
                    const updatedNotification = await updateNotificationByIdService(id, modifiedData);
                }
            }); 

            socket.on("delete_notification", async (id) => { 
                const notification = await deleteNotificationByIdService(id);
            }); 

            socket.on("disconnect", () => {
                console.log("Disconnected from notification socket");
            });
        });

        inboxChatNamespace.on("connection", (socket) => {
            const { userId } = socket.handshake.query;
            console.log('New user connected to chat namespace');
          
            socket.on('join_inbox', async (data) => {
                const { roomId, userId } = data;
                console.log(`User joined room ${roomId}`);
                
                socket.join(roomId);

                //send all messages from DB
                const latestInboxMessages = await getInboxMessagesByRoomId(roomId);

                socket.emit("last_100_texts", latestInboxMessages);
            });
          
            socket.on('send_message', async (data) => {
                const { message, senderName, senderPhoto, roomId, senderId, senderPermissions, receiverId, read, messageCount } = data;

                // Broadcast the message to all users in the room
                inboxChatNamespace.in(roomId).emit("receive_message", { message, senderName, senderPhoto, roomId, sound: "msg" }); 

                // Save message to database
                const result = await createInboxMessageService(data);

                // Emit the same message to the notificationNamespace
                notificationNamespace.to(receiverId).emit("track_incoming", { 
                    message, 
                    senderName, 
                    senderPhoto, 
                    roomId, 
                    senderId, 
                    senderPermissions, 
                    receiverId, 
                    read,
                    messageCount,
                    sound: "msg"
                });
            });
            
            socket.on("typing", ({ roomId, userName }) => {
                console.log(`${userName} is typing on...`, roomId);
                socket.to(roomId).emit("userTyping", userName);
            });
          
            socket.on('disconnect', () => {
              console.log(`${userId} disconnected from inbox`);
            });
        });

        // Listen for when the client connects via socket.io-client
        chatNamespace.on('connection', (socket) => {
            console.log(`User connected to socketID: ${socket.id}`);

            // Add a user to a room
            socket.on('join_room', async (data) => {
                // Data sent from client when join_room event emitted
                const { userId, roomId, senderName, senderPhoto, stats } = data;
                chatRoomId = roomId;

                socket.join(chatRoomId); // Join the user to a socket room

                const now = Date.now(); // Current createdAt
                const date = moment(now);
                const createdAt = date.format('YYYY-MM-DDTHH:mm:ss.SSS');
                
                // Send message to all users currently in the room, apart from the user that just joined
                socket.broadcast.to(chatRoomId).emit('receive_message', {
                    message: `${senderName} has joined the room`,
                    senderName: CHAT_BOT,
                    senderPhoto: CHAT_BOT_IMAGE,
                    read: false,
                    createdAt,
                    sound: "bot"
                });

                // Send welcome msg to user that just joined chat only
                socket.emit('receive_message', {
                    message: `Welcome ${senderName}`,
                    senderName: CHAT_BOT,
                    senderPhoto: CHAT_BOT_IMAGE,
                    read: false,
                    createdAt,
                    sound: "bot"
                });

                //2
                if (!allUsersByRoom[chatRoomId]) {
                    allUsersByRoom[chatRoomId] = [];
                }

                //allusers are users of all rooms
                allUsersByRoom[chatRoomId].push({ id: userId, socketId: socket.id, roomId: chatRoomId, userName: senderName, photo: senderPhoto, createdAt: createdAt, stats: stats });

                //only send the users of this room, since a lot of users will be joining to other rooms as well
                socket.to(chatRoomId).emit("chatroom_users", allUsersByRoom[chatRoomId]);
                socket.emit("chatroom_users", allUsersByRoom[chatRoomId]);

                //send all messages from DB
                // const query = { roomId: chatRoomId };
                // const cursor = chatRoom.find(query);
                // const last100Messages = await cursor.limit(25).toArray();

                //send all messages from DB
                const last100Messages = await getChatroomMessagesByRoomId(chatRoomId);
                if (last100Messages) {
                    socket.emit("last_100_messages", last100Messages);
                }
                
                //count how many unread notifications
                // const query2 = { roomId: chatRoomId, read: false, senderId: { $ne: userId } };
                // const count = await chatRoom.countDocuments(query2);

                // if (count) {
                //     socket.emit("get_unread_counts", count);
                // }
            });

            socket.on("send_message", async (data) => {
                const { message, senderName, roomId, createdAt, senderPhoto, read, senderId } = data;

                // Send to all users in room, including sender
                chatNamespace.in(roomId).emit("receive_message", { message, senderName, senderPhoto, roomId, createdAt, read, sound: "msg" }); 

                // Save message to database
                // const result = await chatRoom.insertOne(data);
                const result = await createChatRoomMessageService(data);
            });

            socket.on('ping', () => {
                const createdAt = new Date().getTime();
                const formattedDate = moment(createdAt).format('HH:mm:ss');
                console.log(`Received ping from socket ${socket.id} at ${formattedDate}`);
                socket.emit('pong', createdAt, formattedDate, socket.id);

                // Reset the server timeout to 120000ms (2 minutes)
                server.setTimeout(timeout);
            });
            
            socket.on("typing", ({ roomId, userName }) => {
                // socket.to(roomId).emit("typing", { user: socket.id, roomId: roomId })
                console.log(`${userName} is typing...`);
                socket.to(roomId).emit("userTyping", userName);
            });

            socket.on("leave_room", (data) => {
                const { createdAt } = data;
                let removedUser;
                const updatedUsersByRoom = Object.fromEntries(
                    Object.entries(allUsersByRoom).map(([room, users]) => [
                      room,
                      users.filter(user => {
                        if(user.socketId === socket.id){
                            removedUser = user;
                            return false;
                        }else{
                            return true;
                        }
                      })
                    ])
                );

                // If the user is found
                if(removedUser?.userName) {
                    const userRoomId = removedUser.roomId;
                    allUsersByRoom = updatedUsersByRoom;  // array updated of list of remaining users
                    socket.to(userRoomId).emit("chatroom_users", updatedUsersByRoom[userRoomId]);

                    socket.broadcast.to(userRoomId).emit("receive_message", {
                        message: `${removedUser?.userName} has left the room.`,
                        senderName: CHAT_BOT,
                        senderPhoto: CHAT_BOT_IMAGE,
                        createdAt: createdAt,
                        read: false,
                        sound: "bot",
                    });
                }
                
                socket.leave(chatRoomId);
            });

            socket.on("disconnect", () => {
                let removedUser;
                const updatedUsersByRoom = Object.fromEntries(
                    Object.entries(allUsersByRoom).map(([room, users]) => [
                      room,
                      users.filter(user => {
                        if(user.socketId === socket.id){
                            removedUser = user;
                            return false;
                        }else{
                            return true;
                        }
                      })
                    ])
                  );

                if(removedUser?.userName) {
                    const userRoomId = removedUser.roomId;
                    allUsersByRoom = updatedUsersByRoom;  // array updated of list of remaining users
                    socket.to(userRoomId).emit("chatroom_users", updatedUsersByRoom[userRoomId]);

                    socket.broadcast.to(userRoomId).emit("receive_message", {
                        message: `${removedUser?.userName} has left the room.`,
                        senderName: CHAT_BOT,
                        senderPhoto: CHAT_BOT_IMAGE,
                        createdAt: Date.now(),
                        read: false,
                        sound: "bot",
                    });
                }
            });
        });

        server.listen(port, () => console.log('Server is loading at port@5000'));

    } finally {
    //   await client.close();
    }
}

module.exports = { 
    initiateSocket,
};

import { Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendToUser } from '../config/socket';
import {
  isDBConnected,
  messages as mockMessages,
  users as mockUsers,
  products as mockProducts
} from '../utils/mockData';

export const getChatsList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!isDBConnected()) {
      const messages = [...mockMessages]
        .filter(m => m.senderId === userId || m.receiverId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const chatPartnersMap = new Map<string, any>();

      for (const msg of messages) {
        const senderStr = msg.senderId.toString();
        const receiverStr = msg.receiverId.toString();
        const partnerId = senderStr === userId ? receiverStr : senderStr;

        if (!chatPartnersMap.has(partnerId)) {
          chatPartnersMap.set(partnerId, {
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
            productId: msg.productId,
            unreadCount: (!msg.read && receiverStr === userId) ? 1 : 0
          });
        } else {
          if (!msg.read && receiverStr === userId) {
            chatPartnersMap.get(partnerId).unreadCount += 1;
          }
        }
      }

      const chats = [];
      for (const [partnerId, data] of chatPartnersMap.entries()) {
        const partner = mockUsers.find(u => u._id === partnerId);
        if (partner) {
          chats.push({
            user: partner,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
            productId: data.productId,
            unreadCount: data.unreadCount
          });
        }
      }

      return res.json(chats);
    }

    // Find all messages involving the logged-in student
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    const chatPartnersMap = new Map<string, any>();

    for (const msg of messages) {
      const senderStr = msg.senderId.toString();
      const receiverStr = msg.receiverId.toString();
      const partnerId = senderStr === userId ? receiverStr : senderStr;

      if (!chatPartnersMap.has(partnerId)) {
        chatPartnersMap.set(partnerId, {
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          productId: msg.productId,
          unreadCount: (!msg.read && receiverStr === userId) ? 1 : 0
        });
      } else {
        if (!msg.read && receiverStr === userId) {
          chatPartnersMap.get(partnerId).unreadCount += 1;
        }
      }
    }

    const chats = [];
    for (const [partnerId, data] of chatPartnersMap.entries()) {
      const partner = await User.findById(partnerId).select('name email profileImage status role');
      if (partner) {
        chats.push({
          user: partner,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          productId: data.productId,
          unreadCount: data.unreadCount
        });
      }
    }

    res.json(chats);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving chat list.' });
  }
};

export const getMessagesWithUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const partnerId = req.params.userId;

    if (!isDBConnected()) {
      const messages = mockMessages
        .filter(m => 
          (m.senderId === userId && m.receiverId === partnerId) ||
          (m.senderId === partnerId && m.receiverId === userId)
        )
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      // Populate productId
      const populated = messages.map(msg => {
        const prod = mockProducts.find(p => p._id === msg.productId);
        return {
          ...msg,
          productId: prod
        };
      });

      // Mark unread incoming messages as read
      mockMessages.forEach(m => {
        if (m.senderId === partnerId && m.receiverId === userId && !m.read) {
          m.read = true;
        }
      });

      return res.json(populated);
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    }).populate('productId', 'title price images')
      .sort({ createdAt: 1 });

    // Mark unread incoming messages as read
    await Message.updateMany(
      { senderId: partnerId, receiverId: userId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving messages.' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, productId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message content are required.' });
    }

    if (!isDBConnected()) {
      const newMessage = {
        _id: 'mock_msg_' + (mockMessages.length + 1),
        senderId: senderId!,
        receiverId,
        productId: productId || undefined,
        message,
        read: false,
        createdAt: new Date()
      };

      mockMessages.push(newMessage);

      const senderInfo = mockUsers.find(u => u._id === senderId) || { name: 'Guest Student', profileImage: '' };
      
      // Dispatch real-time WebSocket alert
      sendToUser(receiverId, 'new_message', {
        message: newMessage,
        sender: senderInfo
      });

      return res.status(201).json(newMessage);
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      productId: productId || undefined,
      message,
      read: false
    });

    const senderInfo = await User.findById(senderId).select('name profileImage');
    
    // Dispatch real-time WebSocket alert
    sendToUser(receiverId, 'new_message', {
      message: newMessage,
      sender: senderInfo
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message.' });
  }
};

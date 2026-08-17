import { Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { isDBConnected, notifications as mockNotifications } from '../utils/mockData';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const list = mockNotifications
        .filter(n => n.userId === req.user?.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.json(list);
    }

    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving notifications.' });
  }
};

export const markRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;

    if (!isDBConnected()) {
      if (id) {
        const notif = mockNotifications.find(n => n._id === id && n.userId === req.user?.id);
        if (notif) notif.read = true;
      } else {
        mockNotifications
          .filter(n => n.userId === req.user?.id)
          .forEach(n => n.read = true);
      }
      return res.json({ success: true, message: 'Notifications marked as read.' });
    }

    if (id) {
      // Mark single notification as read
      await Notification.updateOne({ _id: id, userId: req.user?.id }, { $set: { read: true } });
    } else {
      // Mark all notifications as read
      await Notification.updateMany({ userId: req.user?.id, read: false }, { $set: { read: true } });
    }
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error marking notifications as read.' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const idx = mockNotifications.findIndex(n => n._id === req.params.id && n.userId === req.user?.id);
      if (idx !== -1) {
        mockNotifications.splice(idx, 1);
      }
      return res.json({ success: true, message: 'Notification deleted.' });
    }

    await Notification.deleteOne({ _id: req.params.id, userId: req.user?.id });
    res.json({ success: true, message: 'Notification deleted.' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting notification.' });
  }
};

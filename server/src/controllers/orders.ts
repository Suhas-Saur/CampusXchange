import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { sendToUser } from '../config/socket';
import {
  isDBConnected,
  orders as mockOrders,
  products as mockProducts,
  users as mockUsers,
  notifications as mockNotifications
} from '../utils/mockData';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { role, productId } = req.query; // 'buyer' or 'seller'

    if (!isDBConnected()) {
      let filtered = [...mockOrders];
      
      if (role === 'buyer') {
        filtered = filtered.filter(o => o.buyerId === userId);
      } else if (role === 'seller') {
        filtered = filtered.filter(o => o.sellerId === userId);
      } else {
        filtered = filtered.filter(o => o.buyerId === userId || o.sellerId === userId);
      }

      if (productId) {
        filtered = filtered.filter(o => o.productId === productId);
      }

      const populated = filtered.map(order => {
        const prod = mockProducts.find(p => p._id === order.productId) || { title: 'Deleted Product', price: order.amount };
        const buyer = mockUsers.find(u => u._id === order.buyerId) || { name: 'Guest Student', email: 'guest@student.edu' };
        const seller = mockUsers.find(u => u._id === order.sellerId) || { name: 'Guest Student', email: 'guest@student.edu' };
        
        return {
          ...order,
          productId: prod,
          buyerId: buyer,
          sellerId: seller
        };
      });

      return res.json(populated);
    }

    const query: any = {};
    if (role === 'buyer') {
      query.buyerId = userId;
    } else if (role === 'seller') {
      query.sellerId = userId;
    } else {
      query.$or = [{ buyerId: userId }, { sellerId: userId }];
    }

    if (productId) {
      query.productId = productId;
    }

    const orders = await Order.find(query)
      .populate('productId')
      .populate('buyerId', 'name email phone department year profileImage')
      .populate('sellerId', 'name email phone department year profileImage')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving orders.' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!isDBConnected()) {
      const order = mockOrders.find(o => o._id === req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      if (order.buyerId !== userId && order.sellerId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order.' });
      }

      const prod = mockProducts.find(p => p._id === order.productId) || { title: 'Deleted Product', price: order.amount };
      const buyer = mockUsers.find(u => u._id === order.buyerId) || { name: 'Guest Student', email: 'guest@student.edu' };
      const seller = mockUsers.find(u => u._id === order.sellerId) || { name: 'Guest Student', email: 'guest@student.edu' };

      return res.json({
        ...order,
        productId: prod,
        buyerId: buyer,
        sellerId: seller
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('productId')
      .populate('buyerId', 'name email phone department year profileImage')
      .populate('sellerId', 'name email phone department year profileImage');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (
      order.buyerId._id.toString() !== userId &&
      order.sellerId._id.toString() !== userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order.' });
    }

    res.json(order);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order details.' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderStatus } = req.body;

    if (!isDBConnected()) {
      const idx = mockOrders.findIndex(o => o._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const order = mockOrders[idx];
      if (order.sellerId !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Only the seller can update order status.' });
      }

      order.orderStatus = orderStatus;
      mockOrders[idx] = order;

      const buyerNotification = {
        _id: 'mock_notif_' + (mockNotifications.length + 1),
        userId: order.buyerId,
        type: 'order',
        title: `Order Status: ${orderStatus.toUpperCase().replace(/_/g, ' ')}`,
        message: `Seller updated your order status for Product to: ${orderStatus.replace(/_/g, ' ')}.`,
        read: false,
        createdAt: new Date()
      };
      mockNotifications.push(buyerNotification);

      sendToUser(order.buyerId.toString(), 'notification', buyerNotification);
      sendToUser(order.buyerId.toString(), 'order_updated', { orderId: order._id, status: orderStatus });

      return res.json({
        success: true,
        message: 'Order status updated successfully.',
        order
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.sellerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only the seller can update order status.' });
    }

    const validStatuses = ['pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    const buyerNotification = await Notification.create({
      userId: order.buyerId,
      type: 'order',
      title: `Order Status: ${orderStatus.toUpperCase().replace(/_/g, ' ')}`,
      message: `Seller updated your order status for Product to: ${orderStatus.replace(/_/g, ' ')}.`
    });

    sendToUser(order.buyerId.toString(), 'notification', buyerNotification);
    sendToUser(order.buyerId.toString(), 'order_updated', { orderId: order._id, status: orderStatus });

    res.json({
      success: true,
      message: 'Order status updated successfully.',
      order
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating order status.' });
  }
};

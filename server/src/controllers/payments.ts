import { Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Payment } from '../models/Payment';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { sendToUser } from '../config/socket';
import {
  isDBConnected,
  products as mockProducts,
  orders as mockOrders,
  payments as mockPayments,
  notifications as mockNotifications,
  users as mockUsers
} from '../utils/mockData';

// Initialize Razorpay conditionally (falls back to mock mode if default test credentials are used)
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_abc123xyz';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'def456uvw';
  
  if (keyId === 'rzp_test_abc123xyz') {
    return null; // Mock mode
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, pickupLocation } = req.body;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    if (!isDBConnected()) {
      const product = mockProducts.find(p => p._id === productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      if (product.status !== 'available') {
        return res.status(400).json({ message: 'Product is no longer available.' });
      }

      if (product.sellerId._id === req.user?.id || product.sellerId === req.user?.id) {
        return res.status(400).json({ message: 'You cannot buy your own product.' });
      }

      const amount = product.price;
      const razorpayOrderId = `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`;

      const order = {
        _id: 'mock_order_' + (mockOrders.length + 1),
        buyerId: req.user?.id,
        sellerId: product.sellerId._id || product.sellerId,
        productId: product._id,
        quantity: 1,
        amount,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        razorpayOrderId,
        pickupLocation: pickupLocation || 'Main Campus Canteen',
        createdAt: new Date()
      };

      mockOrders.push(order);

      return res.status(201).json({
        success: true,
        orderId: order._id,
        razorpayOrderId,
        amount,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_abc123xyz',
        mockMode: true,
        product: {
          title: product.title,
          price: product.price
        }
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ message: 'Product is no longer available.' });
    }

    if (product.sellerId.toString() === req.user?.id) {
      return res.status(400).json({ message: 'You cannot buy your own product.' });
    }

    const amount = product.price; // in INR
    const rzp = getRazorpayInstance();
    let razorpayOrderId = '';

    if (rzp) {
      // Real Razorpay Order Creation
      const options = {
        amount: Math.round(amount * 100), // Razorpay accepts in paise
        currency: 'INR',
        receipt: `receipt_order_${Date.now()}`
      };
      
      const rzpOrder = await rzp.orders.create(options);
      razorpayOrderId = rzpOrder.id;
    } else {
      // Mock mode Order ID
      razorpayOrderId = `order_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`;
    }

    // Create order entry in database
    const order = await Order.create({
      buyerId: req.user?.id,
      sellerId: product.sellerId,
      productId: product._id,
      quantity: 1,
      amount,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      razorpayOrderId,
      pickupLocation: pickupLocation || 'Main Campus Canteen'
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId,
      amount,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_abc123xyz',
      mockMode: !rzp,
      product: {
        title: product.title,
        price: product.price
      }
    });
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Error initiating order payment.' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({ message: 'Payment details are missing.' });
    }

    if (!isDBConnected()) {
      const orderIdx = mockOrders.findIndex(o => o.razorpayOrderId === razorpayOrderId);
      if (orderIdx === -1) {
        return res.status(404).json({ message: 'Order not found in database.' });
      }

      const order = mockOrders[orderIdx];
      order.paymentStatus = 'paid';
      order.orderStatus = 'processing';
      order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
      mockOrders[orderIdx] = order;

      const productIdx = mockProducts.findIndex(p => p._id === order.productId);
      if (productIdx !== -1) {
        mockProducts[productIdx].status = 'sold';
      }

      const payment = {
        _id: 'mock_payment_' + (mockPayments.length + 1),
        orderId: order._id,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId,
        amount: order.amount,
        status: 'success',
        createdAt: new Date()
      };
      mockPayments.push(payment);

      const buyerNotification = {
        _id: 'mock_notif_' + (mockNotifications.length + 1),
        userId: order.buyerId,
        type: 'payment',
        title: 'Payment Successful',
        message: `Your payment of ₹${order.amount} for Order #${order._id} was processed successfully.`,
        read: false,
        createdAt: new Date()
      };
      mockNotifications.push(buyerNotification);

      const sellerNotification = {
        _id: 'mock_notif_' + (mockNotifications.length + 2),
        userId: order.sellerId,
        type: 'order',
        title: 'New Paid Order',
        message: `Your listing has been purchased! Go to your Seller Dashboard to coordinate pickup at ${order.pickupLocation}.`,
        read: false,
        createdAt: new Date()
      };
      mockNotifications.push(sellerNotification);

      sendToUser(order.buyerId.toString(), 'notification', buyerNotification);
      sendToUser(order.sellerId.toString(), 'notification', sellerNotification);
      sendToUser(order.sellerId.toString(), 'order_received', { orderId: order._id });

      return res.json({
        success: true,
        message: 'Payment verified and order confirmed.',
        order
      });
    }

    const order = await Order.findOne({ razorpayOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found in database.' });
    }

    const rzp = getRazorpayInstance();
    let isVerified = false;

    if (rzp && razorpayPaymentId && razorpaySignature) {
      // Real Razorpay verification
      const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
      const generatedSignature = hmac.digest('hex');
      isVerified = generatedSignature === razorpaySignature;
    } else {
      // Mock mode verification (always succeeds for development testing)
      isVerified = true;
    }

    if (!isVerified) {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    // Success transaction actions
    order.paymentStatus = 'paid';
    order.orderStatus = 'processing';
    order.razorpayPaymentId = razorpayPaymentId || `pay_mock_${Date.now()}`;
    await order.save();

    // Mark product as sold
    await Product.findByIdAndUpdate(order.productId, { status: 'sold' });

    // Store Payment record
    await Payment.create({
      orderId: order._id,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      amount: order.amount,
      status: 'success'
    });

    // Create notifications for both buyer and seller
    const buyerNotification = await Notification.create({
      userId: order.buyerId,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of ₹${order.amount} for Order #${order._id} was processed successfully.`
    });

    const sellerNotification = await Notification.create({
      userId: order.sellerId,
      type: 'order',
      title: 'New Paid Order',
      message: `Your listing has been purchased! Go to your Seller Dashboard to coordinate pickup at ${order.pickupLocation}.`
    });

    // Real-time socket alerts
    sendToUser(order.buyerId.toString(), 'notification', buyerNotification);
    sendToUser(order.sellerId.toString(), 'notification', sellerNotification);
    sendToUser(order.sellerId.toString(), 'order_received', { orderId: order._id });

    res.json({
      success: true,
      message: 'Payment verified and order confirmed.',
      order
    });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Error validating payment status.' });
  }
};

// Webhook listener for capturing transactions asynchronously
export const razorpayWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhooksecret123';
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(JSON.stringify(req.body));
    const generatedSignature = hmac.digest('hex');
    
    if (generatedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const amount = paymentEntity.amount / 100;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.orderStatus = 'processing';
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        await Product.findByIdAndUpdate(order.productId, { status: 'sold' });

        await Payment.create({
          orderId: order._id,
          razorpayOrderId,
          razorpayPaymentId,
          amount,
          status: 'success'
        });

        // Notifications
        const buyerNotification = await Notification.create({
          userId: order.buyerId,
          type: 'payment',
          title: 'Payment Successful (Webhook)',
          message: `Your payment of ₹${amount} was received.`
        });
        const sellerNotification = await Notification.create({
          userId: order.sellerId,
          type: 'order',
          title: 'New Paid Order',
          message: `Product purchased! Check dashboard.`
        });

        sendToUser(order.buyerId.toString(), 'notification', buyerNotification);
        sendToUser(order.sellerId.toString(), 'notification', sellerNotification);
      }
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    res.status(500).json({ message: 'Webhook processing error.' });
  }
};

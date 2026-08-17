import { Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { LostItem } from '../models/LostItem';
import { FoundItem } from '../models/FoundItem';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Report } from '../models/Report';
import { AuthRequest } from '../middleware/auth';
import {
  isDBConnected,
  users as mockUsers,
  products as mockProducts,
  lostItems as mockLostItems,
  foundItems as mockFoundItems,
  orders as mockOrders,
  payments as mockPayments
} from '../utils/mockData';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const totalStudents = mockUsers.filter(u => u.role === 'student').length;
      const activeListings = mockProducts.filter(p => p.status === 'available').length;
      const lostReports = mockLostItems.filter(i => i.status === 'lost').length;
      const foundReports = mockFoundItems.filter(i => i.status === 'found').length;
      const recoveredItems = mockLostItems.filter(i => i.status === 'resolved').length + mockFoundItems.filter(i => i.status === 'resolved').length;
      const totalOrders = mockOrders.length;
      const completedOrders = mockOrders.filter(o => o.orderStatus === 'completed' || o.orderStatus === 'processing').length;
      
      const successfulPayments = mockPayments.filter(p => p.status === 'success').length;
      const pendingPayments = mockPayments.filter(p => p.status === 'pending').length;
      const revenue = mockPayments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

      return res.json({
        totalStudents,
        activeListings,
        lostReports,
        foundReports,
        recoveredItems,
        totalOrders,
        completedOrders,
        successfulPayments,
        pendingPayments,
        revenue
      });
    }

    const totalStudents = await User.countDocuments({ role: 'student' });
    const activeListings = await Product.countDocuments({ status: 'available' });
    const lostReports = await LostItem.countDocuments({ status: 'lost' });
    const foundReports = await FoundItem.countDocuments({ status: 'found' });
    const recoveredItems = await LostItem.countDocuments({ status: 'resolved' }) + await FoundItem.countDocuments({ status: 'resolved' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ orderStatus: { $in: ['completed', 'processing'] } });
    
    // Payments statistics
    const payments = await Payment.find();
    const successfulPayments = payments.filter(p => p.status === 'success').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const revenue = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);

    res.json({
      totalStudents,
      activeListings,
      lostReports,
      foundReports,
      recoveredItems,
      totalOrders,
      completedOrders,
      successfulPayments,
      pendingPayments,
      revenue
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving platform statistics.' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { search, department, role } = req.query;

    if (!isDBConnected()) {
      let filtered = [...mockUsers];
      if (department && department !== 'All') {
        filtered = filtered.filter(u => u.department === department);
      }
      if (role) {
        filtered = filtered.filter(u => u.role === role);
      }
      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(u => 
          u.name.toLowerCase().includes(s) || 
          u.email.toLowerCase().includes(s) || 
          (u.studentId && u.studentId.toLowerCase().includes(s))
        );
      }
      return res.json(filtered);
    }

    const query: any = {};

    if (department && department !== 'All') {
      query.department = department;
    }
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving users list.' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid user status.' });
    }

    if (!isDBConnected()) {
      const idx = mockUsers.findIndex(u => u._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'User not found.' });
      }
      if (mockUsers[idx].role === 'admin') {
        return res.status(400).json({ message: 'Cannot modify admin status.' });
      }
      mockUsers[idx].status = status;
      return res.json({
        success: true,
        message: `User status changed to ${status}.`,
        user: mockUsers[idx]
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot modify admin status.' });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User status changed to ${status}.`,
      user
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user status.' });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email profileImage')
      .sort({ createdAt: -1 });

    // Populate the targets dynamically based on targetType
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        let target: any = null;
        try {
          if (report.targetType === 'user') {
            target = await User.findById(report.targetId).select('name email status');
          } else if (report.targetType === 'product') {
            target = await Product.findById(report.targetId).select('title price status');
          } else if (report.targetType === 'lost_item') {
            target = await LostItem.findById(report.targetId).select('title status');
          } else if (report.targetType === 'found_item') {
            target = await FoundItem.findById(report.targetId).select('title status');
          }
        } catch (err) {
          console.error(`Error populating target for report ${report._id}:`, err);
        }
        return {
          ...report.toObject(),
          target
        };
      })
    );

    res.json(populatedReports);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving reports list.' });
  }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid report status.' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    report.status = status;
    await report.save();

    res.json({
      success: true,
      message: `Report status updated to ${status}.`,
      report
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating report status.' });
  }
};

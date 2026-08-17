import { Response } from 'express';
import { Report } from '../models/Report';
import { AuthRequest } from '../middleware/auth';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'All report fields are required.' });
    }

    const report = await Report.create({
      reporterId: req.user?.id,
      targetType,
      targetId,
      reason,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Administrators will review it shortly.',
      report
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting report.' });
  }
};

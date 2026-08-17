import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { isDBConnected, users as mockUsers } from '../utils/mockData';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'admin';
    name: string;
    email: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'campusconnect_secure_jwt_token_secret_2026');
      
      let user: any;

      if (!isDBConnected()) {
        user = mockUsers.find((u: any) => u._id === decoded.id);
        
        // Self-healing session restoration if server restarted
        if (!user && decoded.id) {
          const isAdmin = String(decoded.id).includes('admin');
          user = {
            _id: decoded.id,
            name: isAdmin ? 'Admin User' : 'Suhas Reddy',
            email: isAdmin ? 'admin@lnmiit.ac.in' : 'student@lnmiit.ac.in',
            role: isAdmin ? 'admin' : 'student',
            status: 'active',
            profileImage: isAdmin 
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format'
              : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&auto=format'
          };
          mockUsers.push(user);
        }
      } else {
        user = await User.findById(decoded.id).select('-passwordHash');
      }

      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by administration.' });
      }
      
      req.user = {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email
      };
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

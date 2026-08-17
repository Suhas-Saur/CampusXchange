import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { isDBConnected, users as mockUsers } from '../utils/mockData';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'campusconnect_secure_jwt_token_secret_2026', {
    expiresIn: '30d'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, studentId, department, year, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter name, email, and password.' });
    }

    if (!isDBConnected()) {
      const userExists = mockUsers.find(u => u.email === email || (studentId && u.studentId === studentId));
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email or Student ID.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const role = (email === 'admin@campusconnect.demo' || email.startsWith('admin.')) ? 'admin' : 'student';

      const newUser = {
        _id: 'mock_user_' + (mockUsers.length + 1),
        name,
        email,
        studentId: studentId || '',
        department: department || 'General',
        year: year ? Number(year) : 1,
        phone: phone || '',
        passwordHash,
        role,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        status: 'active',
        createdAt: new Date()
      };

      mockUsers.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        studentId: newUser.studentId,
        department: newUser.department,
        year: newUser.year,
        phone: newUser.phone,
        role: newUser.role,
        profileImage: newUser.profileImage,
        token: generateToken(newUser._id)
      });
    }

    // Check if user already exists
    const query: any = { email };
    if (studentId) {
      query.$or = [{ email }, { studentId }];
    }
    
    const userExists = await User.findOne(query);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or Student ID.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Set Admin role for demo or special pattern
    const role = (email === 'admin@campusconnect.demo' || email.startsWith('admin.')) ? 'admin' : 'student';

    const user = await User.create({
      name,
      email,
      studentId,
      department,
      year,
      phone,
      passwordHash,
      role,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id.toString())
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    if (!isDBConnected()) {
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id)
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      department: user.department,
      year: user.year,
      phone: user.phone,
      role: user.role,
      profileImage: user.profileImage,
      token: generateToken(user._id.toString())
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!isDBConnected()) {
      const user = mockUsers.find(u => u._id === req.user?.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { passwordHash, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!isDBConnected()) {
      const userIdx = mockUsers.findIndex(u => u._id === req.user?.id);
      if (userIdx === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = mockUsers[userIdx];
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.department = req.body.department || user.department;
      user.year = req.body.year || user.year;
      user.profileImage = req.body.profileImage || user.profileImage;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
      }

      mockUsers[userIdx] = user;

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        year: user.year,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        token: generateToken(user._id.toString())
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;
    user.year = req.body.year || user.year;
    user.profileImage = req.body.profileImage || user.profileImage;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      studentId: updatedUser.studentId,
      department: updatedUser.department,
      year: updatedUser.year,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id.toString())
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

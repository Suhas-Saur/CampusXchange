import { Response } from 'express';
import { LostItem } from '../models/LostItem';
import { FoundItem } from '../models/FoundItem';
import { AuthRequest } from '../middleware/auth';
import {
  isDBConnected,
  lostItems as mockLostItems,
  foundItems as mockFoundItems,
  users as mockUsers
} from '../utils/mockData';

// --- LOST ITEMS ---
export const getLostItems = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, status, userId } = req.query;

    if (!isDBConnected()) {
      let filtered = [...mockLostItems];
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      } else if (!userId) {
        filtered = filtered.filter(item => item.status === 'lost');
      }

      if (userId) {
        filtered = filtered.filter(item => item.userId._id === userId || item.userId === userId);
      }

      if (category && category !== 'All') {
        filtered = filtered.filter(item => item.category === category);
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(s) ||
          item.description.toLowerCase().includes(s) ||
          item.location.toLowerCase().includes(s)
        );
      }

      return res.json(filtered);
    }

    const query: any = {};

    if (status) {
      query.status = status;
    } else if (!userId) {
      query.status = 'lost';
    }

    if (userId) {
      query.userId = userId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await LostItem.find(query)
      .populate('userId', 'name email phone department year profileImage')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving lost items' });
  }
};

export const getLostItemById = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const item = mockLostItems.find(i => i._id === req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Lost item not found' });
      }
      return res.json(item);
    }

    const item = await LostItem.findById(req.params.id)
      .populate('userId', 'name email phone department year profileImage');
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }
    res.json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving lost item details' });
  }
};

export const createLostItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, location, dateLost } = req.body;

    if (!title || !description || !category || !location || !dateLost) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    if (!isDBConnected()) {
      const user = mockUsers.find(u => u._id === req.user?.id) || { _id: req.user?.id, name: 'Guest Student' };

      const newLost = {
        _id: 'mock_lost_' + (mockLostItems.length + 1),
        userId: user,
        title,
        description,
        category,
        location,
        dateLost: new Date(dateLost),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop'],
        status: 'lost',
        createdAt: new Date()
      };

      mockLostItems.push(newLost);
      return res.status(201).json(newLost);
    }

    const item = await LostItem.create({
      userId: req.user?.id,
      title,
      description,
      category,
      location,
      dateLost: new Date(dateLost),
      images,
      status: 'lost'
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error creating lost item report' });
  }
};

export const updateLostItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const idx = mockLostItems.findIndex(i => i._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Lost item not found' });
      }

      const item = mockLostItems[idx];
      if (item.userId._id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { title, description, category, location, dateLost, status } = req.body;
      item.title = title || item.title;
      item.description = description || item.description;
      item.category = category || item.category;
      item.location = location || item.location;
      if (dateLost) item.dateLost = new Date(dateLost);
      item.status = status || item.status;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const newImages = req.files.map((file: any) => `/uploads/${file.filename}`);
        item.images = [...item.images, ...newImages];
      }

      mockLostItems[idx] = item;
      return res.json(item);
    }

    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    if (item.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, location, dateLost, status } = req.body;

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.location = location || item.location;
    if (dateLost) item.dateLost = new Date(dateLost);
    item.status = status || item.status;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files.map((file: any) => `/uploads/${file.filename}`);
      item.images = [...item.images, ...newImages];
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating lost item' });
  }
};

export const deleteLostItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const idx = mockLostItems.findIndex(i => i._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Lost item not found' });
      }

      const item = mockLostItems[idx];
      if (item.userId._id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      mockLostItems.splice(idx, 1);
      return res.json({ message: 'Lost report deleted successfully' });
    }

    const item = await LostItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Lost item not found' });
    }

    if (item.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lost report deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting lost report' });
  }
};

// --- FOUND ITEMS ---
export const getFoundItems = async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, status, userId } = req.query;

    if (!isDBConnected()) {
      let filtered = [...mockFoundItems];
      if (status) {
        filtered = filtered.filter(item => item.status === status);
      } else if (!userId) {
        filtered = filtered.filter(item => item.status === 'found');
      }

      if (userId) {
        filtered = filtered.filter(item => item.userId._id === userId || item.userId === userId);
      }

      if (category && category !== 'All') {
        filtered = filtered.filter(item => item.category === category);
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(item =>
          item.title.toLowerCase().includes(s) ||
          item.description.toLowerCase().includes(s) ||
          item.location.toLowerCase().includes(s)
        );
      }

      return res.json(filtered);
    }

    const query: any = {};

    if (status) {
      query.status = status;
    } else if (!userId) {
      query.status = 'found';
    }

    if (userId) {
      query.userId = userId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await FoundItem.find(query)
      .populate('userId', 'name email phone department year profileImage')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving found items' });
  }
};

export const getFoundItemById = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const item = mockFoundItems.find(i => i._id === req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Found item not found' });
      }
      return res.json(item);
    }

    const item = await FoundItem.findById(req.params.id)
      .populate('userId', 'name email phone department year profileImage');
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }
    res.json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving found item details' });
  }
};

export const createFoundItem = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, location, dateFound } = req.body;

    if (!title || !description || !category || !location || !dateFound) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    if (!isDBConnected()) {
      const user = mockUsers.find(u => u._id === req.user?.id) || { _id: req.user?.id, name: 'Guest Student' };

      const newFound = {
        _id: 'mock_found_' + (mockFoundItems.length + 1),
        userId: user,
        title,
        description,
        category,
        location,
        dateFound: new Date(dateFound),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'],
        status: 'found',
        createdAt: new Date()
      };

      mockFoundItems.push(newFound);
      return res.status(201).json(newFound);
    }

    const item = await FoundItem.create({
      userId: req.user?.id,
      title,
      description,
      category,
      location,
      dateFound: new Date(dateFound),
      images,
      status: 'found'
    });

    res.status(201).json(item);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error creating found item report' });
  }
};

export const updateFoundItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const idx = mockFoundItems.findIndex(i => i._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Found item not found' });
      }

      const item = mockFoundItems[idx];
      if (item.userId._id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const { title, description, category, location, dateFound, status } = req.body;
      item.title = title || item.title;
      item.description = description || item.description;
      item.category = category || item.category;
      item.location = location || item.location;
      if (dateFound) item.dateFound = new Date(dateFound);
      item.status = status || item.status;

      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const newImages = req.files.map((file: any) => `/uploads/${file.filename}`);
        item.images = [...item.images, ...newImages];
      }

      mockFoundItems[idx] = item;
      return res.json(item);
    }

    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    if (item.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, category, location, dateFound, status } = req.body;

    item.title = title || item.title;
    item.description = description || item.description;
    item.category = category || item.category;
    item.location = location || item.location;
    if (dateFound) item.dateFound = new Date(dateFound);
    item.status = status || item.status;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files.map((file: any) => `/uploads/${file.filename}`);
      item.images = [...item.images, ...newImages];
    }

    const updatedItem = await item.save();
    res.json(updatedItem);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating found item' });
  }
};

export const deleteFoundItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const idx = mockFoundItems.findIndex(i => i._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Found item not found' });
      }

      const item = mockFoundItems[idx];
      if (item.userId._id !== req.user?.id && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      mockFoundItems.splice(idx, 1);
      return res.json({ message: 'Found report deleted successfully' });
    }

    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Found item not found' });
    }

    if (item.userId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Found report deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting found report' });
  }
};

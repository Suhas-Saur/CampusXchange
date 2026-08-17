import { Response } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { isDBConnected, products as mockProducts, users as mockUsers } from '../utils/mockData';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { category, condition, search, sort, status, sellerId } = req.query;

    if (!isDBConnected()) {
      let filtered = [...mockProducts];
      
      if (status) {
        filtered = filtered.filter(p => p.status === status);
      } else if (sellerId) {
        filtered = filtered.filter(p => p.sellerId._id === sellerId || p.sellerId === sellerId);
      } else {
        filtered = filtered.filter(p => p.status === 'available');
      }

      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
      }

      if (condition) {
        filtered = filtered.filter(p => p.condition === condition);
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(s) || 
          p.description.toLowerCase().includes(s) || 
          p.location.toLowerCase().includes(s)
        );
      }

      if (sort === 'price_low_high') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price_high_low') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return res.json(filtered);
    }

    const query: any = {};

    // By default, only show available products, unless specified or asking for a specific seller
    if (status) {
      query.status = status;
    } else if (sellerId) {
      // If filtering by seller, show all their items (active, sold, paused)
      query.sellerId = sellerId;
    } else {
      query.status = 'available';
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions: any = { createdAt: -1 }; // default newest

    if (sort === 'price_low_high') {
      sortOptions = { price: 1 };
    } else if (sort === 'price_high_low') {
      sortOptions = { price: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const products = await Product.find(query)
      .populate('sellerId', 'name email phone department year profileImage')
      .sort(sortOptions);

    res.json(products);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDBConnected()) {
      const product = mockProducts.find(p => p._id === req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    }

    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name email phone department year profileImage');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving product details' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, price, condition, location } = req.body;

    if (!title || !description || !category || !price || !condition || !location) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    // Process files if uploaded
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    if (!isDBConnected()) {
      const seller = mockUsers.find(u => u._id === req.user?.id) || { _id: req.user?.id, name: 'Guest Student' };

      const newProduct = {
        _id: 'mock_prod_' + (mockProducts.length + 1),
        sellerId: seller,
        title,
        description,
        category,
        price: Number(price),
        condition,
        location,
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop'],
        status: 'available',
        createdAt: new Date()
      };

      mockProducts.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const product = await Product.create({
      sellerId: req.user?.id,
      title,
      description,
      category,
      price: Number(price),
      condition,
      location,
      images,
      status: 'available'
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product listing' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership
    if (product.sellerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to modify this product' });
    }

    const { title, description, category, price, condition, location, status } = req.body;

    product.title = title || product.title;
    product.description = description || product.description;
    product.category = category || product.category;
    product.price = price !== undefined ? Number(price) : product.price;
    product.condition = condition || product.condition;
    product.location = location || product.location;
    product.status = status || product.status;

    // Support adding new uploaded images if provided
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImages = req.files.map((file: any) => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check ownership or admin status
    if (product.sellerId.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

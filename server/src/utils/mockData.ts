import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

// Simple boolean checker to detect if database connection is fully active
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// In-memory arrays simulating MongoDB collections
export const users: any[] = [];
export const products: any[] = [];
export const lostItems: any[] = [];
export const foundItems: any[] = [];
export const orders: any[] = [];
export const messages: any[] = [];
export const notifications: any[] = [];
export const reports: any[] = [];
export const payments: any[] = [];

// Seed the in-memory arrays when the server boots
export const seedInMemoryStore = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Clear existing arrays
    users.length = 0;
    products.length = 0;
    lostItems.length = 0;
    foundItems.length = 0;
    orders.length = 0;
    messages.length = 0;
    notifications.length = 0;
    reports.length = 0;
    payments.length = 0;

    // 12 Students (10 students, 2 admins)
    users.push(
      {
        _id: 'mock_user_1',
        name: 'Suhas Reddy',
        email: 'student@lnmiit.ac.in',
        studentId: '2023CSE089',
        department: 'Computer Science',
        year: 3,
        phone: '9876543210',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_2',
        name: 'Amit Sharma',
        email: 'amit.sharma@lnmiit.ac.in',
        studentId: '2022ECE012',
        department: 'Electronics & Comm',
        year: 4,
        phone: '9123456780',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_3',
        name: 'Priya Patel',
        email: 'priya.patel@lnmiit.ac.in',
        studentId: '2024CCE045',
        department: 'Computer & Comm',
        year: 2,
        phone: '9234567890',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_4',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@lnmiit.ac.in',
        studentId: '2023ME023',
        department: 'Mechanical Eng',
        year: 3,
        phone: '9345678901',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_5',
        name: 'Ananya Iyer',
        email: 'ananya.iyer@lnmiit.ac.in',
        studentId: '2025CSE010',
        department: 'Computer Science',
        year: 1,
        phone: '9456789012',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_6',
        name: 'Vikram Singh',
        email: 'vikram.singh@lnmiit.ac.in',
        studentId: '2022CSE102',
        department: 'Computer Science',
        year: 4,
        phone: '9567890123',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_7',
        name: 'Sneha Rao',
        email: 'sneha.rao@lnmiit.ac.in',
        studentId: '2024ECE067',
        department: 'Electronics & Comm',
        year: 2,
        phone: '9678901234',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_8',
        name: 'Rahul Verma',
        email: 'rahul.verma@lnmiit.ac.in',
        studentId: '2023CCE056',
        department: 'Computer & Comm',
        year: 3,
        phone: '9789012345',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_9',
        name: 'Diya Sen',
        email: 'diya.sen@lnmiit.ac.in',
        studentId: '2025ME005',
        department: 'Mechanical Eng',
        year: 1,
        phone: '9890123456',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_10',
        name: 'Karan Malhotra',
        email: 'karan.m@lnmiit.ac.in',
        studentId: '2024CSE121',
        department: 'Computer Science',
        year: 2,
        phone: '9901234567',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_admin',
        name: 'Admin User',
        email: 'admin@lnmiit.ac.in',
        studentId: 'ADM001',
        department: 'Administration',
        year: 4,
        phone: '9999999999',
        passwordHash,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      },
      {
        _id: 'mock_user_admin_demo',
        name: 'Demo Admin Guest',
        email: 'admin@campusconnect.demo',
        studentId: 'ADM002',
        department: 'Administration',
        year: 4,
        phone: '8888888888',
        passwordHash,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format',
        status: 'active',
        createdAt: new Date()
      }
    );

    // Prepopulate 12 Products
    products.push(
      {
        _id: 'mock_prod_1',
        sellerId: users[0],
        title: 'Engineering Mathematics Book (H.K. Dass)',
        description: 'Semester 1 and 2 engineering mathematics textbooks. Clean pages, no highlights.',
        category: 'Books',
        price: 250,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop'],
        location: 'Hostel Block A, Room 102',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_2',
        sellerId: users[1],
        title: 'Casio fx-991EX Scientific Calculator',
        description: 'High-performance scientific calculator ideal for integrations. Works perfectly.',
        category: 'Calculators',
        price: 950,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&auto=format&fit=crop'],
        location: 'Library Reference Section',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_3',
        sellerId: users[2],
        title: 'Data Structures and Algorithms Notes',
        description: 'Handwritten notes with detailed visual diagrams. Placements preparation.',
        category: 'Notes',
        price: 150,
        condition: 'new',
        images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop'],
        location: 'Girls Hostel B, Block 3',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_4',
        sellerId: users[3],
        title: 'Engineering Drawing Kit (Complete Set)',
        description: 'ED board, drafting sheets, clips and compass set.',
        category: 'College Supplies',
        price: 500,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop'],
        location: 'Hostel Block C, Room 304',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_5',
        sellerId: users[4],
        title: 'Adjustable Aluminum Laptop Stand',
        description: 'Ergonomic metal stand for 13-17 inch laptop.',
        category: 'Electronics',
        price: 450,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop'],
        location: 'Library Lobby',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_6',
        sellerId: users[5],
        title: 'Anker USB-C Hub 5-in-1',
        description: 'Extends ports to 3 USB-A, 1 HDMI, and Gigabit Ethernet.',
        category: 'Electronics',
        price: 1200,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop'],
        location: 'Hostel Block B, Room 221',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_7',
        sellerId: users[6],
        title: 'Standard Chemistry Lab Coat (Medium)',
        description: 'White cotton laboratory coat. Clean, washed.',
        category: 'Lab Equipment',
        price: 200,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop'],
        location: 'Girls Hostel Block A',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_8',
        sellerId: users[7],
        title: 'Wildcraft Campus Backpack (30L)',
        description: 'Water-resistant college backpack with padded sleeve.',
        category: 'Bags',
        price: 800,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop'],
        location: 'Main Canteen Area',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_9',
        sellerId: users[8],
        title: 'Gate CS Exam Preparation Guide 2025',
        description: 'Comprehensive guide with solved question papers from past 20 years.',
        category: 'Books',
        price: 650,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop'],
        location: 'Hostel Block C Lobby',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_10',
        sellerId: users[9],
        title: 'Introduction to Algorithms (CLRS)',
        description: 'Algorithms placement reference. Wear on spine.',
        category: 'Books',
        price: 1500,
        condition: 'fair',
        images: ['https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=500&auto=format&fit=crop'],
        location: 'Library Lobby Table',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_11',
        sellerId: users[0],
        title: 'Premium Classmate Notebook Set (3 Pack)',
        description: 'Unused softcover ruled spiral notebooks, 200 pages.',
        category: 'Stationery',
        price: 180,
        condition: 'new',
        images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop'],
        location: 'Hostel Block A, Room 102',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_13',
        sellerId: users[2],
        title: 'Casio fx-991EX Scientific Calculator (Duplicate)',
        description: 'Excellent condition fx-991ex calculator. Works perfectly. Contact to trade.',
        category: 'Calculators',
        price: 850,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&auto=format&fit=crop'],
        location: 'Girls Hostel B Lobby',
        status: 'available',
        createdAt: new Date()
      },
      {
        _id: 'mock_prod_14',
        sellerId: users[3],
        title: 'Casio fx-991EX Scientific Calculator (Duplicate 2)',
        description: 'Scientific calculator fx-991ex. Good condition. Ready for pickup.',
        category: 'Calculators',
        price: 890,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&auto=format&fit=crop'],
        location: 'Hostel Block C Entrance',
        status: 'available',
        createdAt: new Date()
      }
    );

    // Prepopulate 8 Lost Reports
    lostItems.push(
      {
        _id: 'mock_lost_1',
        userId: users[0],
        title: 'Black leather Fossil Wallet',
        category: 'Wallets',
        description: 'Lost wallet containing student ID card. Dropped near sports arena.',
        location: 'Sports Complex Field',
        dateLost: new Date(),
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop'],
        status: 'lost',
        createdAt: new Date()
      },
      {
        _id: 'mock_lost_2',
        userId: users[1],
        title: 'iPhone 13 (Blue Cover)',
        category: 'Electronics',
        description: 'iPhone 13 in blue case. Locked.',
        location: 'Main Seminar Hall',
        dateLost: new Date(),
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop'],
        status: 'lost',
        createdAt: new Date()
      }
    );

    // Prepopulate 8 Found Reports
    foundItems.push(
      {
        _id: 'mock_found_1',
        userId: users[2],
        title: 'Boat Rockerz 450 Headphones',
        category: 'Electronics',
        description: 'Found black over-ear headphones on canteen table bench. Verify to claim.',
        location: 'Main Cafeteria Bench',
        dateFound: new Date(),
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'],
        status: 'found',
        createdAt: new Date()
      },
      {
        _id: 'mock_found_2',
        userId: users[3],
        title: 'Helios Wristwatch (Silver Steel)',
        category: 'Accessories',
        description: 'Metallic watch found on lawn. Describe brand dial to claim.',
        location: 'Main Assembly Lawn',
        dateFound: new Date(),
        images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop'],
        status: 'found',
        createdAt: new Date()
      }
    );

    console.log("In-Memory DB Seeded successfully.");
  } catch (err) {
    console.error("Error seeding in-memory store", err);
  }
};

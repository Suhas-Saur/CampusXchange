import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { LostItem } from '../models/LostItem';
import { FoundItem } from '../models/FoundItem';
import { Order } from '../models/Order';
import { Payment } from '../models/Payment';
import { Message } from '../models/Message';
import { Notification } from '../models/Notification';
import { Report } from '../models/Report';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected.');

    // Clear existing data
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('Generating seed data...');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 12 Students (10 students, 2 admins)
    const studentsData = [
      {
        name: 'Suhas Reddy',
        email: 'student@lnmiit.ac.in', // Main demo student
        studentId: '2023CSE089',
        department: 'Computer Science',
        year: 3,
        phone: '9876543210',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Amit Sharma',
        email: 'amit.sharma@lnmiit.ac.in',
        studentId: '2022ECE012',
        department: 'Electronics & Comm',
        year: 4,
        phone: '9123456780',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Priya Patel',
        email: 'priya.patel@lnmiit.ac.in',
        studentId: '2024CCE045',
        department: 'Computer & Comm',
        year: 2,
        phone: '9234567890',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@lnmiit.ac.in',
        studentId: '2023ME023',
        department: 'Mechanical Eng',
        year: 3,
        phone: '9345678901',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@lnmiit.ac.in',
        studentId: '2025CSE010',
        department: 'Computer Science',
        year: 1,
        phone: '9456789012',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram.singh@lnmiit.ac.in',
        studentId: '2022CSE102',
        department: 'Computer Science',
        year: 4,
        phone: '9567890123',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Sneha Rao',
        email: 'sneha.rao@lnmiit.ac.in',
        studentId: '2024ECE067',
        department: 'Electronics & Comm',
        year: 2,
        phone: '9678901234',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@lnmiit.ac.in',
        studentId: '2023CCE056',
        department: 'Computer & Comm',
        year: 3,
        phone: '9789012345',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Diya Sen',
        email: 'diya.sen@lnmiit.ac.in',
        studentId: '2025ME005',
        department: 'Mechanical Eng',
        year: 1,
        phone: '9890123456',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Karan Malhotra',
        email: 'karan.m@lnmiit.ac.in',
        studentId: '2024CSE121',
        department: 'Computer Science',
        year: 2,
        phone: '9901234567',
        passwordHash,
        role: 'student',
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Admin User',
        email: 'admin@lnmiit.ac.in', // Main demo admin
        studentId: 'ADM001',
        department: 'Administration',
        year: 4,
        phone: '9999999999',
        passwordHash,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&auto=format'
      },
      {
        name: 'Demo Admin Guest',
        email: 'admin@campusconnect.demo',
        studentId: 'ADM002',
        department: 'Administration',
        year: 4,
        phone: '8888888888',
        passwordHash,
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&auto=format'
      }
    ];

    const users = await User.insertMany(studentsData);
    console.log(`Created ${users.length} user accounts.`);

    const studentIds = users.filter(u => u.role === 'student').map(u => u._id);

    // 12 Products
    const productsData = [
      {
        sellerId: studentIds[0],
        title: 'Engineering Mathematics Book (H.K. Dass)',
        description: 'Semester 1 and 2 engineering mathematics textbooks. Clean pages, no highlights, basically brand new condition.',
        category: 'Books',
        price: 250,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop'],
        location: 'Hostel Block A, Room 102',
        status: 'available'
      },
      {
        sellerId: studentIds[1],
        title: 'Casio fx-991EX Scientific Calculator',
        description: 'High-performance scientific calculator ideal for algebra, matrices, and integrations. Used for 2 years, works perfectly.',
        category: 'Calculators',
        price: 950,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1574634534894-89d7576c8259?w=500&auto=format&fit=crop'],
        location: 'Library Reference Section',
        status: 'available'
      },
      {
        sellerId: studentIds[2],
        title: 'Data Structures and Algorithms Notes',
        description: 'Complete compiler handwritten notes with detailed visual diagrams and key code templates in C++/Java. Super helpful for placements!',
        category: 'Notes',
        price: 150,
        condition: 'new',
        images: ['https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop'],
        location: 'Girls Hostel B, Block 3',
        status: 'available'
      },
      {
        sellerId: studentIds[3],
        title: 'Engineering Drawing Kit (Complete Set)',
        description: 'ED board, T-square ruler, set-square set, drafting sheet clips, and compass. Perfect for 1st-year students.',
        category: 'College Supplies',
        price: 500,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop'],
        location: 'Hostel Block C, Room 304',
        status: 'available'
      },
      {
        sellerId: studentIds[4],
        title: 'Adjustable Aluminum Laptop Stand',
        description: 'Ergonomic metal stand for 13-17 inch laptops. Relieves neck pain, has anti-slip rubber pads. Compact foldable design.',
        category: 'Electronics',
        price: 450,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop'],
        location: 'Library Lobby',
        status: 'available'
      },
      {
        sellerId: studentIds[5],
        title: 'Anker USB-C Hub 5-in-1',
        description: 'Expands your single USB-C port to 3 USB-A ports, an HDMI output supporting 4K, and a Gigabit Ethernet port. Metal body.',
        category: 'Electronics',
        price: 1200,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&auto=format&fit=crop'],
        location: 'Hostel Block B, Room 221',
        status: 'available'
      },
      {
        sellerId: studentIds[6],
        title: 'Standard Chemistry Lab Coat (Medium)',
        description: 'White cotton laboratory coat. Size M, clean, washed. Essential for Chemistry and Environmental labs.',
        category: 'Lab Equipment',
        price: 200,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop'],
        location: 'Girls Hostel Block A',
        status: 'available'
      },
      {
        sellerId: studentIds[7],
        title: 'Wildcraft Campus Backpack (30L)',
        description: 'Water-resistant college backpack. Has 3 large compartments and a padded laptop sleeve. No tears, zippers work smoothly.',
        category: 'Bags',
        price: 800,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop'],
        location: 'Main Canteen Area',
        status: 'available'
      },
      {
        sellerId: studentIds[8],
        title: 'Arduino Uno Starter Kit',
        description: 'Arduino board, breadboard, connecting wires, LEDs, buttons, resistors, and LCD module. Used for IoT minor project.',
        category: 'Electronics',
        price: 650,
        condition: 'good',
        images: ['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=500&auto=format&fit=crop'],
        location: 'Hostel Block C, Room 112',
        status: 'available'
      },
      {
        sellerId: studentIds[9],
        title: 'Introduction to Algorithms (CLRS)',
        description: 'Placements bible for Algorithms. Standard Edition, pages are clean, minor wear on the paper cover spine.',
        category: 'Books',
        price: 1500,
        condition: 'fair',
        images: ['https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=500&auto=format&fit=crop'],
        location: 'Library Lobby Table',
        status: 'available'
      },
      {
        sellerId: studentIds[0],
        title: 'Premium Classmate Notebook Set (3 Pack)',
        description: '3 unused softcover ruled spiral notebooks, 200 pages each. Standard college sizes.',
        category: 'Stationery',
        price: 180,
        condition: 'new',
        images: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop'],
        location: 'Hostel Block A, Room 102',
        status: 'available'
      },
      {
        sellerId: studentIds[1],
        title: 'Wipro Smart LED Desk Lamp',
        description: 'Dimmable study desk lamp. Adjustable brightness levels, USB powered, 3 color lighting modes (warm/cool/neutral).',
        category: 'Furniture',
        price: 600,
        condition: 'like_new',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop'],
        location: 'Library Reference Section',
        status: 'available'
      }
    ];

    const products = await Product.insertMany(productsData);
    console.log(`Created ${products.length} marketplace products.`);

    // 8 Lost Items
    const lostItemsData = [
      {
        userId: studentIds[0],
        title: 'Black leather Fossil Wallet',
        category: 'Wallets',
        description: 'Lost a black Fossil wallet containing my student ID card, driver license, and around ₹500 cash. Might have dropped near the sports field.',
        location: 'Sports Complex Field',
        dateLost: new Date('2026-08-14T17:30:00'),
        images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop'],
        status: 'lost'
      },
      {
        userId: studentIds[1],
        title: 'iPhone 13 (Blue Cover)',
        category: 'Electronics',
        description: 'Lost an iPhone 13 in a translucent blue bumper case. Locked. If found, please return immediately, has critical OTP apps.',
        location: 'Main Seminar Hall',
        dateLost: new Date('2026-08-15T11:00:00'),
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&auto=format&fit=crop'],
        status: 'lost'
      },
      {
        userId: studentIds[2],
        title: 'LNM IIT College ID Card',
        category: 'ID Cards',
        description: 'Student ID card printed with name Priya Patel, Registration Number 2024CCE045. Lost on Friday.',
        location: 'Main Cafeteria Second Floor',
        dateLost: new Date('2026-08-14T13:15:00'),
        images: [],
        status: 'lost'
      },
      {
        userId: studentIds[3],
        title: 'Blue Campus Parker Pen',
        category: 'Accessories',
        description: 'A blue metal body Parker Jotter pen. Has emotional value, was a gift.',
        location: 'Physics Lab - Room 204',
        dateLost: new Date('2026-08-13T10:00:00'),
        images: [],
        status: 'lost'
      },
      {
        userId: studentIds[4],
        title: 'Keys with Captain America Keychain',
        category: 'Keys',
        description: 'Set of 3 keys (room key + wardrobe key) attached to a rubber Captain America shield keychain.',
        location: 'Academic Block-1 Lawn',
        dateLost: new Date('2026-08-15T09:30:00'),
        images: [],
        status: 'lost'
      },
      {
        userId: studentIds[5],
        title: 'HP Laptop Charger (65W)',
        category: 'Electronics',
        description: 'Standard black HP laptop charger with round pin connector. Left on a charging board in library room 4.',
        location: 'Central Library Room 4',
        dateLost: new Date('2026-08-14T18:00:00'),
        images: [],
        status: 'lost'
      },
      {
        userId: studentIds[6],
        title: 'Gray Puma Hooded Jacket',
        category: 'Clothing',
        description: 'Gray puma zipper hoodie. Size L. Dropped during the evening basketball practice.',
        location: 'Basketball Court',
        dateLost: new Date('2026-08-13T19:30:00'),
        images: [],
        status: 'lost'
      },
      {
        userId: studentIds[7],
        title: 'Black Glasses Frame (Lenskart)',
        category: 'Accessories',
        description: 'Transparent/black Lenskart eyeglasses frame. Left in the Seminar Hall 2 on the desk.',
        location: 'Seminar Hall 2, desk row 4',
        dateLost: new Date('2026-08-12T15:00:00'),
        images: [],
        status: 'lost'
      }
    ];

    const lostItems = await LostItem.insertMany(lostItemsData);
    console.log(`Created ${lostItems.length} lost reports.`);

    // 8 Found Items
    const foundItemsData = [
      {
        userId: studentIds[1],
        title: 'Boat Rockerz 450 Headphones',
        category: 'Electronics',
        description: 'Found black Boat Rockerz over-ear headphones on the cafeteria bench. Keeps turning on, battery is full. Contact to verify.',
        location: 'Main Cafeteria Bench',
        dateFound: new Date('2026-08-15T14:00:00'),
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'],
        status: 'found'
      },
      {
        userId: studentIds[2],
        title: 'Helios Wristwatch (Silver Steel)',
        category: 'Accessories',
        description: 'Found a silver metallic wristwatch on the grass field. Has date display dial. Verify the brand name to claim.',
        location: 'Main Assembly Lawn',
        dateFound: new Date('2026-08-14T16:00:00'),
        images: ['https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop'],
        status: 'found'
      },
      {
        userId: studentIds[3],
        title: 'Bunch of Room Keys (4 keys)',
        category: 'Keys',
        description: 'Found a bunch of 4 silver keys on a ring with a small steel bottle opener charm. Picked up from canteen floor.',
        location: 'Campus Canteen Floor',
        dateFound: new Date('2026-08-15T12:00:00'),
        images: [],
        status: 'found'
      },
      {
        userId: studentIds[4],
        title: 'Tupperware Water Bottle (Green)',
        category: 'Bags',
        description: 'Green plastic Tupperware bottle found in Classroom LT-3 under the desk.',
        location: 'LT-3 Hallway Classroom',
        dateFound: new Date('2026-08-15T10:30:00'),
        images: [],
        status: 'found'
      },
      {
        userId: studentIds[5],
        title: 'SanDisk 64GB USB Drive',
        category: 'Electronics',
        description: 'Metal body SanDisk Cruzer USB 3.0 flash drive. Found connected to desktop #12 in lab 2. Has project PPT files.',
        location: 'Computer Lab 2, Desktop 12',
        dateFound: new Date('2026-08-14T17:45:00'),
        images: [],
        status: 'found'
      },
      {
        userId: studentIds[6],
        title: 'Pink Umbrella (Polka Dot)',
        category: 'Accessories',
        description: 'Found a pink folding umbrella with white polka dots left at the library gate entrance umbrella stand.',
        location: 'Central Library Entrance',
        dateFound: new Date('2026-08-14T15:20:00'),
        images: [],
        status: 'found'
      },
      {
        userId: studentIds[7],
        title: 'Blue Laptop Sleeve Case',
        category: 'Bags',
        description: 'Felt soft laptop sleeve bag, dark blue color. Found on the second bench in Seminar Hall.',
        location: 'Main Seminar Hall',
        dateFound: new Date('2026-08-13T16:30:00'),
        images: [],
        status: 'found'
      },
      {
        userId: studentIds[8],
        title: 'Classmate Octane Pen (Black)',
        category: 'Accessories',
        description: 'Black Octane gel pen, picked up near drawing hall.',
        location: 'Engineering Drawing Hall corridor',
        dateFound: new Date('2026-08-15T15:10:00'),
        images: [],
        status: 'found'
      }
    ];

    const foundItems = await FoundItem.insertMany(foundItemsData);
    console.log(`Created ${foundItems.length} found reports.`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

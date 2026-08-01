import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import Prize from '../models/Prize.js';
import Ticket from '../models/Ticket.js';
import Draw from '../models/Draw.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Clearing existing database collections...');
    await Admin.deleteMany({});
    await Prize.deleteMany({});
    await Ticket.deleteMany({});
    await Draw.deleteMany({});

    console.log('Seeding Default Admin User...');
    const adminUser = await Admin.create({
      username: 'admin',
      email: 'admin@onamluckydraw2026.com',
      password: 'password123', // In production, this must be hashed (e.g., bcrypt)
      role: 'superadmin',
    });
    console.log(`Created Admin: ${adminUser.username} (${adminUser.email})`);

    console.log('Seeding Default Thiruvonam Bumper Prizes...');
    const prizes = [
      {
        rank: 1,
        title: 'Grand Thiruvonam Bumper',
        subtitle: '1st Bumper Winner',
        ribbonText: 'GRAND BUMPER',
        isFeatured: true,
        perks: ['🏆 Smart Watch'],
        status: 'unclaimed',
      },
      {
        rank: 2,
        title: 'Second Prize',
        subtitle: '2nd Prize Winner',
        ribbonText: '2ND BUMPER',
        isFeatured: false,
        perks: ['🔊 Bluetooth Speaker'],
        status: 'unclaimed',
      },
      {
        rank: 3,
        title: 'Third Prize',
        subtitle: '3rd Prize Winner',
        ribbonText: '3RD BUMPER',
        isFeatured: false,
        perks: ['👘 Onakkodi'],
        status: 'unclaimed',
      },
    ];

    const createdPrizes = await Prize.insertMany(prizes);
    console.log(`Seeded ${createdPrizes.length} prizes successfully.`);

    console.log('Seeding Mock Tickets...');
    const mockTickets = [
      {
        ticketCode: 'ONAM-2026-8941',
        purchaserName: 'Gopakumar K.',
        email: 'gopakumar.k@secretariat.in',
        phone: '9847012345',
        department: 'Electronics & Communication',
        ticketPrice: 150,
        paymentStatus: 'completed',
        razorpayOrderId: 'order_mock_001',
        razorpayPaymentId: 'pay_mock_001',
      },
      {
        ticketCode: 'ONAM-2026-1042',
        purchaserName: 'Aishwarya Lakshmi',
        email: 'aishu.lakshmi@secretariat.in',
        phone: '9447123456',
        department: 'Electronics & Communication',
        ticketPrice: 150,
        paymentStatus: 'completed',
        razorpayOrderId: 'order_mock_002',
        razorpayPaymentId: 'pay_mock_002',
      },
      {
        ticketCode: 'ONAM-2026-3392',
        purchaserName: 'Rahul Varma',
        email: 'rahul.varma@secretariat.in',
        phone: '8157956164',
        department: 'General Administration',
        ticketPrice: 150,
        paymentStatus: 'pending',
        razorpayOrderId: 'order_mock_003',
      }
    ];

    const createdTickets = await Ticket.insertMany(mockTickets);
    console.log(`Seeded ${createdTickets.length} mock tickets successfully.`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Database Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Ticket from '../models/Ticket.js';
import Settings from '../models/Settings.js';
import Draw from '../models/Draw.js';
import Winner from '../models/Winner.js';
import Prize from '../models/Prize.js';

// Helper to get or create settings
const getOrCreateSettings = async () => {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return settings;
};

export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const validUsername = process.env.ADMIN_USERNAME || 'admin';
        const validPassword = process.env.ADMIN_PASSWORD || 'onam2026';
        
        if (username === validUsername && password === validPassword) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'supersecretkey_onam_draw_2026', { expiresIn: '1d' });
            return res.status(200).json({ success: true, token, user: { role: 'admin', username } });
        }
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        
        // Total Collection (sum of completed tickets)
        const collectionResult = await Ticket.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$ticketPrice' } } }
        ]);
        const totalCollection = collectionResult.length > 0 ? collectionResult[0].total : 0;

        // Total Participants (count of completed tickets)
        const participantsCount = await Ticket.countDocuments({ paymentStatus: 'completed' });

        // Recent Registrations
        const recentPayments = await Ticket.find({ paymentStatus: 'completed' })
            .sort({ purchasedAt: -1 })
            .limit(5)
            .select('ticketCode purchaserName department purchasedAt ticketPrice razorpayPaymentId paymentStatus');

        res.status(200).json({
            success: true,
            stats: {
                totalCollection,
                participantsCount,
                targetAmount: settings.targetAmount,
                targetDate: settings.targetDate,
            },
            recentPayments
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .sort({ purchasedAt: -1 })
            .select('ticketCode purchaserName department purchasedAt ticketPrice razorpayPaymentId paymentStatus');
        
        res.status(200).json({
            success: true,
            tickets
        });
    } catch (error) {
        console.error("Get Tickets Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getReports = async (req, res) => {
    try {
        const collectionResult = await Ticket.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$ticketPrice' } } }
        ]);
        const totalCollection = collectionResult.length > 0 ? collectionResult[0].total : 0;
        const totalParticipants = await Ticket.countDocuments({ paymentStatus: 'completed' });
        const settings = await getOrCreateSettings();

        // Department Distribution
        const deptDistribution = await Ticket.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: "$department", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const departmentData = deptDistribution.map(dept => ({
            name: dept._id,
            count: dept.count,
            percentage: ((dept.count / totalParticipants) * 100).toFixed(1)
        }));

        res.status(200).json({
            success: true,
            stats: {
                totalCollection,
                totalParticipants,
                targetAmount: settings.targetAmount
            },
            departmentData
        });
    } catch (error) {
        console.error("Get Reports Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.status(200).json({
            success: true,
            settings
        });
    } catch (error) {
        console.error("Get Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { eventName, targetAmount, targetDate, entryFee } = req.body;
        let settings = await getOrCreateSettings();
        
        if (eventName) settings.eventName = eventName;
        if (targetAmount !== undefined) settings.targetAmount = targetAmount;
        if (targetDate) settings.targetDate = targetDate;
        if (entryFee !== undefined) settings.entryFee = entryFee;
        
        await settings.save();

        res.status(200).json({
            success: true,
            settings,
            message: "Settings updated successfully"
        });
    } catch (error) {
        console.error("Update Settings Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getDrawStatus = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const collectionResult = await Ticket.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$ticketPrice' } } }
        ]);
        const collectedAmount = collectionResult.length > 0 ? collectionResult[0].total : 0;
        const participantCount = await Ticket.countDocuments({ paymentStatus: 'completed' });

        res.status(200).json({
            success: true,
            status: {
                targetAmount: settings.targetAmount,
                targetDate: settings.targetDate,
                collectedAmount,
                participantCount
            }
        });
    } catch (error) {
        console.error("Get Draw Status Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

let isDrawExecuting = false;

export const executeDraw = async (req, res) => {
    if (isDrawExecuting) {
        return res.status(409).json({ success: false, message: "A draw is currently running. Please wait." });
    }
    
    isDrawExecuting = true;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find a random ticket that hasn't won yet
        const eligibleTickets = await Ticket.find({ paymentStatus: 'completed', isWinner: false }).session(session);
        
        if (eligibleTickets.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "No eligible tickets found for the draw." });
        }

        const randomIndex = Math.floor(Math.random() * eligibleTickets.length);
        const winningTicket = eligibleTickets[randomIndex];

        // Find the next available unclaimed prize based on rank
        let prize = await Prize.findOne({ status: 'unclaimed' }).sort({ rank: 1 }).session(session);
        if (!prize) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "No prizes remain to be awarded." });
        }

        // Create Draw record
        const drawDoc = await Draw.create([{
            drawName: prize.title,
            prize: prize._id,
            status: 'completed',
            winnerTicket: winningTicket._id,
            drawnAt: new Date()
        }], { session });
        const draw = drawDoc[0];

        // Create Winner record
        const winnerDoc = await Winner.create([{
            draw: draw._id,
            prize: prize._id,
            ticket: winningTicket._id,
            user: winningTicket.user || null,
            status: 'notified'
        }], { session });
        const winner = winnerDoc[0];

        // Update Ticket
        winningTicket.isWinner = true;
        winningTicket.prizeWon = prize._id;
        await winningTicket.save({ session });

        // Update Prize status to claimed
        prize.status = 'claimed';
        await prize.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Draw executed successfully!",
            winner: {
                ticketCode: winningTicket.ticketCode,
                purchaserName: winningTicket.purchaserName,
                department: winningTicket.department,
                phone: winningTicket.phone,
                prizeTitle: prize.title
            }
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error("Execute Draw Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    } finally {
        isDrawExecuting = false;
    }
};

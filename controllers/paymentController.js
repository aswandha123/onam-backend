import razorpay from "../config/razorpay.js";
import { verifyPaymentSignature } from "../services/razorpayService.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Settings from "../models/Settings.js";
import { generateUniqueTicketCode } from "../utils/generateTicketCode.js";


export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        // Validate amount
        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        // Razorpay expects amount in paise
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `onam_${Date.now()}`,
        };

        // Create Razorpay order
        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",
            order,
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order",
        });
    }
};

/**
 * Verify Razorpay Payment Signature
 */
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            name,
            email,
            phone,
            department,
        } = req.body;

        // 1. Validate request
        if (
            !razorpay_payment_id ||
            !razorpay_order_id ||
            !razorpay_signature ||
            !name ||
            !email ||
            !phone ||
            !department
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details",
            });
        }

        // 2. Verify Razorpay signature
        const isValid = verifyPaymentSignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
        // 3. Prevent duplicate payment storage
        const existingPayment = await Payment.findOne({
            razorpayPaymentId: razorpay_payment_id,
        });

        if (existingPayment) {
            return res.status(409).json({
                success: false,
                message: "This payment has already been processed",
            });
        }

        // 4. Find existing user
        let user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { phone: phone },
            ],
        });

        if (!user) {
            user = await User.create({
                name,
                email: email.toLowerCase(),
                phone,
                department,
            });
        }

        // Check whether the user already has a completed ticket
        const existingTicket = await Ticket.findOne({
            $or: [
                { email: email.toLowerCase() },
                { phone: phone },
            ],
            paymentStatus: "completed",
        });

        if (existingTicket) {
            return res.status(409).json({
                success: false,
                message: "A ticket has already been purchased using this email or phone number."
            });
        }
        // Generate a unique ticket code
        const ticketCode = await generateUniqueTicketCode();

        let settings = await Settings.findOne();
        let currentFee = settings ? settings.entryFee : 150;

        // Create the ticket
        const ticket = await Ticket.create({
            ticketCode,
            purchaserName: name,
            email: email.toLowerCase(),
            phone,
            department,

            ticketPrice: currentFee,
            paymentStatus: "completed",

            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
        });
        const payment = await Payment.create({
            ticket: ticket._id,
            user: user._id,

            amount: currentFee,
            currency: "INR",
            status: "completed",

            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });
        return res.status(200).json({
            success: true,
            message: "Payment verified and ticket generated successfully",

            paymentId: payment._id,

            ticket: {
                id: ticket._id,
                ticketCode: ticket.ticketCode,
                purchaserName: ticket.purchaserName,
                email: ticket.email,
                phone: ticket.phone,
                department: ticket.department,
            },
        });

    } catch (error) {
        console.error("Payment verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to verify payment",
        });
    }
};

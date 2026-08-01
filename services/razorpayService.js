import crypto from "crypto";

export const verifyPaymentSignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
}) => {
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    return generatedSignature === razorpaySignature;
};
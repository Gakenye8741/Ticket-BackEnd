"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentService = exports.updatePaymentService = exports.createPaymentService = exports.getPaymentsByStatusService = exports.getPaymentsByNationalIdService = exports.getPaymentsByBookingIdService = exports.getPaymentByIdService = exports.getAllPaymentsService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../../drizzle/db"));
const schema_1 = require("../../drizzle/schema");
// Get all payments
const getAllPaymentsService = async () => {
    return await db_1.default.query.payments.findMany({
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.payments.createdAt)],
        with: {
            booking: true,
        },
    });
};
exports.getAllPaymentsService = getAllPaymentsService;
// Get payment by ID
const getPaymentByIdService = async (paymentId) => {
    return await db_1.default.query.payments.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.payments.paymentId, paymentId),
        with: {
            booking: true,
        },
    });
};
exports.getPaymentByIdService = getPaymentByIdService;
// Get payments by Booking ID
const getPaymentsByBookingIdService = async (bookingId) => {
    return await db_1.default.query.payments.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.payments.bookingId, bookingId),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.payments.paymentDate)],
        with: {
            booking: true,
        },
    });
};
exports.getPaymentsByBookingIdService = getPaymentsByBookingIdService;
// ✅ Get payments by National ID
const getPaymentsByNationalIdService = async (nationalId) => {
    return await db_1.default.query.payments.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.payments.nationalId, nationalId),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.payments.paymentDate)],
        with: {
            booking: true,
        },
    });
};
exports.getPaymentsByNationalIdService = getPaymentsByNationalIdService;
// Get payments by status
const getPaymentsByStatusService = async (status) => {
    return await db_1.default.query.payments.findMany({
        where: (0, drizzle_orm_1.eq)(schema_1.payments.paymentStatus, status),
        orderBy: [(0, drizzle_orm_1.desc)(schema_1.payments.paymentDate)],
        with: {
            booking: true,
        },
    });
};
exports.getPaymentsByStatusService = getPaymentsByStatusService;
// Create a new payment
const createPaymentService = async (payment) => {
    await db_1.default.insert(schema_1.payments).values(payment).returning();
    return "Payment created successfully ✅";
};
exports.createPaymentService = createPaymentService;
// Update an existing payment
const updatePaymentService = async (paymentId, payment) => {
    await db_1.default.update(schema_1.payments).set(payment).where((0, drizzle_orm_1.eq)(schema_1.payments.paymentId, paymentId));
    return "Payment updated successfully 🔄";
};
exports.updatePaymentService = updatePaymentService;
// Delete payment by ID
const deletePaymentService = async (paymentId) => {
    await db_1.default.delete(schema_1.payments).where((0, drizzle_orm_1.eq)(schema_1.payments.paymentId, paymentId));
    return "Payment deleted successfully ❌";
};
exports.deletePaymentService = deletePaymentService;

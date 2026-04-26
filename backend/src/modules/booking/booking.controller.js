import * as bookingService from './booking.service.js';
import { success } from '../../utils/response.js';
import { emitToUser } from '../../sockets/index.js';

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    return success(res, booking, 'Booking created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getUserBookings(req.user.id, req.query);
    return success(res, result, 'Bookings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.user.id, req.params.id);
    return success(res, booking, 'Booking retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.user.id, req.params.id);

    // Notify the user in real-time so the booking moves to the Cancelled tab instantly
    const io = req.app.get('io');
    if (io) {
      emitToUser(io, req.user.id, 'booking:cancelled', { bookingId: booking.id });
    }

    return success(res, booking, 'Booking cancelled successfully');
  } catch (err) {
    next(err);
  }
};

export const getAgentBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getAgentBookings(req.user.id, req.query);
    return success(res, result, 'Agent bookings retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatus(req.user.id, req.params.id, req.body.status);

    // If the agent cancels the booking, notify the tenant in real-time
    if (req.body.status === 'CANCELLED') {
      const io = req.app.get('io');
      if (io) {
        emitToUser(io, booking.userId, 'booking:cancelled', { bookingId: booking.id });
      }
    }

    return success(res, booking, 'Booking status updated successfully');
  } catch (err) {
    next(err);
  }
};

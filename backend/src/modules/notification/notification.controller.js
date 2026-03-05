import * as notificationService from './notification.service.js';
import { success } from '../../utils/response.js';

export const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.user.id, req.query);
    return success(res, result, 'Notifications retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(req.user.id, req.params.id);
    return success(res, notification, 'Notification retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    return success(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return success(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);
    return success(res, result, 'Unread count retrieved');
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.user.id, req.params.id);
    return success(res, result, 'Notification deleted');
  } catch (err) {
    next(err);
  }
};

export const clearAll = async (req, res, next) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user.id);
    return success(res, result, 'All notifications cleared');
  } catch (err) {
    next(err);
  }
};

export const registerDevice = async (req, res, next) => {
  try {
    const deviceToken = await notificationService.registerDeviceToken(req.user.id, req.body);
    return success(res, deviceToken, 'Device token registered', 201);
  } catch (err) {
    next(err);
  }
};

export const removeDevice = async (req, res, next) => {
  try {
    const result = await notificationService.removeDeviceToken(req.user.id, req.body.token);
    return success(res, result, 'Device token removed');
  } catch (err) {
    next(err);
  }
};

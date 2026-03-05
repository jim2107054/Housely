import * as messageService from './message.service.js';
import { success } from '../../utils/response.js';

export const createConversation = async (req, res, next) => {
  try {
    const conversation = await messageService.getOrCreateConversation(
      req.user.id,
      req.body.agentId,
      req.body.houseId,
    );
    return success(res, conversation, 'Conversation created', 201);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const result = await messageService.getUserConversations(req.user.id, req.user.role, req.query);
    return success(res, result, 'Conversations retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const conversation = await messageService.getConversationById(req.user.id, req.params.id);
    return success(res, conversation, 'Conversation retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const result = await messageService.getMessages(req.user.id, req.params.id, req.query);
    return success(res, result, 'Messages retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(req.user.id, req.params.id, req.body);
    return success(res, message, 'Message sent', 201);
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const result = await messageService.markAsRead(req.user.id, req.params.id);
    return success(res, result, 'Messages marked as read');
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const result = await messageService.getUnreadCount(req.user.id);
    return success(res, result, 'Unread count retrieved');
  } catch (err) {
    next(err);
  }
};

export const deleteConversation = async (req, res, next) => {
  try {
    const result = await messageService.deleteConversation(req.user.id, req.params.id);
    return success(res, result, 'Conversation deleted');
  } catch (err) {
    next(err);
  }
};

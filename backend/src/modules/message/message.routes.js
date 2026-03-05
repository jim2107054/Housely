import { Router } from 'express';
import * as messageController from './message.controller.js';
import { validate } from '../../middlewares/validate.js';
import { protect } from '../../middlewares/auth.js';
import {
  createConversationSchema,
  conversationIdSchema,
  sendMessageSchema,
  listMessagesSchema,
  listConversationsSchema,
} from './message.validation.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Conversations
router.get('/', validate(listConversationsSchema), messageController.getConversations);
router.post('/', validate(createConversationSchema), messageController.createConversation);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/:id', validate(conversationIdSchema), messageController.getConversation);
router.delete('/:id', validate(conversationIdSchema), messageController.deleteConversation);

// Messages within a conversation
router.get('/:id/messages', validate(listMessagesSchema), messageController.getMessages);
router.post('/:id/messages', validate(sendMessageSchema), messageController.sendMessage);
router.patch('/:id/read', validate(conversationIdSchema), messageController.markAsRead);

export default router;

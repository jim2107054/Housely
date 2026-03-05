import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    agentId: z.string().min(1, 'Agent ID is required'),
    houseId: z.string().optional(),
  }),
});

export const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
  body: z.object({
    content: z.string().min(1, 'Message content is required'),
    type: z.enum(['text', 'image', 'audio', 'video']).optional().default('text'),
  }),
});

export const listMessagesSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(50),
    before: z.string().optional(), // cursor-based pagination
  }),
});

export const listConversationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
  }),
});

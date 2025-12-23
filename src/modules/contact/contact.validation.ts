import { z } from 'zod';

const createContact = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string'
    }).min(1, 'Name is required').max(100, 'Name is too long'),
    
    email: z.string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string'
    }).email('Please provide a valid email'),
    
    message: z.string({
      required_error: 'Message is required',
      invalid_type_error: 'Message must be a string'
    }).min(1, 'Message is required').max(2000, 'Message is too long')
  })
});

const updateContact = z.object({
  body: z.object({
    isRead: z.boolean().optional()
  })
});

export const ValidContact = {
  create: createContact,
  update: updateContact
};
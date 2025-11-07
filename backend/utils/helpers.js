// Response helpers
export const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString()
});

export const errorResponse = (message = 'Error', code = 'ERROR') => ({
  success: false,
  message,
  code,
  timestamp: new Date().toISOString()
});

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export default {
  successResponse,
  errorResponse,
  sanitizeInput
};

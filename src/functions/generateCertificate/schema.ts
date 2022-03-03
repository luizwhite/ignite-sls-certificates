export default {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    grade: { type: 'string' },
  },
  required: ['id', 'name', 'grade'],
} as const;

const { PrismaClient } = require('@prisma/client');

const JSON_FIELDS = ['gradingScale', 'classificationRules', 'specialGrades', 'documentIds', 'sources'];

function serializeJsonFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(serializeJsonFields);
  const copy = { ...obj };
  for (const key of Object.keys(copy)) {
    if (JSON_FIELDS.includes(key) && copy[key] !== null && copy[key] !== undefined && typeof copy[key] !== 'string') {
      copy[key] = JSON.stringify(copy[key]);
    } else if (typeof copy[key] === 'object' && !(copy[key] instanceof Date)) {
      copy[key] = serializeJsonFields(copy[key]);
    }
  }
  return copy;
}

function parseJsonFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(parseJsonFields);
  for (const key of Object.keys(obj)) {
    if (JSON_FIELDS.includes(key) && typeof obj[key] === 'string') {
      try {
        obj[key] = JSON.parse(obj[key]);
      } catch (e) {
        // leave as string if not valid JSON
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date)) {
      parseJsonFields(obj[key]);
    }
  }
  return obj;
}

// Shared Prisma singleton — avoids creating multiple connection pools
// across controllers and middleware.
const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.args) {
    if (params.args.data) params.args.data = serializeJsonFields(params.args.data);
    if (params.args.create) params.args.create = serializeJsonFields(params.args.create);
    if (params.args.update) params.args.update = serializeJsonFields(params.args.update);
  }
  const result = await next(params);
  return parseJsonFields(result);
});

module.exports = prisma;

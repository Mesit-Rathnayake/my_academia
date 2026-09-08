const { PrismaClient } = require('@prisma/client');

// Shared Prisma singleton — avoids creating multiple connection pools
// across controllers and middleware.
const prisma = new PrismaClient();

module.exports = prisma;

// // lib/connect.ts
// import { PrismaClient } from "@prisma/client";

// declare global {
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// const prisma = global.prisma ?? new PrismaClient();

// export default prisma;

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;

import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient();

prisma.$use(async (params, next) => {
  // Execute the query first
  const result = await next(params);

  // Log the database action
  await prisma.databaseLog.create({
    data: {
      model: params.model,
      action: params.action,
      args: params.args ? JSON.stringify(params.args) : null,
    },
  });

  return result;
});

export default prisma;

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

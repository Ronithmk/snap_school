import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const users = [
    { id: "usr_platform_admin", name: "Platform Admin", email: "admin@snapschool.app", password: "demo1234", role: "platform_admin" },
    { id: "usr_school_admin", name: "School Admin", email: "school@snapschool.app", password: "demo1234", role: "school_admin" },
  ];

  for (const u of users) {
    await db.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        password: bcrypt.hashSync(u.password, 10),
        role: u.role,
      },
    });
    console.log(`Seeded: ${u.email}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());

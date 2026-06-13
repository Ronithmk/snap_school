import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const users = [
    { id: "usr_platform_admin", name: "Platform Admin", email: "admin@snapschool.app", password: "demo1234", role: "platform_admin" },
    { id: "usr_school_admin", name: "School Admin", email: "school@snapschool.app", password: "demo1234", role: "school_admin" },
    { id: "usr_parent_demo", name: "Demo Parent", email: "parent@snapschool.app", password: "demo1234", role: "parent" },
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

  // ── Demo school + storefront content ──────────────────────────────
  const school = await db.school.upsert({
    where: { slug: "demo-school" },
    update: {},
    create: {
      id: "school_demo",
      slug: "demo-school",
      name: "Demo School",
      status: "active",
      description: "A sample school used to preview the storefront, cart, and checkout.",
      bannerUrl: "/demo/cover.jpg",
    },
  });
  console.log(`Seeded school: ${school.slug}`);

  await db.schoolAdmin.upsert({
    where: { userId_schoolId: { userId: "usr_school_admin", schoolId: school.id } },
    update: {},
    create: { userId: "usr_school_admin", schoolId: school.id },
  });

  const priceList = await db.priceList.upsert({
    where: { id: "pricelist_demo" },
    update: {},
    create: {
      id: "pricelist_demo",
      schoolId: school.id,
      name: "Standard Price List",
      countryCode: "IN",
      currencyCode: "INR",
      isDefault: true,
      items: {
        create: [
          { id: "item_digital_single", type: "digital", name: "Digital Download", amount: 99, unitsIncluded: 1, productType: "digital" },
          { id: "item_print_4x6", type: "print", name: "4x6 Print", amount: 49, unitsIncluded: 1, productType: "print" },
          { id: "item_print_8x10", type: "print", name: "8x10 Print", amount: 149, unitsIncluded: 1, productType: "print" },
        ],
      },
    },
  });
  console.log(`Seeded price list: ${priceList.name}`);

  const student = await db.student.upsert({
    where: { username: "demo1234567" },
    update: {},
    create: {
      id: "student_demo",
      schoolId: school.id,
      name: "Demo Student",
      username: "demo1234567",
      accessCode: "DEMO2026",
      coverPhotoUrl: "/demo/cover.jpg",
    },
  });
  console.log(`Seeded student: ${student.username} (access code: ${student.accessCode})`);

  await db.parentStudent.upsert({
    where: { userId_studentId: { userId: "usr_parent_demo", studentId: student.id } },
    update: {},
    create: { userId: "usr_parent_demo", studentId: student.id },
  });

  const album = await db.album.upsert({
    where: { schoolId_slug: { schoolId: school.id, slug: "demo-album" } },
    update: {},
    create: {
      id: "album_demo",
      schoolId: school.id,
      studentId: student.id,
      title: "Demo Album",
      slug: "demo-album",
      description: "Sample photos for previewing the gallery, cart, and checkout.",
      coverImageUrl: "/demo/cover.jpg",
      visibility: "private",
      priceListId: priceList.id,
      photoCount: 6,
    },
  });
  console.log(`Seeded album: ${album.title}`);

  for (let i = 1; i <= 6; i++) {
    await db.photo.upsert({
      where: { id: `photo_demo_${i}` },
      update: {},
      create: {
        id: `photo_demo_${i}`,
        albumId: album.id,
        previewUrl: `/demo/photo-${i}.jpg`,
        hdUrl: `/demo/photo-${i}.jpg`,
        thumbnailUrl: `/demo/photo-${i}-thumb.jpg`,
        width: 1200,
        height: 1500,
        fileName: `photo-${i}.jpg`,
      },
    });
  }
  console.log("Seeded 6 demo photos");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());

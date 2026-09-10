import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CanteenX Database Seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.user.deleteMany();
  await prisma.college.deleteMany();

  // 2. Seed Colleges
  const colleges = await Promise.all([
    prisma.college.create({
      data: {
        collegeId: 'BCE001',
        collegeName: 'Brindavan College of Engineering',
        location: 'Bengaluru, Karnataka',
        logo: '🏛️',
        isActive: true,
      },
    }),
    prisma.college.create({
      data: {
        collegeId: 'ABC001',
        collegeName: 'ABC Engineering College',
        location: 'Bengaluru, Karnataka',
        logo: '🎓',
        isActive: true,
      },
    }),
    prisma.college.create({
      data: {
        collegeId: 'XYZ001',
        collegeName: 'XYZ Institute of Technology',
        location: 'Hyderabad, Telangana',
        logo: '⚡',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${colleges.length} demo colleges.`);

  // 3. Seed Users (Demo Student, Kitchen Staff, Super Admin) with bcrypt hashed passwords
  const studentPasswordHash = bcrypt.hashSync('password123', 10);
  const staffPasswordHash = bcrypt.hashSync('staff123', 10);
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);

  const users = await Promise.all([
    // Student 1 - BCE
    prisma.user.create({
      data: {
        fullName: 'Vishnu Sharma',
        email: 'student@college.edu',
        mobileNumber: '+91 98765 43210',
        passwordHash: studentPasswordHash,
        studentId: 'BCE-STU-2048',
        role: UserRole.STUDENT,
        collegeId: 'BCE001',
        dietaryPreference: 'veg',
        typicalBudget: 60,
        walletBalance: 350,
        favoriteCategories: ['Breakfast', 'Snacks'],
      },
    }),
    // Student 2 - ABC
    prisma.user.create({
      data: {
        fullName: 'Aarav Patel',
        email: 'aarav@abc.edu',
        mobileNumber: '+91 98765 11111',
        passwordHash: studentPasswordHash,
        studentId: 'ABC-STU-1022',
        role: UserRole.STUDENT,
        collegeId: 'ABC001',
        dietaryPreference: 'veg',
        typicalBudget: 80,
        walletBalance: 400,
        favoriteCategories: ['Meals', 'Beverages'],
      },
    }),
    // Kitchen Staff - BCE
    prisma.user.create({
      data: {
        fullName: 'Ramesh (Head Chef)',
        email: 'staff.bce@canteenx.edu',
        mobileNumber: '+91 98765 00001',
        passwordHash: staffPasswordHash,
        staffId: 'KITCH-BCE-001',
        role: UserRole.KITCHEN_STAFF,
        collegeId: 'BCE001',
      },
    }),
    // Kitchen Staff - ABC
    prisma.user.create({
      data: {
        fullName: 'Suresh (Kitchen Head)',
        email: 'staff.abc@canteenx.edu',
        mobileNumber: '+91 98765 00002',
        passwordHash: staffPasswordHash,
        staffId: 'KITCH-ABC-001',
        role: UserRole.KITCHEN_STAFF,
        collegeId: 'ABC001',
      },
    }),
    // Super Admin
    prisma.user.create({
      data: {
        fullName: 'CanteenX Super Admin',
        email: 'admin@college.edu',
        mobileNumber: '+91 98765 99999',
        passwordHash: adminPasswordHash,
        role: UserRole.SUPER_ADMIN,
        collegeId: 'BCE001',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} demo users.`);

  // 4. Seed Food Items
  const foodItemsData = [
    // BCE001 Food Items
    {
      collegeId: 'BCE001',
      name: 'Crispy Masala Dosa',
      category: 'Breakfast',
      price: 40,
      availableQuantity: 25,
      preparationTime: 7,
      dietaryType: 'veg',
      popularity: 95,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Steamed Idli Vada Combo',
      category: 'Breakfast',
      price: 35,
      availableQuantity: 30,
      preparationTime: 3,
      dietaryType: 'veg',
      popularity: 90,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Spicy Potato Samosa (2 pcs)',
      category: 'Snacks',
      price: 20,
      availableQuantity: 40,
      preparationTime: 2,
      dietaryType: 'veg',
      popularity: 98,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Vegetable Hakka Noodles',
      category: 'Meals',
      price: 60,
      availableQuantity: 18,
      preparationTime: 9,
      dietaryType: 'veg',
      popularity: 88,
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Veg Fried Rice Bowl',
      category: 'Meals',
      price: 55,
      availableQuantity: 20,
      preparationTime: 8,
      dietaryType: 'veg',
      popularity: 86,
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Fresh Lemon Juice',
      category: 'Beverages',
      price: 15,
      availableQuantity: 50,
      preparationTime: 2,
      dietaryType: 'vegan',
      popularity: 92,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Special Masala Tea (Chai)',
      category: 'Beverages',
      price: 10,
      availableQuantity: 60,
      preparationTime: 2,
      dietaryType: 'veg',
      popularity: 99,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'BCE001',
      name: 'Filter Coffee',
      category: 'Beverages',
      price: 15,
      availableQuantity: 45,
      preparationTime: 2,
      dietaryType: 'veg',
      popularity: 94,
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },

    // ABC001 Food Items
    {
      collegeId: 'ABC001',
      name: 'Paneer Butter Masala Rice Bowl',
      category: 'Meals',
      price: 60,
      availableQuantity: 20,
      preparationTime: 7,
      dietaryType: 'veg',
      popularity: 92,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'ABC001',
      name: 'Crispy Veg Spring Rolls',
      category: 'Snacks',
      price: 25,
      availableQuantity: 30,
      preparationTime: 4,
      dietaryType: 'veg',
      popularity: 85,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'ABC001',
      name: 'Iced Lemon Tea',
      category: 'Beverages',
      price: 20,
      availableQuantity: 40,
      preparationTime: 2,
      dietaryType: 'vegan',
      popularity: 90,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },

    // XYZ001 Food Items
    {
      collegeId: 'XYZ001',
      name: 'Hyderabadi Veg Biryani',
      category: 'Meals',
      price: 65,
      availableQuantity: 25,
      preparationTime: 6,
      dietaryType: 'veg',
      popularity: 97,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
    {
      collegeId: 'XYZ001',
      name: 'Irani Chai with Bun Maska',
      category: 'Snacks',
      price: 25,
      availableQuantity: 35,
      preparationTime: 3,
      dietaryType: 'veg',
      popularity: 96,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
    },
  ];

  await prisma.foodItem.createMany({
    data: foodItemsData,
  });

  console.log(`✅ Created ${foodItemsData.length} demo food items.`);
  console.log('✨ CanteenX Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


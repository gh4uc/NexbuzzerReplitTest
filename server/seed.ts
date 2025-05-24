import { db } from './db';
import { users, wallets, modelProfiles, transactions, sql } from '@shared/schema';

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    const usersCount = await db.select({ count: sql`count(*)` }).from(users);
    
    // Only seed if database is empty
    if (Number(usersCount[0].count) > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }

    console.log('Seeding users...');
    
    // Create admin user
    const [admin] = await db.insert(users).values({
      username: "admin",
      password: "admin123",
      email: "admin@example.com",
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      gender: "other",
      age: 30,
      city: "San Francisco",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      createdAt: new Date()
    }).returning();
    
    // Create regular users
    const [user1] = await db.insert(users).values({
      username: "john",
      password: "password123",
      email: "john@example.com",
      role: "user",
      firstName: "John",
      lastName: "Doe",
      gender: "male",
      age: 28,
      city: "New York",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      createdAt: new Date()
    }).returning();
    
    const [user2] = await db.insert(users).values({
      username: "jane",
      password: "password123",
      email: "jane@example.com",
      role: "user",
      firstName: "Jane",
      lastName: "Smith",
      gender: "female",
      age: 25,
      city: "Los Angeles",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
      createdAt: new Date()
    }).returning();
    
    // Create model users
    const [model1] = await db.insert(users).values({
      username: "jessica",
      password: "password123",
      email: "jessica@example.com",
      role: "model",
      firstName: "Jessica",
      lastName: "Johnson",
      gender: "female",
      age: 27,
      city: "Miami",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
      createdAt: new Date()
    }).returning();
    
    const [model2] = await db.insert(users).values({
      username: "michael",
      password: "password123",
      email: "michael@example.com",
      role: "model",
      firstName: "Michael",
      lastName: "Brown",
      gender: "male",
      age: 30,
      city: "Chicago",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
      createdAt: new Date()
    }).returning();
    
    const [model3] = await db.insert(users).values({
      username: "samantha",
      password: "password123",
      email: "samantha@example.com",
      role: "model",
      firstName: "Samantha",
      lastName: "Wilson",
      gender: "female",
      age: 24,
      city: "Atlanta",
      country: "USA",
      profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
      createdAt: new Date()
    }).returning();

    console.log('Seeding wallets...');
    
    // Create wallets for users
    await db.insert(wallets).values({
      userId: user1.id,
      balance: 100,
      updatedAt: new Date()
    });
    
    await db.insert(wallets).values({
      userId: user2.id,
      balance: 50,
      updatedAt: new Date()
    });

    console.log('Seeding model profiles...');
    
    // Create model profiles
    await db.insert(modelProfiles).values({
      userId: model1.id,
      bio: "Professional model with 5 years of experience. I love connecting with fans and making new friends!",
      languages: ["English", "Spanish"],
      categories: ["Fitness", "Fashion", "Lifestyle"],
      offerVoiceCalls: true,
      offerVideoCalls: true,
      voiceRate: 3.99,
      videoRate: 7.99,
      isAvailable: true,
      isVerified: true,
      commissionRate: 0.7,
      payoutInfo: "Stripe account",
      profileImages: [
        "https://randomuser.me/api/portraits/women/33.jpg",
        "https://randomuser.me/api/portraits/women/43.jpg",
        "https://randomuser.me/api/portraits/women/53.jpg"
      ]
    });
    
    await db.insert(modelProfiles).values({
      userId: model2.id,
      bio: "Fitness enthusiast and personal trainer. Let's chat about wellness and healthy living!",
      languages: ["English"],
      categories: ["Fitness", "Health", "Nutrition"],
      offerVoiceCalls: true,
      offerVideoCalls: false,
      voiceRate: 4.49,
      videoRate: 0,
      isAvailable: false,
      isVerified: true,
      commissionRate: 0.7,
      payoutInfo: "PayPal",
      profileImages: [
        "https://randomuser.me/api/portraits/men/33.jpg",
        "https://randomuser.me/api/portraits/men/43.jpg"
      ]
    });
    
    await db.insert(modelProfiles).values({
      userId: model3.id,
      bio: "Actress and model based in Atlanta. I love chatting about movies, fashion, and traveling!",
      languages: ["English", "French"],
      categories: ["Entertainment", "Travel", "Fashion"],
      offerVoiceCalls: true,
      offerVideoCalls: true,
      voiceRate: 4.99,
      videoRate: 9.99,
      isAvailable: true,
      isVerified: true,
      commissionRate: 0.75,
      payoutInfo: "Bank transfer",
      profileImages: [
        "https://randomuser.me/api/portraits/women/34.jpg",
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/women/54.jpg",
        "https://randomuser.me/api/portraits/women/64.jpg"
      ]
    });

    console.log('Seeding transactions...');
    
    // Create transactions
    await db.insert(transactions).values({
      userId: user1.id,
      type: "deposit",
      amount: 100,
      status: "completed",
      description: "Initial deposit",
      createdAt: new Date()
    });
    
    await db.insert(transactions).values({
      userId: user2.id,
      type: "deposit",
      amount: 50,
      status: "completed",
      description: "Initial deposit",
      createdAt: new Date()
    });

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// This function is imported and called from index.ts
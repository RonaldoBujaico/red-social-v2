import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { UserProfile } from './entities/UserProfile';
import { hashPassword } from './utils/hash';

const runUpdate = async () => {
  try {
    console.log("Connecting to database...");
    await AppDataSource.initialize();
    console.log("Database connected!");

    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(UserProfile);

    // 1. Administrador
    const adminEmail = "admin@upn.pe";
    const existingAdmin = await userRepo.findOne({ 
      where: { email: adminEmail },
      relations: ["profile"]
    });
    
    if (existingAdmin) {
      console.log("🛡️ Found admin user in database. Resetting password and status...");
      existingAdmin.password = await hashPassword("admin123");
      existingAdmin.role = "admin";
      existingAdmin.isActive = true;
      existingAdmin.isBanned = false;
      await userRepo.save(existingAdmin);
      console.log("✅ Admin updated successfully (admin@upn.pe / admin123)!");
    } else {
      console.log("🌱 Admin user not found. Creating a new one...");
      const hashedPassword = await hashPassword("admin123");
      const adminUser = userRepo.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        isBanned: false
      });
      const adminProfile = profileRepo.create({
        username: "admin",
        firstName: "Administrador",
        lastName: "Sistema",
        birthDate: new Date("2000-01-01"),
        gender: "other",
        bio: "Administrador por defecto del sistema."
      });
      adminUser.profile = adminProfile;
      await userRepo.save(adminUser);
      console.log("✅ Admin user created successfully!");
    }

    // 2. Moderador
    const modEmail = "moderator@upn.pe";
    const existingMod = await userRepo.findOne({ 
      where: { email: modEmail },
      relations: ["profile"]
    });

    if (existingMod) {
      console.log("🛡️ Found moderator user in database. Resetting password and status...");
      existingMod.password = await hashPassword("moderator123");
      existingMod.role = "moderator";
      existingMod.isActive = true;
      existingMod.isBanned = false;
      await userRepo.save(existingMod);
      console.log("✅ Moderator updated successfully (moderator@upn.pe / moderator123)!");
    } else {
      console.log("🌱 Moderator user not found. Creating a new one...");
      const hashedPassword = await hashPassword("moderator123");
      const modUser = userRepo.create({
        email: modEmail,
        password: hashedPassword,
        role: "moderator",
        isActive: true,
        isBanned: false
      });
      const modProfile = profileRepo.create({
        username: "moderador",
        firstName: "Moderador",
        lastName: "Sistema",
        birthDate: new Date("2000-01-01"),
        gender: "other",
        bio: "Moderador por defecto del sistema."
      });
      modUser.profile = modProfile;
      await userRepo.save(modUser);
      console.log("✅ Moderator user created successfully!");
    }

  } catch (error) {
    console.error("❌ Operation failed:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed.");
    }
  }
};

runUpdate();

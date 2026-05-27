import dotenv from 'dotenv';
import "reflect-metadata";
import app from './app';
dotenv.config();
import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { UserProfile } from './entities/UserProfile';
import { hashPassword } from './utils/hash';

const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost";

const seedSystem = async () => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(UserProfile);

    // 1. Sembrar Administrador
    const adminEmail = "admin@upn.pe";
    const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      console.log("🌱 Admin no encontrado. Creando administrador por defecto...");
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
      console.log("✅ Administrador creado con éxito (admin@upn.pe / admin123)!");
    } else {
      console.log("🛡️ Administrador ya registrado en la base de datos.");
    }

    // 2. Sembrar Moderador
    const modEmail = "moderator@upn.pe";
    const existingMod = await userRepo.findOne({ where: { email: modEmail } });
    if (!existingMod) {
      console.log("🌱 Moderador no encontrado. Creando moderador por defecto...");
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
      console.log("✅ Moderador creado con éxito (moderator@upn.pe / moderator123)!");
    } else {
      console.log("🛡️ Moderador ya registrado en la base de datos.");
    }
  } catch (error) {
    console.error("❌ Error al sembrar los usuarios del sistema:", error);
  }
};

process.on("SIGINT", async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log("🔌 Conexión cerrada");
  }
  process.exit(0);
});

if (!AppDataSource.isInitialized) {
  AppDataSource.initialize()
    .then(async () => {
      console.log("📦 Base de datos conectada");
      
      // Sembrar usuarios del sistema por defecto
      await seedSystem();

      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en ${BACKEND_URL}:${PORT}`);
      });
    })
    .catch((error) => console.log("❌ Error DB:", error));
}
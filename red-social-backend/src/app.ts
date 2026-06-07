import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes"
import authRoutes from "./routes/auth.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { AppError } from "./errors/AppError";
import path from "path";
import notificationRoutes from "./routes/notification.routes";
import messageRoutes from "./routes/message.routes";
import userSettingsRoutes from "./routes/user-settings.routes";
import adminRoutes from "./routes/admin.routes";
import reportRoutes from "./routes/report.routes";
import chatbotRoutes from "./routes/chatbot.routes";

const app = express();
console.log("DB_HOST:", process.env.DB_HOST);
// app.use(cors({
//   origin: "*",
//   credentials: true
// }))

const isLocal = process.env.NODE_ENV === "local" || process.env.NODE_ENV === "development";
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      // Permitir cualquier puerto en localhost o 127.0.0.1 en local/desarrollo
      if (isLocal && (
        origin.startsWith("http://localhost:") || 
        origin.startsWith("http://127.0.0.1:") || 
        origin.startsWith("https://localhost:") || 
        origin.startsWith("https://127.0.0.1:")
      )) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);



app.use(express.json());

/*Con esto la iamgen se guardará en la carpeta post */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/notifications", notificationRoutes);
app.use("/messages", messageRoutes);
app.use("/user-settings", userSettingsRoutes);
app.use("/admin", adminRoutes);
app.use("/reports", reportRoutes);
app.use("/chatbot", chatbotRoutes);

app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

app.get("/error", (req, res, next) => {
  next(new AppError("Error de prueba", 500));
});

app.use(errorMiddleware);

export default app;

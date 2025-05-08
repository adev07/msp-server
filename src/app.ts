// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

// Debug logging
console.log("Environment variables loaded at app startup:", {
  OPENAI_API_KEY_PRESENT: !!process.env.OPENAI_API_KEY,
  OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
  NODE_ENV: process.env.NODE_ENV,
});

// Rest of imports
import express from "express";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { errorConverter, errorHandler } from "./middleware/error.js";
import cors from "cors";
import serverless from "serverless-http";

const app = express();

// (async () => {
//   await connectDB();
// })();

const allowedOrigins = [
  "http://localhost:3000",
  "https://msp-calculator-green.vercel.app",
  "https://instantmsppricing.com",
  "https://www.instantmsppricing.com",
  "https://mspcosts.com",
  "https://pricemyhelpdesk.com",
  "https://www.mymanagedservicepricing.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("🔍 Incoming origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.warn("⛔ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello from Vercel Express!");
});

// Mount routes without `/api` prefix — you're already in `/api` folder
app.use("/", routes);

app.use(errorConverter);
app.use(errorHandler);

const port = 4000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Do NOT call app.listen()
// Instead, export the handler
export const handler = serverless(app);
export default app;

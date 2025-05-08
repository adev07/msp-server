// api/index.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { errorConverter, errorHandler } from "./middleware/error.js";
import cors from "cors";
import serverless from "serverless-http";

dotenv.config();
const app = express();

// (async () => {
//   await connectDB();
// })();

const allowedOrigins = [
  "http://localhost:3000",
  "https://msp-calculator-green.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

app.use(express.json());

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

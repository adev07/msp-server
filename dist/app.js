"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// Load environment variables first
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Debug logging
console.log("Environment variables loaded at app startup:", {
    OPENAI_API_KEY_PRESENT: !!process.env.OPENAI_API_KEY,
    OPENAI_API_KEY_LENGTH: ((_a = process.env.OPENAI_API_KEY) === null || _a === void 0 ? void 0 : _a.length) || 0,
    NODE_ENV: process.env.NODE_ENV,
});
// Rest of imports
const express_1 = __importDefault(require("express"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_js_1 = require("./middleware/error.js");
const cors_1 = __importDefault(require("cors"));
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, express_1.default)();
// (async () => {
//   await connectDB();
// })();
const allowedOrigins = [
    "http://localhost:3000",
    "https://msp-calculator-green.vercel.app",
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", (0, cors_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello from Vercel Express!");
});
// Mount routes without `/api` prefix — you're already in `/api` folder
app.use("/", index_js_1.default);
app.use(error_js_1.errorConverter);
app.use(error_js_1.errorHandler);
const port = 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
// Do NOT call app.listen()
// Instead, export the handler
exports.handler = (0, serverless_http_1.default)(app);
exports.default = app;
//# sourceMappingURL=app.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
// api/index.js
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = __importDefault(require("./config/db.js"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const error_js_1 = require("./middleware/error.js");
const cors_1 = __importDefault(require("cors"));
const serverless_http_1 = __importDefault(require("serverless-http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_js_1.default)();
}))();
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
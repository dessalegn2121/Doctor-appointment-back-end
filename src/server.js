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
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User");
// Load local env only outside hosted production environments.
if (process.env.NODE_ENV !== "production" && !process.env.RENDER) {
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
}
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield (0, db_1.connectDB)();
    // Optional: create an admin account for local development.
    // Set ADMIN_EMAIL + ADMIN_PASSWORD in the backend `.env`.
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
        const existing = yield User_1.User.findOne({ email: adminEmail });
        if (!existing) {
            const hashed = yield bcryptjs_1.default.hash(adminPassword, 10);
            yield User_1.User.create({
                name: (_a = process.env.ADMIN_NAME) !== null && _a !== void 0 ? _a : "Hospital Admin",
                email: adminEmail,
                password: hashed,
                role: "admin",
            });
            console.log("Seeded admin user from env");
        }
    }
    app_1.default.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
start().catch((err) => {
    console.error("Failed to start server", err);
    process.exit(1);
});

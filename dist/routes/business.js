"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const business_1 = require("../controllers/business");
const auth_1 = require("../middleware/auth");
const validate_1 = __importDefault(require("../middleware/validate"));
const business_2 = require("../validators/business");
const router = express_1.default.Router();
router.post('/', (0, validate_1.default)(business_2.createBusinessValidator), business_1.createBusiness);
router.put('/:id', (0, validate_1.default)(business_2.updateBusinessValidator), business_1.updateBusiness);
router.get("/", auth_1.isAuthenticated, business_1.getAllBusiness);
router.get('/:id', business_1.getBusinessById);
router.delete('/:id', auth_1.isAuthenticated, business_1.deleteBusiness);
exports.default = router;
//# sourceMappingURL=business.js.map
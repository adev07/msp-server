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
exports.deleteBusiness = exports.getAllBusiness = exports.getBusinessById = exports.updateBusiness = exports.createBusiness = void 0;
const http_status_1 = __importDefault(require("http-status"));
const business_1 = __importDefault(require("../services/business"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.createBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newBusiness = yield business_1.default.createBusiness(req.body);
    res.status(http_status_1.default.CREATED).json({ newBusiness });
}));
exports.updateBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedBusiness = yield business_1.default.updateBusiness(req.params.id, req.body);
    res.status(http_status_1.default.OK).json({ updatedBusiness });
}));
exports.getBusinessById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const business = yield business_1.default.getBusinessById(req.params.id);
    res.status(http_status_1.default.OK).json({ business });
}));
exports.getAllBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businesses = yield business_1.default.getAllBusinessMetrics(req.user._id);
    res.status(http_status_1.default.OK).json({ businesses });
}));
exports.deleteBusiness = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deletedBusiness = yield business_1.default.deleteBusiness(req.params.id);
    res.status(http_status_1.default.OK).json({ deletedBusiness });
}));
//# sourceMappingURL=business.js.map
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
const http_status_1 = __importDefault(require("http-status"));
const models_1 = __importDefault(require("../models"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const business_1 = require("../helpers/business");
const createBusiness = (body) => __awaiter(void 0, void 0, void 0, function* () {
    // check existed business with same name
    if (body.user_id) {
        const existingBusiness = yield models_1.default.business.findOne({ business_name: body.business_name, user_id: body.user_id });
        if (existingBusiness) {
            throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Business name already exists');
        }
    }
    const business = yield models_1.default.business.create(body);
    return business;
});
const updateBusiness = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    const checkBusiness = yield models_1.default.business.findById(id);
    if (!checkBusiness) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Business not found');
    }
    const business = yield models_1.default.business.findByIdAndUpdate(id, {
        $set: body
    });
    return business;
});
const getBusinessById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const business = yield models_1.default.business.findById(id);
    if (!business) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Business not found');
    }
    const metrics = yield (0, business_1.calculateAllBusinessMetrics)(business);
    return { data: business, metrics };
});
const getAllBusinessMetrics = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    const businesses = yield models_1.default.business.find({ user_id });
    const metrics = yield Promise.all(businesses.map((business) => __awaiter(void 0, void 0, void 0, function* () {
        const metrics = yield (0, business_1.calculateAllBusinessMetrics)(business);
        return { data: business, metrics };
    })));
    return metrics;
});
const deleteBusiness = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const business = yield models_1.default.business.findByIdAndDelete(id);
    return business;
});
const businessService = {
    createBusiness,
    updateBusiness,
    getBusinessById,
    getAllBusinessMetrics,
    deleteBusiness
};
exports.default = businessService;
//# sourceMappingURL=business.js.map
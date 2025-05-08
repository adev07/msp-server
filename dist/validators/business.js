"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBusinessValidator = exports.createBusinessValidator = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createBusinessValidator = {
    body: joi_1.default.object().keys({
        user_id: joi_1.default.string(),
        business_name: joi_1.default.string().required(),
        business_listing_price: joi_1.default.number().required(),
        business_gross_revenue: joi_1.default.number().required(),
        business_cash_flow: joi_1.default.number().required(),
        business_notes: joi_1.default.string(),
        loan_sba_amount: joi_1.default.number().required(),
        loan_sba_rate: joi_1.default.number().required(),
        loan_sba_term: joi_1.default.number().required(),
        loan_seller_amount: joi_1.default.number().required(),
        loan_seller_rate: joi_1.default.number().required(),
        loan_seller_term: joi_1.default.number().required(),
        loan_down_payment: joi_1.default.number().required(),
        desired_owner_salary: joi_1.default.number().required(),
        additional_startup_capital: joi_1.default.number().required(),
        additional_capital_expenses: joi_1.default.number().required(),
        expected_annual_growth_rate: joi_1.default.number().required(),
    }),
};
exports.updateBusinessValidator = {
    body: joi_1.default.object().keys({
        business_name: joi_1.default.string(),
        business_listing_price: joi_1.default.number(),
        business_gross_revenue: joi_1.default.number(),
        business_cash_flow: joi_1.default.number(),
        business_notes: joi_1.default.string(),
        loan_sba_amount: joi_1.default.number(),
        loan_sba_rate: joi_1.default.number(),
        loan_sba_term: joi_1.default.number(),
        loan_seller_amount: joi_1.default.number(),
        loan_seller_rate: joi_1.default.number(),
        loan_seller_term: joi_1.default.number(),
        loan_down_payment: joi_1.default.number(),
        desired_owner_salary: joi_1.default.number(),
        additional_startup_capital: joi_1.default.number(),
        additional_capital_expenses: joi_1.default.number(),
        expected_annual_growth_rate: joi_1.default.number(),
    })
};
//# sourceMappingURL=business.js.map
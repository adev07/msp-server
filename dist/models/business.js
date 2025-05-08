"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const businessSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    business_name: { type: String, required: true },
    business_listing_price: { type: Number, required: true },
    business_gross_revenue: { type: Number, required: true },
    business_cash_flow: { type: Number, required: true },
    business_notes: { type: String },
    loan_sba_amount: { type: Number, required: true },
    loan_sba_rate: { type: Number, required: true },
    loan_sba_term: { type: Number, required: true },
    loan_seller_amount: { type: Number, required: true },
    loan_seller_rate: { type: Number, required: true },
    loan_seller_term: { type: Number, required: true },
    loan_down_payment: { type: Number, required: true },
    desired_owner_salary: { type: Number, required: true },
    additional_startup_capital: { type: Number, required: true },
    additional_capital_expenses: { type: Number, required: true },
    expected_annual_growth_rate: { type: Number, required: true }
});
exports.default = mongoose_1.default.model('Business', businessSchema);
//# sourceMappingURL=business.js.map
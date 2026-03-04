const { sequelize } = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const FinancialYear = require('./FinancialYear');
const Unit = require('./Unit');
const MainGroup = require('./MainGroup');
const Group = require('./Group');
const SubGroup = require('./SubGroup');
const Account = require('./Account');
const Buyer = require('./Buyer');
const ExportOrder = require('./ExportOrder');
const Invoice = require('./Invoice');
const Payment = require('./Payment');
const Voucher = require('./Voucher');
const VoucherEntry = require('./VoucherEntry');
const ProductionLine = require('./ProductionLine');
const ProductionOrder = require('./ProductionOrder');
const DailyProductionReport = require('./DailyProductionReport');
const WorkerAllocation = require('./WorkerAllocation');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderStyle = require('./PurchaseOrderStyle');

// Authentication Relationships
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// Chart of Accounts Relationships
MainGroup.hasMany(Group, { foreignKey: 'mainGroupId' });
Group.belongsTo(MainGroup, { foreignKey: 'mainGroupId' });

Group.hasMany(SubGroup, { foreignKey: 'groupId' });
SubGroup.belongsTo(Group, { foreignKey: 'groupId' });

SubGroup.hasMany(Account, { foreignKey: 'subGroupId' });
Account.belongsTo(SubGroup, { foreignKey: 'subGroupId' });

// Business Logic Relationships
Buyer.hasMany(ExportOrder, { foreignKey: 'buyerId' });
ExportOrder.belongsTo(Buyer, { foreignKey: 'buyerId' });

ExportOrder.belongsTo(Unit, { foreignKey: 'unitId' });
ExportOrder.belongsTo(FinancialYear, { foreignKey: 'financialYearId' });

ExportOrder.hasOne(Invoice, { foreignKey: 'exportOrderId' });
Invoice.belongsTo(ExportOrder, { foreignKey: 'exportOrderId' });

PurchaseOrder.hasOne(Invoice, { foreignKey: 'purchaseOrderId' });
Invoice.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

Invoice.hasMany(Payment, { foreignKey: 'invoiceId' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Payment.belongsTo(Account, { foreignKey: 'bankAccountId' });

// Accounting Logic Relationships
Voucher.belongsTo(FinancialYear, { foreignKey: 'financialYearId' });
Voucher.belongsTo(Unit, { foreignKey: 'unitId' });
Voucher.belongsTo(User, { foreignKey: 'createdBy' });

Voucher.hasMany(VoucherEntry, { foreignKey: 'voucherId', as: 'entries' });
VoucherEntry.belongsTo(Voucher, { foreignKey: 'voucherId' });

VoucherEntry.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasMany(VoucherEntry, { foreignKey: 'accountId' });

Invoice.belongsTo(Voucher, { foreignKey: 'voucherId', as: 'salesVoucher' });
Payment.belongsTo(Voucher, { foreignKey: 'voucherId', as: 'paymentVoucher' });

// Production Relationships
ProductionLine.belongsTo(Unit, { foreignKey: 'unitId' });
Unit.hasMany(ProductionLine, { foreignKey: 'unitId' });

ProductionOrder.belongsTo(ExportOrder, { foreignKey: 'exportOrderId' });
ExportOrder.hasMany(ProductionOrder, { foreignKey: 'exportOrderId' });

ProductionOrder.belongsTo(ProductionLine, { foreignKey: 'lineId' });
ProductionLine.hasMany(ProductionOrder, { foreignKey: 'lineId' });

DailyProductionReport.belongsTo(ProductionOrder, { foreignKey: 'productionOrderId' });
ProductionOrder.hasMany(DailyProductionReport, { foreignKey: 'productionOrderId' });

WorkerAllocation.belongsTo(ProductionLine, { foreignKey: 'lineId' });
ProductionLine.hasMany(WorkerAllocation, { foreignKey: 'lineId' });

// PO Management Relationships
PurchaseOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
PurchaseOrder.hasMany(PurchaseOrderStyle, { foreignKey: 'purchaseOrderId', as: 'styles' });
PurchaseOrderStyle.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

ProductionOrder.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });
PurchaseOrder.hasMany(ProductionOrder, { foreignKey: 'purchaseOrderId' });

const Organization = require('./Organization');

const db = {
    sequelize,
    User,
    Role,
    FinancialYear,
    Unit,
    Organization,
    MainGroup,
    Group,
    SubGroup,
    Account,
    Buyer,
    ExportOrder,
    Invoice,
    Payment,
    Voucher,
    VoucherEntry,
    ProductionLine,
    ProductionOrder,
    DailyProductionReport,
    WorkerAllocation,
    PurchaseOrder,
    PurchaseOrderStyle
};

module.exports = db;

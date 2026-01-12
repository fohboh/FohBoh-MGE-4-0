
import { RestaurantType, ModuleType, KPIFormula } from './types';

export const STANDARD_FORMULAS: KPIFormula[] = [
  {
    formulaId: "RR001",
    name: "Revenue Recovery from Open Checks",
    module: ModuleType.REVENUE_RECOVERY,
    expression: "(open_checks - closed_checks) * average_check",
    description: "Calculates potential lost revenue from POS check discrepancies",
    variables: ["open_checks", "closed_checks", "average_check"],
    restaurantType: RestaurantType.FSR,
    version: "1.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: false
  },
  {
    formulaId: "DR001",
    name: "Third-Party Delivery Variance",
    module: ModuleType.DELIVERY_RECON,
    expression: "pos_sales - (platform_sales - platform_fees - refunds - adjustments)",
    description: "Identifies discrepancies between POS, platform statements, and bank deposits",
    variables: ["pos_sales", "platform_sales", "platform_fees", "refunds", "adjustments"],
    restaurantType: RestaurantType.FSR,
    version: "1.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: false
  },
  {
    formulaId: "CA001",
    name: "Credit Card Fee Accuracy",
    module: ModuleType.CC_AUDIT,
    expression: "(sum(transaction_amounts) * expected_rate) - actual_fees",
    description: "Audits credit card processing fees against agreed rates",
    variables: ["transaction_amounts", "expected_rate", "actual_fees"],
    restaurantType: RestaurantType.FSR,
    version: "1.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: false
  },
  {
    formulaId: "OC001",
    name: "Food Cost Percentage",
    module: ModuleType.OPERATING_COSTS,
    expression: "(beginning_inv + purchases - ending_inv) / food_sales * 100",
    description: "Standard food cost calculation with inventory adjustment",
    variables: ["beginning_inv", "purchases", "ending_inv", "food_sales"],
    restaurantType: RestaurantType.FSR,
    version: "1.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: false
  }
];

export const CSV_TEMPLATES = {
  [ModuleType.REVENUE_RECOVERY]: "open_checks,closed_checks,average_check\n150,140,28.50\n200,185,32.00",
  [ModuleType.DELIVERY_RECON]: "date,platform,pos_sales,platform_sales,bank_deposit,platform_fees,refunds,adjustments\n2024-01-15,UberEats,1250.00,875.00,831.25,262.50,12.50,8.75\n2024-01-15,DoorDash,980.00,686.00,657.86,205.80,9.80,13.34",
  [ModuleType.CC_AUDIT]: "transaction_id,transaction_date,card_type,amount,pos_amount,processor_fee,interchange_rate,batch_id\nTX-001,2024-01-15,Visa,85.50,85.50,2.14,2.50%,BATCH-0123\nTX-002,2024-01-15,Amex,42.75,42.75,1.71,4.00%,BATCH-0123",
  [ModuleType.OPERATING_COSTS]: "location,date,beginning_inventory,purchases,ending_inventory,food_sales,employee_meals,waste\nDowntown,2024-W02,18500.00,32500.00,16500.00,12500.00,250.00,180.00\nUptown,2024-W02,14200.00,28500.00,13800.00,9800.00,195.00,205.00"
};

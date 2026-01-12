
import { RestaurantType, ModuleType, KPIFormula } from './types';

export const STANDARD_FORMULAS: KPIFormula[] = [
  // CATEGORY 1: FINANCIAL PROFITABILITY (OPERATIONS CERTIFICATION CORE)
  {
    formulaId: "OPS_FOOD_001",
    name: "Food Cost (Certified)",
    module: ModuleType.OPERATIONS_CERTIFICATION,
    expression: "(V_FOOD_BEGINNING + V_FOOD_PURCHASES + V_FOOD_TRANS_IN - V_FOOD_TRANS_OUT - V_FOOD_ENDING - V_FOOD_EMP_MEALS)",
    description: "Deterministic food usage cost excluding transfers and employee benefits.",
    variables: [
      "V_FOOD_BEGINNING_INVENTORY",
      "V_FOOD_PURCHASES",
      "V_FOOD_ENDING_INVENTORY",
      "V_FOOD_TRANSFERS_IN",
      "V_FOOD_TRANSFERS_OUT",
      "V_FOOD_EMPLOYEE_MEALS"
    ],
    restaurantType: RestaurantType.FSR,
    version: "4.0.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Transfers must be balanced across locations",
      "Employee meals must be valued at standard cost",
      "Beginning inventory must match prior period ending"
    ],
    trustScoreComponents: {
      "inventory_freshness": 40,
      "transfer_alignment": 30,
      "purchase_completeness": 30
    }
  },
  {
    formulaId: "OPS_BEV_001",
    name: "Beverage Cost (Certified)",
    module: ModuleType.OPERATIONS_CERTIFICATION,
    expression: "(V_BEV_BEGINNING + V_BEV_PURCHASES + V_BEV_TRANS_IN - V_BEV_TRANS_OUT - V_BEV_ENDING)",
    description: "Actual pour cost based on physical inventory movement.",
    variables: [
      "V_BEV_BEGINNING_INVENTORY",
      "V_BEV_PURCHASES",
      "V_BEV_ENDING_INVENTORY",
      "V_BEV_TRANSFERS_IN",
      "V_BEV_TRANSFERS_OUT"
    ],
    restaurantType: RestaurantType.FSR,
    version: "4.0.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Spillage must be tracked but is included in COGS unless reclassified",
      "Promo drinks must be accounted for at cost"
    ]
  },
  {
    formulaId: "OPS_PRIME_001",
    name: "Prime Cost Percentage",
    module: ModuleType.OPERATIONS_CERTIFICATION,
    expression: "(V_TOTAL_FOOD_COST + V_TOTAL_BEV_COST + V_LABOR_HOURLY + V_LABOR_SALARY) / V_NET_SALES",
    description: "The primary health metric for restaurant operations.",
    variables: [
      "V_TOTAL_FOOD_COST",
      "V_TOTAL_BEV_COST",
      "V_LABOR_HOURLY_WAGES",
      "V_LABOR_SALARY_ALLOCATION",
      "V_NET_SALES"
    ],
    restaurantType: RestaurantType.FSR,
    version: "4.0.0",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    targetRanges: { "Optimal": "55-65%", "Warning": "> 68%" }
  },
  // CATEGORY 2: OPERATIONAL EFFICIENCY
  {
    formulaId: "TABLE_TURNOVER_RATE",
    name: "Table Turnover Rate",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Number_of_Guests_Served / (Number_of_Tables * Meals_per_Day)",
    description: "Speed at which tables are cycled through guests.",
    variables: ["Number_of_Guests_Served", "Number_of_Tables", "Meals_per_Day"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true
  },
  {
    formulaId: "REVPASH",
    name: "RevPASH",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Total_Revenue / (Number_of_Seats * Hours_Open)",
    description: "Revenue Per Available Seat Hour.",
    variables: ["Total_Revenue", "Number_of_Seats", "Hours_Open"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true
  },
  // CATEGORY 3: INVENTORY & WASTE
  {
    formulaId: "FOOD_WASTE_PCT",
    name: "Food Waste Percentage",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(Cost_of_Waste / Total_Food_COGS) * 100",
    description: "Percentage of food cost attributed to waste.",
    variables: ["Cost_of_Waste", "Total_Food_COGS"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true
  },
  // CATEGORY 4: LABOR & STAFF
  {
    formulaId: "SPLH",
    name: "Sales Per Labor Hour",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Net_Sales / Total_Labor_Hours",
    description: "Measure of labor efficiency and productivity.",
    variables: ["Net_Sales", "Total_Labor_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true
  }
];

export const CSV_TEMPLATES = {
  [ModuleType.FINANCIAL_PROFITABILITY]: "Beginning_Inventory,Purchases,Ending_Inventory,Food_Sales,Total_Sales\n15000,45000,12000,145000,200000",
  [ModuleType.OPERATIONAL_EFFICIENCY]: "Number_of_Guests,Number_of_Tables,Hours_Open,Total_Revenue\n450,40,12,18500",
  [ModuleType.INVENTORY_WASTE]: "Cost_of_Waste,Total_Food_COGS,Physical_Count,System_Count\n850,22000,12500,12450",
  [ModuleType.LABOR_PRODUCTIVITY]: "Net_Sales,Total_Labor_Hours,Scheduled_Worked,Total_Scheduled\n12500,180,175,180",
  [ModuleType.SERVICE_QUALITY]: "Accurate_Orders,Total_Orders,Seated_Time,Check_Time\n440,450,18:05,19:15",
  [ModuleType.REVENUE_RECOVERY]: "date,opened,closed,avg,voids,unauthorized_comps\n2024-01-15,150,140,28.50,5,2",
  [ModuleType.DELIVERY_RECON]: "date,pos_delivery_sales,platform_gross_sales,delivery_partner_fees,platform_fees\n2024-01-15,1250.00,1280.00,262.50,15.00",
  [ModuleType.OPERATIONS_CERTIFICATION]: "V_FOOD_SALES,V_FOOD_PURCHASES,V_FOOD_BEGINNING_INVENTORY,V_FOOD_ENDING_INVENTORY,V_LABOR_HOURLY_WAGES\n45000,12000,8500,9200,14500"
};

export const GLOSSARY_LOGIC = [
  { id: 'v_food', title: 'Food Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_FOOD_MODULE_INPUTS', desc: 'Standardized inputs for COGS logic including transfers and employee meals.' },
  { id: 'v_bev', title: 'Bev Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_BEV_MODULE_INPUTS', desc: 'Standardized inputs for Beverage cost including spills and promo drinks.' },
  { id: 'v_prime', title: 'Prime Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_PRIME_MODULE_INPUTS', desc: 'High-level aggregation of Food, Bev, and Labor costs relative to Net Sales.' },
  { id: 'drift', title: 'Drift', category: 'LOGIC VARIANCE', formula: 'Expected Truth - Observed Truth', desc: 'Primary indicator of leakage. Positive drift suggests uncaptured revenue or inventory loss.' },
  { id: 'net_yield', title: 'Net Yield', category: 'EFFECTIVE MARGIN', formula: 'Platform Gross - (Fees + Comm + Promos)', desc: "Isolates cash value of a 3rd party order." }
];

export const PIPELINE_STAGES = [
  { stage: 'STAGE 1', title: 'Raw Truth Capture', desc: 'Immutable data ingestion (POS, Bank, Payroll) preserved without mutation.' },
  { stage: 'STAGE 2', title: 'Semantic Alignment', desc: 'Mapping raw fields (e.g., "Food Purchases") to Canonical Variables like V_FOOD_PURCHASES.' },
  { stage: 'STAGE 3', title: 'Trust Score Execution', desc: 'Running freshness, completeness, and validity checks on all Layer 1 variables.' },
  { stage: 'STAGE 4', title: 'Certification & Storage', desc: 'Storing deterministic results in the Certified Metrics Store served via API.' }
];

export const BLUEPRINT_CARDS = [
  {
    id: 'food_prime',
    title: 'FOOD COST MODULE',
    formula: 'Cost = (Beg + Purch + TransIn) - (TransOut + End + Emp)',
    headers: 'V_FOOD_BEGINNING, V_FOOD_PURCHASES, V_FOOD_ENDING, V_FOOD_SALES',
    note: 'Deterministic logic for certifying Food COGS accuracy.'
  },
  {
    id: 'bev_pour',
    title: 'BEV COST MODULE',
    formula: 'Cost = (Beg + Purch + TransIn) - (TransOut + End)',
    headers: 'V_BEV_BEGINNING, V_BEV_PURCHASES, V_BEV_ENDING, V_BEV_SALES',
    note: 'Bar cost logic isolating shrinkage from pour accuracy.'
  },
  {
    id: 'prime_cert',
    title: 'PRIME COST MODULE',
    formula: 'Prime % = (Food + Bev + Labor) / Sales',
    headers: 'V_TOTAL_FOOD_COST, V_TOTAL_BEV_COST, V_LABOR_HOURLY, V_NET_SALES',
    note: 'The ultimate health anchor for restaurant P&L certification.'
  }
];

export const FAQ_DATA = [
  {
    question: "What is the FohBoh MGE?",
    answer: "The FohBoh MGE is a metrics governance and certification layer built specifically for restaurants and hospitality. It acts as a trusted data layer between your operational systems and your intelligence systems, ensuring that every number you see is accurate, consistent, and trustworthy."
  }
];


import { RestaurantType, ModuleType, KPIFormula } from './types';

const NOW = new Date().toISOString();

export const STANDARD_FORMULAS: KPIFormula[] = [
  // CATEGORY 1: FINANCIAL PROFITABILITY (10 KPIs)
  {
    formulaId: "COGS_TOTAL",
    name: "Cost of Goods Sold (COGS)",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "Beginning_Inventory + Purchases - Ending_Inventory",
    description: "The direct costs of producing the goods sold by a business.",
    variables: ["Beginning_Inventory", "Purchases", "Ending_Inventory"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    governanceRules: [
      "Beginning inventory must be from certified period-end count",
      "Purchases must be from AP/ERP system with matched invoices",
      "Ending inventory must be physical count, not estimated",
      "Employee meals must be reclassified from COGS to Labor",
      "Waste must be tracked separately and excluded"
    ],
    trustScoreComponents: {
      "inventory_counts_complete": 40,
      "purchase_data_aligned": 30,
      "employee_meals_reclassified": 20,
      "waste_properly_tracked": 10
    },
    enrichment: {
      what: "Total cost of raw materials used in sales.",
      why: "Primary driver of gross margin and profitability.",
      how: "Verify AP invoices match receiving logs and physical counts.",
      fix: "Tighten receiving procedures and audit waste logs."
    }
  },
  {
    formulaId: "FOOD_COST_PCT",
    name: "Food Cost Percentage",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "(Food_COGS / Total_Food_Sales) * 100",
    description: "The percentage of food sales that went towards the cost of food.",
    variables: ["Food_COGS", "Total_Food_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    governanceRules: [
      "Exclude beverage, labor, and overhead",
      "Sales must be net of voids but before discounts",
      "Comp meals must be included in denominator at full price"
    ],
    targetRanges: { "QSR": "25-32%", "FSR": "28-35%", "Fine_Dining": "30-38%" },
    validationLogic: [
      "IF < 15%: FLAG as potential theft",
      "IF > 40%: FLAG as waste issue"
    ],
    enrichment: {
      what: "Ratio of food costs to food sales.",
      why: "Key indicator of menu pricing and prep efficiency.",
      how: "Compare theoretical usage (recipe) vs actual inventory usage.",
      fix: "Standardize recipes and portion sizes."
    }
  },
  {
    formulaId: "PRIME_COST_TOTAL",
    name: "Prime Cost",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "Food_COGS + Labor_Cost_Total",
    description: "Sum of food costs and labor costs.",
    variables: ["Food_COGS", "Labor_Cost_Total"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    governanceRules: [
      "Labor includes taxes, benefits, and meals",
      "Manager salaries must be prorated by operational time"
    ],
    enrichment: {
      what: "Total of controllable costs (Food + Labor).",
      why: "Most critical indicator of operational health.",
      how: "Aggregate certified COGS and payroll data.",
      fix: "Reduce overtime or renegotiate vendor contracts."
    }
  },
  {
    formulaId: "PRIME_COST_PCT",
    name: "Prime Cost Percentage",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "((Food_COGS + Labor_Cost_Total) / Total_Sales) * 100",
    description: "Prime cost as a percentage of total sales.",
    variables: ["Food_COGS", "Labor_Cost_Total", "Total_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    targetRanges: { "Target": "< 60%", "Critical": "> 68%" },
    enrichment: {
      what: "The percentage of sales consumed by food and labor.",
      why: "High Prime Cost leaves no room for fixed costs or profit.",
      how: "Divide combined COGS/Labor by net sales.",
      fix: "Adjust labor schedules or re-engineer low-margin items."
    }
  },

  // CATEGORY: CREDIT CARD AUDIT (NEW MODULE 7)
  {
    formulaId: "CC_EFFECTIVE_RATE",
    name: "Effective Merchant Rate",
    module: ModuleType.CC_AUDIT,
    expression: "(Total_Fees / Total_Volume) * 100",
    description: "The primary benchmark for processor transparency and total cost of acceptance.",
    variables: ["Total_Fees", "Total_Volume"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    targetRanges: { "Industry Benchmark": "3.0% - 3.5%", "High Risk": "> 4.0%" },
    governanceRules: [
      "Junk Fee Signal: Trigger flag if rate > 4.0%",
      "Tolerance: Must match statement within 0.01%"
    ],
    enrichment: {
      what: "Total blended cost of card acceptance.",
      why: "High rates often hide junk fees or contract non-compliance.",
      how: "Divide total statement fees by total gross volume.",
      fix: "Negotiate tiered minimums or switch to interchange-plus pricing."
    }
  },
  {
    formulaId: "CC_MARKUP_AUDIT",
    name: "Markup Audit (bps)",
    module: ModuleType.CC_AUDIT,
    expression: "((Total_Fees - Interchange_Estimate) / Total_Volume) * 10000",
    description: "Isolates the processor's actual spread over interchange costs.",
    variables: ["Total_Fees", "Interchange_Estimate", "Total_Volume"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    governanceRules: [
      "Rate Creep Detection: Flags markup exceeding contracted bps",
      "Tolerance: +/- 1 bps deviation from agreement"
    ],
    enrichment: {
      what: "The profit margin kept by your processor.",
      why: "Processors 'creep' this rate up over time without notice.",
      how: "Analyze fee decomposition layers 1 and 2.",
      fix: "Send demand letter for recovery if deviation exceeds contract."
    }
  },
  {
    formulaId: "DURBIN_RECOVERY",
    name: "Durbin Compliance Gap",
    module: ModuleType.CC_AUDIT,
    expression: "Actual_Debit_Fees - ((Debit_Volume * 0.0005) + (Debit_Count * 0.23))",
    description: "Calculates overcharges on regulated debit transactions.",
    variables: ["Actual_Debit_Fees", "Debit_Volume", "Debit_Count"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Recovery from regulated debit cap violations.",
      why: "Durbin Amendment caps debit at $0.22 + 0.05% + $0.01 fraud.",
      how: "Compare line-item debit fees to federal caps.",
      fix: "Request detailed debit transaction report from processor."
    }
  },

  // CATEGORY 2: OPERATIONAL & SALES EFFICIENCY (10 KPIs)
  {
    formulaId: "TABLE_TURNOVER_RATE",
    name: "Table Turnover Rate",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Number_of_Guests_Served / (Number_of_Tables * Meals_per_Day)",
    description: "How many times a table is occupied during a shift.",
    variables: ["Number_of_Guests_Served", "Number_of_Tables", "Meals_per_Day"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Speed of guest cycling.",
      why: "Higher turnover maximizes limited seating during peak hours.",
      how: "Total guests divided by table capacity and day parts.",
      fix: "Improve bussing speed and kitchen ticket times."
    }
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
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Seat productivity metric.",
      why: "Accounts for both seat count and time, exposing 'dead' hours.",
      how: "Sales divided by total available seat-hours.",
      fix: "Use happy hour or marketing to fill seats in off-peak times."
    }
  },
  {
    formulaId: "AVERAGE_CHECK_SIZE",
    name: "Average Check Size",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Total_Sales / Number_of_Checks",
    description: "The average amount spent per guest order.",
    variables: ["Total_Sales", "Number_of_Checks"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Average guest spend.",
      why: "Indicates server effectiveness and guest value.",
      how: "Net sales divided by guest check count.",
      fix: "Train staff in suggestive selling and pairing."
    }
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
  [ModuleType.OPERATIONS_CERTIFICATION]: "V_FOOD_SALES,V_FOOD_PURCHASES,V_FOOD_BEGINNING_INVENTORY,V_FOOD_ENDING_INVENTORY,V_LABOR_HOURLY_WAGES\n45000,12000,8500,9200,14500",
  [ModuleType.CC_AUDIT]: "total_card_volume,total_fees_charged,debit_volume,debit_count,contracted_markup_bps\n150000,5800,45000,900,10"
};

export const GLOSSARY_LOGIC = [
  { id: 'v_cc_markup', title: 'Markup Drift', category: 'CONTRACT COMPLIANCE', formula: 'Actual BPS - Contracted BPS', desc: 'Measures "Rate Creep" where processors inflate margins silently over time.' },
  { id: 'durbin_cap', title: 'Durbin Regulation Cap', category: 'REGULATORY', formula: '$0.22 + 0.05% + $0.01', desc: 'Federal maximum allowed fees for regulated debit card transactions.' },
  { id: 'junk_signal', title: 'Junk Fee Signal', category: 'AUDIT LOGIC', formula: 'Effective Rate > 4.0%', desc: 'Deterministic trigger identifying non-standard FSR fee profiles.' },
  { id: 'v_food', title: 'Food Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_FOOD_MODULE_INPUTS', desc: 'Standardized inputs for COGS logic including transfers and employee meals.' },
  { id: 'v_bev', title: 'Bev Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_BEV_MODULE_INPUTS', desc: 'Standardized inputs for Beverage cost including spills and promo drinks.' },
  { id: 'v_prime', title: 'Prime Cost Variable Set', category: 'SEMANTIC CORE', formula: 'MGE_PRIME_MODULE_INPUTS', desc: 'High-level aggregation of Food, Bev, and Labor costs relative to Net Sales.' }
];

export const PIPELINE_STAGES = [
  { stage: 'STAGE 1', title: 'Statement Normalization', desc: 'Raw PDF/CSV → Standardized Transaction Objects with Interchange Code Mapping.' },
  { stage: 'STAGE 2', title: 'Contract Compliance', desc: 'Rate Matrix Validation and Tier Qualification Auditing against signed terms.' },
  { stage: 'STAGE 3', title: 'Regulatory Audit', desc: 'Durbin Amendment Compliance and PCI Fee legitimacy verification.' },
  { stage: 'STAGE 4', title: 'Actionable Recovery', desc: 'Generation of Waterfall Reconciliation Ledgers and Processor demand letters.' }
];

export const BLUEPRINT_CARDS = [
  {
    id: 'cc_audit_engine',
    title: 'CC AUDIT ENGINE',
    formula: 'Overcharge = (Charged - Max_Allowed) × Volume',
    headers: 'total_card_volume, total_fees, debit_volume, contracted_markup',
    note: 'Deterministic logic for identifying Merchant Fee leakage.'
  },
  {
    id: 'food_prime',
    title: 'FOOD COST MODULE',
    formula: 'Cost = (Beg + Purch + TransIn) - (TransOut + End + Emp)',
    headers: 'V_FOOD_BEGINNING, V_FOOD_PURCHASES, V_FOOD_ENDING, V_FOOD_SALES',
    note: 'Deterministic logic for certifying Food COGS accuracy.'
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
    question: "What is Durbin Amendment Compliance?",
    answer: "The Durbin Amendment (part of the Dodd-Frank Act) caps the interchange fees that large banks (>$10B assets) can charge for debit card transactions. Many processors fail to pass these savings to restaurants, resulting in significant overcharges that the MGE identifies."
  },
  {
    question: "What is Rate Creep?",
    answer: "Rate Creep is the subtle, often unannounced increase in processor markups over months or years. Our Contract Compliance engine detects any deviation from your signed contract terms, even as small as 1 basis point."
  }
];

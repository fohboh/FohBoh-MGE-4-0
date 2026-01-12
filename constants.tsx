
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
      fix: "Improve bussing speed and floor management."
    }
  }
];

// Re-added missing CSV templates exported to App.tsx
export const CSV_TEMPLATES = [
  { name: 'Food Inventory Export', headers: 'V_FOOD_BEGINNING_INVENTORY,V_FOOD_PURCHASES,V_FOOD_ENDING_INVENTORY,V_FOOD_SALES' },
  { name: 'Labor Payroll Import', headers: 'V_LABOR_HOURLY_WAGES,V_LABOR_SALARY_ALLOCATION,V_NET_SALES' }
];

// Re-added missing FAQ data exported to App.tsx
export const FAQ_DATA = [
  {
    question: "What is the Truth Table Engine?",
    answer: "It's our deterministic logic engine that processes raw operational data through certified KPI formulas to find variances and recoverable revenue."
  },
  {
    question: "How is Found Money calculated?",
    answer: "Found Money is the absolute variance between actual costs/fees and theoretical or contracted benchmarks (e.g., CC markup overages)."
  },
  {
    question: "What does Certification Rate mean?",
    answer: "It measures the percentage of your metrics that have passed through the forensic audit layer and have been locked into the Truth Vault."
  }
];

// Re-added missing Blueprint cards exported to App.tsx
export const BLUEPRINT_CARDS = [
  {
    id: 'FOOD_COST_BLUEPRINT',
    title: 'Food Cost Certification',
    formula: '((Beg + Purch - End) / Sales) * 100',
    note: 'Requires weekly physical counts for high-trust scoring.',
    headers: 'V_FOOD_BEGINNING_INVENTORY, V_FOOD_PURCHASES, V_FOOD_ENDING_INVENTORY, V_FOOD_SALES'
  },
  {
    id: 'CC_AUDIT_BLUEPRINT',
    title: 'Merchant Fee Recovery',
    formula: 'Total_Fees - (Volume * Contract_Bps) - Interchange',
    note: 'Flags junk fees and non-compliant markup creep.',
    headers: 'Total_Volume, Total_Fees, Contracted_Markup_Bps, Debit_Volume, Debit_Count'
  }
];

// Re-added missing Glossary logic exported to App.tsx
export const GLOSSARY_LOGIC = [
  {
    id: 'DURBIN_CAP',
    title: 'Durbin Amendment Cap',
    category: 'RECOVERY',
    formula: '$0.22 + 0.05% + $0.01',
    desc: 'The federal limit on debit interchange for regulated banks.'
  },
  {
    id: 'PRIME_COST',
    title: 'Prime Cost',
    category: 'EFFICIENCY',
    formula: 'COGS + Labor',
    desc: 'The total of all controllable operational costs.'
  }
];

// Re-added missing Pipeline stages exported to App.tsx
export const PIPELINE_STAGES = [
  {
    stage: 'DATA_INGESTION',
    title: 'Raw Data Layer',
    desc: 'Initial ingestion of POS, AP, and bank statement data.'
  },
  {
    stage: 'LOGIC_MAPPING',
    title: 'Deterministic Mapping',
    desc: 'Mapping raw fields to certified MGE variables.'
  },
  {
    stage: 'CERTIFICATION',
    title: 'Forensic Audit',
    desc: 'Final validation and locking of results into the Truth Vault.'
  }
];


import { RestaurantType, ModuleType, KPIFormula } from './types';

export const STANDARD_FORMULAS: KPIFormula[] = [
  // CATEGORY 1: FINANCIAL PROFITABILITY
  {
    formulaId: "COGS_TOTAL",
    name: "Cost of Goods Sold (COGS)",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "Beginning_Inventory + Purchases - Ending_Inventory",
    description: "Total cost of inventory used during the period.",
    variables: ["Beginning_Inventory", "Purchases", "Ending_Inventory"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
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
    }
  },
  {
    formulaId: "FOOD_COST_PCT",
    name: "Food Cost Percentage",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "(Food_COGS / Total_Food_Sales) * 100",
    description: "Percentage of food sales consumed by food inventory costs.",
    variables: ["Food_COGS", "Total_Food_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Food_COGS must exclude beverage, labor, and overhead",
      "Total_Food_Sales must exclude beverage, tax, and discounts",
      "Comp meals must be included in denominator at full price",
      "Employee meals must use standard cost, not zero"
    ],
    targetRanges: { "QSR": "25-32%", "FSR": "28-35%", "Fine_Dining": "30-38%" },
    validationLogic: ["IF < 15%: Potential theft", "IF > 40%: Waste issue"]
  },
  {
    formulaId: "PRIME_COST_PCT",
    name: "Prime Cost Percentage",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "((Food_COGS + Labor_Cost_Total) / Total_Sales) * 100",
    description: "Combined cost of goods and labor relative to total sales.",
    variables: ["Food_COGS", "Labor_Cost_Total", "Total_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Labor must include taxes, benefits, meals, and uniform",
      "Manager salaries must be prorated by % time in operations",
      "Overtime must be included at actual rate, not base"
    ],
    targetRanges: { "All": "< 60% (Optimal)" }
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
    isApproved: true,
    governanceRules: [
      "Calculate separately for lunch and dinner service",
      "Bar seats must be excluded from table count",
      "Private dining rooms must be calculated separately"
    ]
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
    isApproved: true,
    governanceRules: [
      "Seat count must be actual, not theoretical",
      "Hours open must be operational hours, not posted hours"
    ]
  },
  {
    formulaId: "AVERAGE_CHECK_SIZE",
    name: "Average Check Size",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Total_Sales / Number_of_Checks",
    description: "The average amount spent per transaction.",
    variables: ["Total_Sales", "Number_of_Checks"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Calculate separately for dine-in, takeout, delivery",
      "Exclude comps and voids from check count"
    ]
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
    isApproved: true,
    governanceRules: [
      "Waste must be weighed, not estimated",
      "Employee meals must be excluded from waste",
      "Categories: Prep, Spoilage, Plate, Overproduction"
    ],
    targetRanges: { "Total_Waste": "< 6% of food cost" }
  },
  {
    formulaId: "INVENTORY_ACCURACY",
    name: "Inventory Accuracy Rate",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(1 - (|Counted - System| / System)) * 100",
    description: "Precision of physical counts vs. system expectations.",
    variables: ["Counted", "System"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Physical counts must be blind",
      "Variance tolerance: $0.10 per line item",
      "Root cause must be identified for variances > tolerance"
    ]
  },
  {
    formulaId: "RECIPE_COST_COMPLIANCE",
    name: "Recipe Cost Compliance",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(Actual_Recipe_Cost / Standard_Recipe_Cost) * 100",
    description: "Audit of actual ingredient prices vs. standard recipe costs.",
    variables: ["Actual_Recipe_Cost", "Standard_Recipe_Cost"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Standard cost must be updated with each price change",
      "Actual cost must use actual purchase prices",
      "Substitutions must be tracked and cost-adjusted"
    ]
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
    isApproved: true,
    governanceRules: [
      "Net sales = Gross sales - discounts - comps",
      "Labor hours = productive hours (exclude breaks, training)"
    ],
    targetRanges: { "Server": "$45-$65/hr", "Cook": "$35-$50/hr" }
  },
  {
    formulaId: "SCHEDULE_ADHERENCE",
    name: "Schedule Adherence Rate",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "(Scheduled_Hours_Worked / Total_Scheduled_Hours) * 100",
    description: "Compliance with planned staff schedules.",
    variables: ["Scheduled_Hours_Worked", "Total_Scheduled_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Track: Late arrivals, early departures, no-shows",
      "Calculate by position and individual"
    ],
    targetRanges: { "Excellent": "> 95%" }
  },
  // CATEGORY 5: SERVICE QUALITY
  {
    formulaId: "ORDER_ACCURACY",
    name: "Order Accuracy Rate",
    module: ModuleType.SERVICE_QUALITY,
    expression: "(Accurate_Orders / Total_Orders) * 100",
    description: "Percentage of orders served exactly as requested.",
    variables: ["Accurate_Orders", "Total_Orders"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Accurate defined: Correct items, mod, temp, timing",
      "Errors categorized: Wrong item, mod, temp, late"
    ],
    targetRanges: { "Dine_in": "> 98%", "Delivery": "> 97%" }
  },
  {
    formulaId: "SPEED_OF_SERVICE",
    name: "Speed of Service",
    module: ModuleType.SERVICE_QUALITY,
    expression: "Average_Time_Seated_to_Check_Presented",
    description: "Total guest cycle time in minutes.",
    variables: ["Average_Time_Seated_to_Check_Presented"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "system",
    createdAt: new Date().toISOString(),
    isApproved: true,
    governanceRules: [
      "Service stages: Greet, Order, Food, Check, Payment",
      "Bottleneck analysis: Longest stage time"
    ],
    targetRanges: { "Lunch": "60 min", "Dinner": "90 min" }
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
  { id: 'drift', title: 'Drift', category: 'LOGIC VARIANCE', formula: 'Expected Truth - Observed Truth', desc: 'Primary indicator of leakage. Positive drift suggests uncaptured revenue or inventory loss.' },
  { id: 'net_yield', title: 'Net Yield', category: 'EFFECTIVE MARGIN', formula: 'Platform Gross - (Fees + Comm + Promos)', desc: "Isolates cash value of a 3rd party order. Identifies 'Commercial Wedge' erosion." },
  { id: 'revpash', title: 'RevPASH', category: 'REV / SEAT HOUR', formula: 'Total Rev / (Seats * Hours)', desc: "Identifies 'cold seats' and dead zones. Essential for table-turn yield strategy." },
  { id: 'theo_cogs', title: 'Theo COGS', category: 'THEORETICAL USAGE', formula: 'SUM(Menu_Sales * Recipe_Cost)', desc: 'Perfect world cost. Delta indicates kitchen waste, theft, or portioning issues.' },
  { id: 'pattern_a', title: 'Pattern A', category: 'PHANTOM CHECKS', formula: 'Checks Opened - Checks Settled', desc: "Transaction-level leakage where checks remain 'pending' indefinitely." },
  { id: 'prime_cost', title: 'Prime Cost', category: 'MASTER HEALTH', formula: '(Food Cost + Labor) / Sales', desc: 'Industry standard for P&L health. Target is typically < 65%.' },
  { id: 'settlement_net', title: 'Settlement Net', category: 'BANK-ANCHORED TRUTH', formula: 'Actual Bank Deposit Value', desc: "The 'Ultimate Truth Anchor'. If bank doesn't match, metric is Untrusted." }
];

export const PIPELINE_STAGES = [
  { stage: 'STAGE 1', title: 'Raw Truth Capture', desc: 'Immutable data ingestion (POS, Bank, Payroll) preserved without mutation.' },
  { stage: 'STAGE 2', title: 'Semantic Alignment', desc: 'Correcting clock drift and normalizing vendor fields into Canonical Variables.' },
  { stage: 'STAGE 3', title: 'Rule-Based Detection', desc: 'Applying the Pattern A-E engine to deterministic identification of leakage.' },
  { stage: 'STAGE 4', title: 'Action Routing', desc: 'Triaging findings into bucketed fixes: Recovery, Training, or System issue.' },
  { stage: 'STAGE 5', title: 'Certified Deliverables', desc: 'Audit-grade outputs (Recovery Ledgers) safe for AI and financial booking.' }
];

export const BLUEPRINT_CARDS = [
  {
    id: 'food_prime',
    title: 'FOOD & PRIME CERTIFICATION',
    formula: 'Actual COGS = Beg + Purch - End',
    headers: 'date, net_sales, purchases, begin_inventory, end_inventory, labor_costs',
    note: 'Health firewall. Certifies COGS and Labor efficiency gaps based on physical truth.'
  },
  {
    id: 'bev_pour',
    title: 'BEVERAGE (POUR) CERTIFICATION',
    formula: 'Pour % = Actual COGS / Category Sales',
    headers: 'liq_sales, beer_sales, total_purchases, begin_inventory, end_inventory',
    note: 'Bar cost logic. Separates intentional shrinkage from over-pouring.'
  },
  {
    id: 'delivery_cert',
    title: 'DELIVERY CERTIFICATION',
    formula: 'Variance = (POS_Sales - Actual_Cash)',
    headers: 'date, pos_delivery_sales, platform_gross_sales, delivery_partner_fees, platform_fees',
    note: 'Terminal Truth node. Certifies if platform revenue actually reaches the bank.'
  }
];

export const FAQ_DATA = [
  {
    question: "What is the FohBoh MGE?",
    answer: "The FohBoh MGE is a metrics governance and certification layer built specifically for restaurants and hospitality. It acts as a trusted data layer between your operational systems and your intelligence systems, ensuring that every number you see is accurate, consistent, and trustworthy."
  }
];

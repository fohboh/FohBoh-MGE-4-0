
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
  [ModuleType.REVENUE_RECOVERY]: "date,opened,closed,avg,voids,unauthorized_comps\n2024-01-15,150,140,28.50,5,2",
  [ModuleType.DELIVERY_RECON]: "date,pos_delivery_sales,platform_gross_sales,delivery_partner_fees,platform_fees\n2024-01-15,1250.00,1280.00,262.50,15.00",
  [ModuleType.CC_AUDIT]: "transaction_id,amount,pos_amount,processor_fee,interchange_rate\nTX-001,85.50,85.50,2.14,2.50%",
  [ModuleType.OPERATING_COSTS]: "date,net_sales,purchases,begin_inventory,end_inventory,labor_costs\n2024-W02,125000.00,32500.00,18500.00,16500.00,38000.00"
};

export const GLOSSARY_LOGIC = [
  { id: 'drift', title: 'Drift', category: 'LOGIC VARIANCE', formula: 'Expected Truth - Observed Truth', desc: 'Primary indicator of leakage. Positive drift suggests uncaptured revenue or inventory loss.' },
  { id: 'net_yield', title: 'Net Yield', category: 'EFFECTIVE MARGIN', formula: 'Platform Gross - (Fees + Comm + Promos)', desc: "Isolates cash value of a 3rd party order. Identifies 'Commercial Wedge' erosion." },
  { id: 'revpash', title: 'RevPASH', category: 'REV / SEAT HOUR', formula: 'Total Rev / (Seats * Hours)', desc: "Identifies 'cold seats' and dead zones. Essential for table-turn yield strategy." },
  { id: 'theo_cogs', title: 'Theo COGS', category: 'THEORETICAL USAGE', formula: 'SUM(Menu_Sales * Recipe_Cost)', desc: 'Perfect world cost. Delta indicates kitchen waste, theft, or portioning issues.' },
  { id: 'pattern_a', title: 'Pattern A', category: 'PHANTOM CHECKS', formula: 'Checks Opened - Checks Settled', desc: "Transaction-level leakage where checks remain 'pending' indefinitely." },
  { id: 'pattern_e', title: 'Pattern E', category: 'TIME THEFT DRIFT', formula: 'Sales events outside Clock-In', desc: 'Occurs when transactions are processed by staff not officially on the clock.' },
  { id: 'splh', title: 'SPLH', category: 'SALES / LABOR HR', formula: 'Total Sales / Total Labor Hours', desc: 'Efficiency engine. Low SPLH = overstaffing; high = service risk.' },
  { id: 'prime_cost', title: 'Prime Cost', category: 'MASTER HEALTH', formula: '(Food Cost + Labor) / Sales', desc: 'Industry standard for P&L health. Target is typically < 65%.' },
  { id: 'canonical_var', title: 'Canonical Var', category: 'STANDARDIZED LOGIC', formula: 'Map(Vendor) -> Unified_Schema', desc: 'Translates fragmented vendor data into a single language for Stage 3 processing.' },
  { id: 'pour_cost', title: 'Pour Cost', category: 'BEVERAGE COGS', formula: 'Bev COGS / Bev Sales', desc: 'Isolates leakage in the bar area. Target ranges: Liquor (18%), Beer (22%).' },
  { id: 'seat_turns', title: 'Seat Turns', category: 'INVENTORY VELOCITY', formula: 'Covers / Total Seat Count', desc: 'Manufacturing capacity of dining room. 0.1x lift yields 5-10% revenue.' },
  { id: 'audit_ledger', title: 'Audit Ledger', category: 'EVIDENCE STREAM', formula: 'Stage 5 Deliverable', desc: 'Immutable, time-stamped record of detected variances for financial booking.' },
  { id: 'pattern_c', title: 'Pattern C', category: 'SUSPICIOUS VOIDS', formula: 'Void Value > Statistical Baseline', desc: 'Flags deletions that deviate from historical location baselines.' },
  { id: 'settlement_net', title: 'Settlement Net', category: 'BANK-ANCHORED TRUTH', formula: 'Actual Bank Deposit Value', desc: "The 'Ultimate Truth Anchor'. If bank doesn't match, metric is Untrusted." },
  { id: 'truth_anchor', title: 'Truth Anchor', category: 'PRIMARY SOURCE', formula: 'Immutable Evidence Source', desc: 'Bank Statement is for Revenue; Physical Count is for Inventory.' }
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
  },
  {
    id: 'rev_recovery',
    title: 'REVENUE RECOVERY (PATTERNS A-D)',
    formula: 'Leakage = (Phantoms + Voids + Policy Drift)',
    headers: 'date, opened, closed, avg, voids, unauthorized_comps',
    note: 'Identifies transaction leakage patterns (A-D). Pattern A flags phantoms.'
  },
  {
    id: 'labor_eff',
    title: 'LABOR EFFICIENCY (PATTERN E)',
    formula: 'Time Theft = Unscheduled Sales Drift',
    headers: 'date, net_sales, total_hours, unscheduled_sales, boh_labor, foh_labor',
    note: 'Pattern E detection. Sales occurring while staff is clocked out.'
  },
  {
    id: 'capacity_revpash',
    title: 'CAPACITY & REVPASH',
    formula: 'RevPASH = Total Revenue / (Seats * Hours)',
    headers: 'date, net_sales, total_seats, hours_open, parties_served',
    note: 'Asset yield audit. Improving table turns increases revenue without overhead.'
  }
];

export const FAQ_DATA = [
  {
    question: "What is the FohBoh MGE?",
    answer: "The FohBoh MGE is a metrics governance and certification layer built specifically for restaurants and hospitality. It acts as a trusted data layer between your operational systems (like POS, inventory, and payroll) and your intelligence systems (like dashboards, reports, and AI), ensuring that every number you see is accurate, consistent, and trustworthy. Think of it as your restaurant’s 'financial GPS' - it syncs all your data sources, so everyone is looking at the same numbers, calculated the same way, every time."
  },
  {
    question: "How is the MGE different from a dashboard, spreadsheet, or reporting tool?",
    answer: "Dashboards and spreadsheets display data, they don’t govern it. The MGE certifies your data before it reaches any dashboard, report, or AI system. Unlike manual spreadsheets, the MGE: Guarantees the same formula is used across all locations and systems, Provides a Trust Score for every metric, Maintains a full audit trail of every calculation, Automatically enforces your business rules across your entire tech stack, and Makes data AI-safe and board-ready."
  },
  {
    question: "Can't I just use a spreadsheet to calculate my KPIs?",
    answer: "Yes, you could. A spreadsheet can calculate numbers. But it cannot: Guarantee that the same formula is used across all locations and systems; Provide a confidence score for every metric; Maintain an auditable trail of how every number was calculated; Automatically enforce your business rules across your entire tech stack; Certify data for safe AI consumption. The MGE turns tribal knowledge into executable, scalable, and auditable infrastructure."
  },
  {
    question: "What kinds of problems does the MGE solve?",
    answer: "Ends meetings where teams argue over whose numbers are right; Prevents false alarms, like 'missing inventory' that was actually employee meals; Ensures AI and forecasting tools work with accurate, consistent data; Scales your best practices and policies automatically across all locations; Eliminates 'metric drift' where different systems calculate the same KPI differently."
  },
  {
    question: "How does the MGE help with AI and forecasting?",
    answer: "AI tools are only as good as the data they're given. The MGE certifies a single version of the truth before AI ever sees the data, ensuring predictions are based on reality, not conflicting sources. This prevents AI 'hallucinations' and makes your forecasting tools truly reliable."
  },
  {
    question: "What does the MGE certify?",
    answer: "The MGE certifies the process, not just the numbers. It ensures that every calculation follows your exact business rules, is consistent across all systems, and is fully transparent and auditable. This includes certifying compliance with policies (e.g., manager approval for comps over $25) and consistency across the organization."
  },
  {
    question: "Does the MGE fix bad data?",
    answer: "The MGE doesn't correct errors in your source systems, but it will alert you when data is missing, inconsistent, or looks unusual, so you can fix it at the source."
  },
  {
    question: "What is a Trust Score?",
    answer: "Every metric certified by the MGE comes with a Trust Score (0–100). This score tells you how reliable the number is based on data freshness, completeness, and consistency. 95+ means data is fresh, complete, and consistent; Below 80 flags issues like missing invoices or outdated counts."
  },
  {
    question: "What is a KPI Registry and KPI Vault?",
    answer: "The KPI Registry is where you can create, test, and customize KPIs before they go live (flexible and collaborative). The KPI Vault is where KPIs are locked and governed; only authorized administrators can modify them, ensuring consistency, auditability, and trust."
  },
  {
    question: "Does the MGE replace my POS, inventory, or accounting software?",
    answer: "No. The MGE works with your existing systems. It unifies and certifies the data they produce, ensuring everyone is looking at the same trusted numbers."
  },
  {
    question: "Is the MGE only for large restaurant groups?",
    answer: "No. The MGE is designed for any operator who uses multiple systems, cares about data consistency, and wants to scale with confidence. It's especially valuable for growing brands and franchise groups."
  },
  {
    question: "Is the MGE secure and auditable?",
    answer: "Yes. Every action in the MGE is logged in an immutable audit trail. You can see who changed a rule, when, and what the impact was."
  },
  {
    question: "How does the MGE prevent 'metric drift'?",
    answer: "Metric drift happens when different systems calculate the same metric differently. The MGE eliminates this by storing one official version of each formula, tracking every change with version control, and ensuring the same formula is used across all tools."
  },
  {
    question: "How long does it take to implement the MGE?",
    answer: "Implementation timelines vary, but the MGE is designed for seamless integration. Most users begin with manual entry or custom CSV templates before investing in a full API integration."
  }
];

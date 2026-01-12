
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
  {
    formulaId: "GROSS_PROFIT_MARGIN",
    name: "Gross Profit Margin",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "((Total_Sales - COGS_Total) / Total_Sales) * 100",
    description: "The percentage of revenue exceeding COGS.",
    variables: ["Total_Sales", "COGS_Total"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    targetRanges: { "QSR": "65-70%", "FSR": "60-65%" },
    enrichment: {
      what: "Sales remaining after direct costs.",
      why: "Determines cash available for rent, labor, and profit.",
      how: "Subtract COGS from Net Sales and divide by Net Sales.",
      fix: "Increase high-margin upsells (apps, desserts)."
    }
  },
  {
    formulaId: "NET_PROFIT_MARGIN",
    name: "Net Profit Margin",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "(Net_Profit / Total_Revenue) * 100",
    description: "Percentage of revenue that remains as profit after all expenses.",
    variables: ["Net_Profit", "Total_Revenue"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    governanceRules: ["Must be after all expenses (rent, marketing, etc.)"],
    enrichment: {
      what: "Final profitability percentage.",
      why: "Measures the overall success of the business.",
      how: "Bottom line net income divided by total gross revenue.",
      fix: "Focus on reducing occupancy costs or administrative overhead."
    }
  },
  {
    formulaId: "BREAK_EVEN_POINT",
    name: "Break-Even Point",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "Fixed_Costs / ((Total_Sales - Variable_Costs) / Total_Sales)",
    description: "Sales volume needed to cover all costs.",
    variables: ["Fixed_Costs", "Total_Sales", "Variable_Costs"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "The sales level where profit is exactly zero.",
      why: "Determines safety margin for surviving slow periods.",
      how: "Fixed costs divided by contribution margin ratio.",
      fix: "Negotiate fixed costs (rent) or improve contribution margin."
    }
  },
  {
    formulaId: "REVENUE_GROWTH_RATE",
    name: "Revenue Growth Rate",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "((Current_Period_Revenue - Previous_Period_Revenue) / Previous_Period_Revenue) * 100",
    description: "The rate at which revenue is increasing or decreasing.",
    variables: ["Current_Period_Revenue", "Previous_Period_Revenue"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Period-over-period sales comparison.",
      why: "Validates marketing efforts and market expansion.",
      how: "Subtract old sales from new, divide by old.",
      fix: "Analyze traffic drivers or seasonal trends."
    }
  },
  {
    formulaId: "OPERATING_PROFIT_MARGIN",
    name: "Operating Profit Margin",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "(Operating_Income / Total_Revenue) * 100",
    description: "Profitability from core operations before interest and taxes.",
    variables: ["Operating_Income", "Total_Revenue"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "EBIT margin equivalent for restaurants.",
      why: "Isolates operational performance from financial structure.",
      how: "Gross Profit minus all operating expenses.",
      fix: "Tighten controllable utilities and maintenance."
    }
  },
  {
    formulaId: "OPERATING_CASH_FLOW",
    name: "Cash Flow (Operating)",
    module: ModuleType.FINANCIAL_PROFITABILITY,
    expression: "Net_Income + Depreciation - Changes_in_Working_Capital",
    description: "Net cash generated from operating activities.",
    variables: ["Net_Income", "Depreciation", "Changes_in_Working_Capital"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Actual liquid cash moving in/out of the business.",
      why: "Profits don't matter if you can't pay the bills today.",
      how: "Adjust net income for non-cash items and inventory changes.",
      fix: "Speed up accounts receivable or manage vendor payments."
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
  },
  {
    formulaId: "AVERAGE_MEAL_DURATION",
    name: "Average Meal Duration",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Σ(Check_Close_Time - Check_Open_Time) / Number_of_Checks",
    description: "Average time a guest spends at a table.",
    variables: ["Check_Close_Time", "Check_Open_Time", "Number_of_Checks"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Time from order to pay.",
      why: "Correlates directly with turnover and experience satisfaction.",
      how: "POS timestamp analysis.",
      fix: "Identify 'campers' and optimize dessert/coffee service."
    }
  },
  {
    formulaId: "AVERAGE_TABLE_OCCUPANCY",
    name: "Average Table Occupancy",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "(Total_Occupied_Seat_Hours / Total_Available_Seat_Hours) * 100",
    description: "Percentage of seats occupied while open.",
    variables: ["Total_Occupied_Seat_Hours", "Total_Available_Seat_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Seat utilization rate.",
      why: "Shows if the dining room is appropriately sized or marketed.",
      how: "Ratio of occupied to potential seats.",
      fix: "Optimize floor plan for party sizes (2-tops vs 4-tops)."
    }
  },
  {
    formulaId: "SALES_PER_SQFT",
    name: "Sales Per Square Foot",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Annual_Sales / Total_Square_Footage",
    description: "Revenue efficiency relative to real estate footprint.",
    variables: ["Annual_Sales", "Total_Square_Footage"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Real estate efficiency.",
      why: "Determines if the physical space is generating enough ROI.",
      how: "Gross sales divided by facility square footage.",
      fix: "Optimize front-of-house to back-of-house ratio."
    }
  },
  {
    formulaId: "COVERS_PER_DAY",
    name: "Cover Count (Per Day)",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Total_Guests_Served / Number_of_Operating_Days",
    description: "Average daily guest count.",
    variables: ["Total_Guests_Served", "Number_of_Operating_Days"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Daily traffic volume.",
      why: "Essential for labor scheduling and prep planning.",
      how: "Divide total period guests by days open.",
      fix: "Run weekday promotions to boost low-traffic days."
    }
  },
  {
    formulaId: "OFF_PREMISE_PCT",
    name: "Takeout/Delivery Percentage",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "(Takeout_Sales + Delivery_Sales) / Total_Sales * 100",
    description: "Revenue mix from non-dine-in sources.",
    variables: ["Takeout_Sales", "Delivery_Sales", "Total_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Off-premise revenue share.",
      why: "High percentages may require kitchen layout adjustments.",
      how: "Isolate takeout/delivery channel sales in POS.",
      fix: "Audit packaging costs and delivery partner commissions."
    }
  },
  {
    formulaId: "DAY_PART_RATIO",
    name: "Day Part Performance Ratio",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "Lunch_Sales / Dinner_Sales",
    description: "Revenue balance between different meal periods.",
    variables: ["Lunch_Sales", "Dinner_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Sales distribution by time.",
      why: "Indicates specialization or missed opportunities in specific segments.",
      how: "Compare specific shift sales totals.",
      fix: "Analyze menu appeal for the weaker day part."
    }
  },
  {
    formulaId: "MENU_ITEM_INDEX",
    name: "Menu Item Performance Index",
    module: ModuleType.OPERATIONAL_EFFICIENCY,
    expression: "(Item_Contribution_Margin * Item_Sales_Volume) / Total_Contribution_Margin",
    description: "Profitability score for individual menu items.",
    variables: ["Item_Contribution_Margin", "Item_Sales_Volume", "Total_Contribution_Margin"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Menu engineering ranking.",
      why: "Identifies 'Stars' (high profit/volume) vs 'Dogs'.",
      how: "Combine PMIX sales with theoretical food costs.",
      fix: "Promote Stars, Reprice Plowhorses, Remove Dogs."
    }
  },

  // CATEGORY 3: INVENTORY & WASTE (10 KPIs)
  {
    formulaId: "INVENTORY_TURNOVER",
    name: "Inventory Turnover Rate",
    module: ModuleType.INVENTORY_WASTE,
    expression: "COGS / Average_Inventory",
    description: "How many times inventory is sold and replaced.",
    variables: ["COGS", "Average_Inventory"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Inventory velocity.",
      why: "High turnover ensures freshness and reduces cash tie-up.",
      how: "COGS divided by average of start and end inventory.",
      fix: "Adjust order frequency for high-perishables."
    }
  },
  {
    formulaId: "FOOD_WASTE_PCT",
    name: "Food Waste Percentage",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(Cost_of_Waste / Total_Food_COGS) * 100",
    description: "Percentage of total cost lost to waste.",
    variables: ["Cost_of_Waste", "Total_Food_COGS"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Profit leakage from discarded product.",
      why: "Directly impacts food cost % and bottom line.",
      how: "Weigh and cost all items in a daily waste log.",
      fix: "Implement batch cooking and audit prep yields."
    }
  },
  {
    formulaId: "BEVERAGE_COST_PCT",
    name: "Beverage Cost Percentage",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(Beverage_COGS / Beverage_Sales) * 100",
    description: "Ratio of beverage costs to beverage sales.",
    variables: ["Beverage_COGS", "Beverage_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Liquid margin indicator.",
      why: "Beverage usually has higher margins; variance here is costly.",
      how: "Inventory-based COGS calculation for bar items.",
      fix: "Enforce standard pours and check for over-pouring."
    }
  },
  {
    formulaId: "LIQUOR_POUR_COST_PCT",
    name: "Liquor Pour Cost Percentage",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(Liquor_COGS / Liquor_Sales) * 100",
    description: "The cost ratio specifically for spirits and cocktails.",
    variables: ["Liquor_COGS", "Liquor_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Spirit profitability.",
      why: "Critical for bars to detect theft or free pouring.",
      how: "Compare theoretical pour vs physical bottle counts.",
      fix: "Use jiggers or automated pour systems."
    }
  },
  {
    formulaId: "INVENTORY_VARIANCE_PCT",
    name: "Inventory Variance (Shrinkage)",
    module: ModuleType.INVENTORY_WASTE,
    expression: "|(Theoretical_COGS - Actual_COGS)| / Theoretical_COGS * 100",
    description: "Difference between what should have been used vs what was used.",
    variables: ["Theoretical_COGS", "Actual_COGS"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Unaccounted product loss.",
      why: "Flags theft, over-portioning, or unrecorded waste.",
      how: "Theoretical (PMIX) vs Actual (Inventory Count).",
      fix: "Conduct spot-checks on high-value proteins."
    }
  },
  {
    formulaId: "INVENTORY_ACCURACY",
    name: "Inventory Accuracy Rate",
    module: ModuleType.INVENTORY_WASTE,
    expression: "(1 - (|Counted - System| / System)) * 100",
    description: "Measures reliability of digital inventory records.",
    variables: ["Counted", "System"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Data integrity score.",
      why: "Inaccurate system counts lead to ordering errors and stockouts.",
      how: "Blind counts compared to system-on-hand reports.",
      fix: "Train staff on proper counting units (cs vs ea)."
    }
  },
  {
    formulaId: "WASTE_PER_COVER",
    name: "Waste Cost Per Cover",
    module: ModuleType.INVENTORY_WASTE,
    expression: "Total_Waste_Cost / Total_Covers",
    description: "Average amount of waste cost generated per guest.",
    variables: ["Total_Waste_Cost", "Total_Covers"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Efficiency per guest served.",
      why: "Normalizes waste against volume for better comparison.",
      how: "Daily waste log totals / daily POS cover count.",
      fix: "Review portion sizes of top-selling items."
    }
  },
  {
    formulaId: "THEORETICAL_VS_ACTUAL",
    name: "Theoretical vs Actual Usage",
    module: ModuleType.INVENTORY_WASTE,
    expression: "Theoretical_Usage = Σ(Recipe_Quantity * Items_Sold)",
    description: "The 'Golden Rule' of food cost reconciliation.",
    variables: ["Recipe_Quantity", "Items_Sold"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "The exact usage expected based on recipes.",
      why: "Isolates operational mistakes from pricing issues.",
      how: "Map POS items to detailed inventory recipes.",
      fix: "Standardize recipes in the back-office system."
    }
  },
  {
    formulaId: "PERISHABLE_DAYS_ON_HAND",
    name: "Perishable Inventory Days On Hand",
    module: ModuleType.INVENTORY_WASTE,
    expression: "Current_Perishable_Inventory / (Daily_COGS * Perishable_Percentage)",
    description: "Days of fresh product available before stockout.",
    variables: ["Current_Perishable_Inventory", "Daily_COGS", "Perishable_Percentage"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Fresh inventory buffer.",
      why: "Avoids quality issues and excessive waste from expiration.",
      how: "Track shelf life and daily usage rates.",
      fix: "Improve FIFO (First-In, First-Out) compliance."
    }
  },
  {
    formulaId: "RECIPE_COST_COMPLIANCE",
    name: "Recipe Cost Compliance",
    module: ModuleType.INVENTORY_WASTE,
    expression: "Actual_Recipe_Cost / Standard_Recipe_Cost * 100",
    description: "Measures deviation from the ideal plate cost.",
    variables: ["Actual_Recipe_Cost", "Standard_Recipe_Cost"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Execution to standard.",
      why: "Plate cost variance kills profit even if sales are high.",
      how: "Audit plate prep on the line vs spec sheets.",
      fix: "Retrain prep cooks on scale usage."
    }
  },

  // CATEGORY 4: LABOR & STAFF PRODUCTIVITY (10 KPIs)
  {
    formulaId: "LABOR_COST_PCT",
    name: "Labor Cost Percentage",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Total_Labor_Cost / Total_Sales * 100",
    description: "Percentage of revenue spent on staff wages and benefits.",
    variables: ["Total_Labor_Cost", "Total_Sales"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Human capital efficiency.",
      why: "Second largest controllable expense after food.",
      how: "Total payroll + taxes + benefits / net sales.",
      fix: "Cut under-utilized shifts or multi-task roles."
    }
  },
  {
    formulaId: "SPLH",
    name: "Sales Per Labor Hour",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Net_Sales / Total_Labor_Hours",
    description: "Measures how much revenue is generated for every hour worked.",
    variables: ["Net_Sales", "Total_Labor_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Labor productivity benchmark.",
      why: "Unlike cost %, this is unaffected by wage rate increases.",
      how: "POS Sales / Total Clock-in Hours.",
      fix: "Improve training to increase server speed and upsells."
    }
  },
  {
    formulaId: "EMPLOYEE_TURNOVER",
    name: "Employee Turnover Rate",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "(Separations / Average_Employees) * 100",
    description: "The rate at which staff leave the organization.",
    variables: ["Separations", "Average_Employees"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Staff retention score.",
      why: "High turnover costs $3k-$5k per employee in training and lost productivity.",
      how: "Total terms / average active headcount.",
      fix: "Improve onboarding and work environment culture."
    }
  },
  {
    formulaId: "GUESTS_PER_SERVER_HOUR",
    name: "Guests Served Per Server Hour",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Total_Guests / Server_Hours",
    description: "Service density and speed per server.",
    variables: ["Total_Guests", "Server_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Capacity utilization.",
      why: "Too high suggests service quality drop; too low suggests overstaffing.",
      how: "Cover count / FOH server clock hours.",
      fix: "Optimize station sizes and floor support roles."
    }
  },
  {
    formulaId: "OVERTIME_PCT",
    name: "Overtime Percentage",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Overtime_Hours / Total_Hours * 100",
    description: "Share of labor hours paid at premium rates.",
    variables: ["Overtime_Hours", "Total_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Premium labor leak.",
      why: "OT is typically 1.5x cost; often indicates poor scheduling or call-outs.",
      how: "Timecard analysis from payroll system.",
      fix: "Implement 'No-OT' cross-training policies."
    }
  },
  {
    formulaId: "LABOR_EFFICIENCY_RATIO",
    name: "Labor Efficiency Ratio",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Actual_Labor_Hours / Forecasted_Labor_Hours",
    description: "Measures adherence to the labor budget/plan.",
    variables: ["Actual_Labor_Hours", "Forecasted_Labor_Hours"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Scheduling precision.",
      why: "Ensures labor fluctuates appropriately with guest volume.",
      how: "Compare clocked hours vs scheduled hours in HRIS.",
      fix: "Use smarter traffic forecasting (AI) for schedules."
    }
  },
  {
    formulaId: "TRAINING_HOURS_PER_EMPLOYEE",
    name: "Training Hours Per Employee",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Total_Training_Hours / Total_Employees",
    description: "Investment in staff skill development.",
    variables: ["Total_Training_Hours", "Total_Employees"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Skill investment depth.",
      why: "Higher training correlates with lower turnover and higher SPLH.",
      how: "Track hours coded to 'Training' in payroll.",
      fix: "Implement a formalized 20-hour onboarding path."
    }
  },
  {
    formulaId: "SCHEDULE_ADHERENCE",
    name: "Schedule Adherence Rate",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "(Scheduled_Worked / Total_Scheduled) * 100",
    description: "Measures punctuality and shift compliance.",
    variables: ["Scheduled_Worked", "Total_Scheduled"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Shift reliability.",
      why: "Call-outs and late starts disrupt kitchen flow and guest service.",
      how: "Punch clock comparison to schedule software.",
      fix: "Enforce strict attendance policies."
    }
  },
  {
    formulaId: "CROSS_TRAINING_PCT",
    name: "Cross-Training Percentage",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "(Cross_Trained_Employees / Total_Employees) * 100",
    description: "Share of staff capable of multiple roles.",
    variables: ["Cross_Trained_Employees", "Total_Employees"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Operational flexibility.",
      why: "Reduces overtime and vulnerability to call-outs.",
      how: "Audit HR skill matrix records.",
      fix: "Incentivize servers to train in BOH roles and vice versa."
    }
  },
  {
    formulaId: "LABOR_COST_PER_COVER",
    name: "Labor Cost Per Cover",
    module: ModuleType.LABOR_PRODUCTIVITY,
    expression: "Total_Labor_Cost / Total_Covers",
    description: "Average labor expense per guest served.",
    variables: ["Total_Labor_Cost", "Total_Covers"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Guest-normalized labor cost.",
      why: "Useful for comparing efficiency between high and low traffic days.",
      how: "Daily labor totals / Daily cover counts.",
      fix: "Cut 'ghost shifts' during known slow periods."
    }
  },

  // CATEGORY 5: SERVICE QUALITY & ACCURACY (10 KPIs)
  {
    formulaId: "ORDER_ACCURACY",
    name: "Order Accuracy Rate",
    module: ModuleType.SERVICE_QUALITY,
    expression: "(Accurate_Orders / Total_Orders) * 100",
    description: "Percentage of orders fulfilled without errors.",
    variables: ["Accurate_Orders", "Total_Orders"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Execution quality.",
      why: "Errors cause waste, re-cooks, and guest dissatisfaction.",
      how: "Count remakes and guest complaints vs total checks.",
      fix: "Install kitchen display systems (KDS) for clear communication."
    }
  },
  {
    formulaId: "KITCHEN_PREP_TIME",
    name: "Kitchen Prep Time",
    module: ModuleType.SERVICE_QUALITY,
    expression: "Average_Time_Order_to_Plate",
    description: "Average time to prepare and plate an order.",
    variables: ["Order_Time", "Plate_Time"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Kitchen throughput speed.",
      why: "Directly impacts seat turnover and guest happiness.",
      how: "KDS timestamps or manual kitchen timing logs.",
      fix: "Audit station mis-en-place and prep levels."
    }
  },
  {
    formulaId: "SPEED_OF_SERVICE",
    name: "Speed of Service",
    module: ModuleType.SERVICE_QUALITY,
    expression: "Average_Time_Seated_to_Check_Presented",
    description: "Total elapsed time for the dining experience.",
    variables: ["Seat_Time", "Check_Presented_Time"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "End-to-end service speed.",
      why: "Measures total guest friction from door to exit.",
      how: "Analysis of POS and table management data.",
      fix: "Optimize the payment process (pay-at-table)."
    }
  },
  {
    formulaId: "COMPLAINTS_PER_100",
    name: "Customer Complaints Per 100 Covers",
    module: ModuleType.SERVICE_QUALITY,
    expression: "(Number_of_Complaints / Total_Covers) * 100",
    description: "Normalized frequency of negative guest feedback.",
    variables: ["Number_of_Complaints", "Total_Covers"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Feedback density.",
      why: "High complaint rates are lead indicators of revenue drops.",
      how: "Aggregate social reviews, guest surveys, and in-store logs.",
      fix: "Perform root cause analysis on top 3 complaint categories."
    }
  },
  {
    formulaId: "FIRST_TIME_FIX_RATE",
    name: "First-Time Fix Rate",
    module: ModuleType.SERVICE_QUALITY,
    expression: "(Issues_Resolved_First_Time / Total_Issues) * 100",
    description: "Efficiency in resolving guest issues without escalation.",
    variables: ["Issues_Resolved_First_Time", "Total_Issues"],
    restaurantType: RestaurantType.FSR,
    version: "3.4.1",
    createdBy: "MGE_CORE",
    createdAt: NOW,
    isApproved: true,
    enrichment: {
      what: "Empowerment efficiency.",
      why: "Swift resolution saves guest loyalty and reduces manager stress.",
      how: "Track issues requiring manager intervention vs server resolution.",
      fix: "Empower servers to comp small items without manager swipes."
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

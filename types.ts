
export enum RestaurantType {
  QSR = "quick_service",
  FSR = "full_service",
  FINE_DINING = "fine_dining",
  BAR_PUB = "bar_pub",
  HOTEL_FB = "hotel_fb",
  CATERING = "catering",
  FOOD_TRUCK = "food_truck",
  CAFE = "cafe",
  BREWPUB = "brewpub"
}

export enum UserRole {
  STORE_OPERATOR = "store_operator",
  REGIONAL = "regional",
  C_LEVEL = "c_level",
  ANALYST = "analyst",
  OTHER = "other"
}

export enum ModuleType {
  REVENUE_RECOVERY = "revenue_recovery",
  DELIVERY_RECON = "delivery_reconciliation",
  CC_AUDIT = "credit_card_audit",
  OPERATING_COSTS = "operating_costs"
}

export interface DateRange {
  start: string;
  end: string;
}

export interface SimulatorUser {
  userId: string;
  firstName: string;
  lastName: string;
  userType: UserRole;
  businessEmail: string;
  company?: string;
  phone?: string;
  createdAt: string;
  lastLogin: string;
  simulationCount: number;
}

export interface KPIFormula {
  formulaId: string;
  name: string;
  module: ModuleType;
  expression: string;
  description: string;
  variables: string[];
  restaurantType: RestaurantType;
  version: string;
  createdBy: string;
  createdAt: string;
  isApproved: boolean;
  approvalDate?: string;
}

export interface CertifiedMetric {
  metricId: string;
  kpiId: string;
  module: ModuleType;
  value: number;
  trustScore: number;
  calculationDate: string;
  isCertified: boolean;
  dataSources: string[];
  qualityIssues: string[];
  foundMoneyAmount: number;
}

export interface VaultStatus {
  registryFormulas: number;
  vaultFormulas: number;
  isLocked: boolean;
  approvedFormulas: number;
  lastAudit?: string;
  vaultHash?: string;
}

export interface ComparisonDelta {
  metric: string;
  current: number;
  previous: number;
  deltaPercent: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface ExecutiveDashboard {
  user: {
    name: string;
    role: string;
    company?: string;
    simulations: number;
  };
  performance: {
    totalFoundMoney: number;
    certificationRate: string;
    averageTrustScore: string;
    totalSimulations: number;
    aiReadinessScore: string;
    comparisonDeltas: ComparisonDelta[];
  };
  recentMetrics: CertifiedMetric[];
  vaultStatus: VaultStatus;
  generatedAt: string;
  simulationId: string;
  dateRange: DateRange;
}

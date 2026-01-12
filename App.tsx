
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  Calculator,
  ShieldCheck,
  BrainCircuit,
  Download,
  ChefHat,
  Eye,
  Upload,
  Printer,
  FileSpreadsheet,
  LogOut,
  CreditCard,
  Truck,
  Database,
  History as HistoryIcon,
  Globe,
  Sparkles,
  Zap,
  Shield,
  Layers,
  ArrowUpRight,
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import Layout from './components/Layout';
import { 
  RestaurantType, 
  UserRole, 
  ModuleType, 
  SimulatorUser, 
  KPIFormula, 
  CertifiedMetric, 
  ExecutiveDashboard,
  DateRange,
  ComparisonDelta
} from './types';
import { STANDARD_FORMULAS, CSV_TEMPLATES } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  // App State
  const [user, setUser] = useState<SimulatorUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [restaurantType, setRestaurantType] = useState<RestaurantType>(RestaurantType.FSR);
  const [formulas, setFormulas] = useState<KPIFormula[]>(STANDARD_FORMULAS);
  const [metrics, setMetrics] = useState<CertifiedMetric[]>([]);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [csvUploadLoading, setCsvUploadLoading] = useState(false);
  
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);

  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Auth State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: UserRole.C_LEVEL,
    password: '' 
  });

  // Session Management
  useEffect(() => {
    const savedUser = localStorage.getItem('fohboh_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowLanding(false);
    }
    setIsAuthenticating(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (userFormData.email && userFormData.password) {
      const newUser: SimulatorUser = {
        userId: `U_${Date.now()}`,
        firstName: userFormData.firstName || 'Guest',
        lastName: userFormData.lastName || 'User',
        userType: userFormData.role,
        businessEmail: userFormData.email,
        company: userFormData.company || 'Truth Table Rest',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        simulationCount: 0
      };
      setUser(newUser);
      localStorage.setItem('fohboh_user_session', JSON.stringify(newUser));
    } else {
      setAuthError('Invalid credentials. Please fill all fields.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fohboh_user_session');
    setActiveTab('dashboard');
    setOnboardingStep(1);
    setShowLanding(true);
  };

  // Performance Analysis
  const getComparisonDeltas = useCallback((): ComparisonDelta[] => {
    const totalCurrent = metrics.reduce((acc, m) => acc + m.foundMoneyAmount, 0);
    const totalPrevious = totalCurrent * 0.85; 
    const diff = totalCurrent - totalPrevious;
    const percent = totalPrevious > 0 ? (diff / totalPrevious) * 100 : 0;

    return [
      {
        metric: 'Found Money',
        current: totalCurrent,
        previous: totalPrevious,
        deltaPercent: parseFloat(percent.toFixed(1)),
        trend: percent >= 0 ? 'up' : 'down'
      }
    ];
  }, [metrics]);

  const runSimulation = (module: ModuleType, inputData: any) => {
    let value = 0;
    let trustScore = 85;
    let kpiId = '';

    switch (module) {
      case ModuleType.REVENUE_RECOVERY:
        kpiId = 'RR001';
        const open = parseFloat(inputData.open_checks || inputData.openChecks || 0);
        const closed = parseFloat(inputData.closed_checks || inputData.closedChecks || 0);
        const avg = parseFloat(inputData.average_check || inputData.avgCheck || 0);
        value = (open - closed) * avg;
        if (open < closed) trustScore -= 20;
        break;

      case ModuleType.DELIVERY_RECON:
        kpiId = 'DR001';
        const pos = parseFloat(inputData.pos_sales || inputData.posSales || 0);
        const plat = parseFloat(inputData.platform_sales || inputData.platformSales || 0);
        const bank = parseFloat(inputData.bank_deposit || inputData.bankDeposit || 0);
        const fees = parseFloat(inputData.platform_fees || inputData.platformFees || 0);
        const refunds = parseFloat(inputData.refunds || 0);
        const adjustments = parseFloat(inputData.adjustments || 0);
        
        const expected = plat - fees - refunds - adjustments;
        value = expected - bank;
        if (pos < plat) trustScore -= 15;
        break;

      case ModuleType.CC_AUDIT:
        kpiId = 'CA001';
        const amount = parseFloat(inputData.amount || 0);
        const actualFee = parseFloat(inputData.processor_fee || 0);
        const rateStr = (inputData.interchange_rate || "2.5%").replace('%', '');
        const expectedRate = parseFloat(rateStr) / 100;
        const expectedFee = amount * expectedRate;
        value = actualFee - expectedFee;
        if (Math.abs(value) > amount * 0.05) trustScore -= 30;
        break;

      case ModuleType.OPERATING_COSTS:
        kpiId = 'OC001';
        const begInv = parseFloat(inputData.beginning_inventory || 0);
        const pur = parseFloat(inputData.purchases || 0);
        const endInv = parseFloat(inputData.ending_inventory || 0);
        const sales = parseFloat(inputData.food_sales || 1); 
        const foodCostValue = (begInv + pur - endInv);
        const foodCostPct = (foodCostValue / sales) * 100;
        value = foodCostValue;
        if (foodCostPct > 45 || foodCostPct < 20) trustScore -= 25;
        break;
    }

    const now = new Date();
    const newMetric: CertifiedMetric = {
      metricId: `METRIC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      kpiId,
      module,
      value,
      trustScore: Math.max(0, Math.min(100, trustScore)),
      calculationDate: now.toISOString(),
      isCertified: trustScore >= 85,
      dataSources: ['Truth Table Engine'],
      qualityIssues: trustScore < 85 ? ['Anomalous Discrepancy Found'] : [],
      foundMoneyAmount: Math.abs(value)
    };

    setMetrics(prev => [...prev, newMetric]);
    if (user) {
      const updatedUser = { ...user, simulationCount: user.simulationCount + 1 };
      setUser(updatedUser);
      localStorage.setItem('fohboh_user_session', JSON.stringify(updatedUser));
    }
  };

  const dashboardData = (): ExecutiveDashboard => {
    const totalFoundMoney = metrics.reduce((acc, m) => acc + (m.foundMoneyAmount || 0), 0);
    const certRate = metrics.length ? (metrics.filter(m => m.isCertified).length / metrics.length) * 100 : 0;
    const avgTrust = metrics.length ? metrics.reduce((acc, m) => acc + m.trustScore, 0) / metrics.length : 0;
    const aiReadiness = Math.round((avgTrust * 0.6) + (certRate * 0.4));

    return {
      user: {
        name: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
        role: user?.userType || 'Operator',
        company: user?.company,
        simulations: user?.simulationCount || 0
      },
      performance: {
        totalFoundMoney,
        certificationRate: `${certRate.toFixed(1)}%`,
        averageTrustScore: `${avgTrust.toFixed(0)}/100`,
        totalSimulations: metrics.length,
        aiReadinessScore: `${aiReadiness}/100`,
        comparisonDeltas: getComparisonDeltas()
      },
      recentMetrics: metrics.slice(-15).reverse(),
      vaultStatus: {
        registryFormulas: formulas.length,
        vaultFormulas: isVaultLocked ? formulas.filter(f => f.isApproved).length : 0,
        isLocked: isVaultLocked,
        approvedFormulas: formulas.filter(f => f.isApproved).length,
        vaultHash: isVaultLocked ? 'SHA256:8f3c...1e9a' : undefined
      },
      generatedAt: new Date().toISOString(),
      simulationId: `SIM_${Date.now()}`,
      dateRange
    };
  };

  const dashboard = dashboardData();

  const handleExportCSV = () => {
    const headers = ['Metric ID', 'Module', 'Value', 'Trust Score', 'Certified', 'Date Stamp'];
    const rows = metrics.map(m => [
      m.metricId,
      m.module.toUpperCase(),
      m.value.toFixed(2),
      m.trustScore,
      m.isCertified ? 'YES' : 'NO',
      new Date(m.calculationDate).toLocaleString()
    ]);

    const content = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FohBoh_MGE_Ledger_${new Date().toISOString()}.csv`;
    link.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>, module: ModuleType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split(/\r?\n/).filter(row => row.trim());
        if (rows.length < 2) throw new Error("File empty or invalid.");

        const headers = rows[0].split(',').map(h => h.trim());
        const dataRows = rows.slice(1);

        dataRows.forEach(row => {
          const values = row.split(',').map(v => v.trim());
          const inputData: any = {};
          headers.forEach((h, i) => {
            inputData[h] = values[i];
          });
          runSimulation(module, inputData);
        });
        setActiveTab('dashboard');
      } catch (err) {
        alert("Error parsing CSV. Please use the provided template.");
      } finally {
        setCsvUploadLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = (module: ModuleType) => {
    const template = CSV_TEMPLATES[module] || "";
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FohBoh_Template_${module.toUpperCase()}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (user && metrics.length > 0 && !isGeneratingInsights) {
      const fetchInsights = async () => {
        setIsGeneratingInsights(true);
        const newInsights = await geminiService.generateInsights(dashboard);
        setInsights(newInsights);
        setIsGeneratingInsights(false);
      };
      fetchInsights();
    }
  }, [metrics.length, isVaultLocked, dateRange]);

  if (isAuthenticating) return null;

  // Landing Page Logic
  const renderLandingPage = () => (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 px-12 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg">M</div>
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight">FohBoh MGE</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Simulator V4.0</span>
          </div>
        </div>
        <div className="flex items-center gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Layers size={14} /> Modules</button>
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Zap size={14} /> Use Cases</button>
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><BookOpen size={14} /> Logic Docs</button>
          <button className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><HelpCircle size={14} /> Help</button>
        </div>
      </nav>

      <main className="pt-32 pb-24 container mx-auto px-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-24 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E293B] text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-10 shadow-lg shadow-indigo-100">
            <Sparkles size={12} className="text-indigo-400" />
            Version 4.0 Engine
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[0.95]">
            Certify Metrics. <br />
            <span className="text-[#3B82F6]">Recover Revenue.</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed mb-12 font-medium">
            The MGE Simulator identifies hidden revenue leakage and quantifies operational efficiency through deterministic governance models.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={() => { setShowLanding(false); setOnboardingStep(1); }}
              className="bg-[#0F172A] text-white px-10 py-4 rounded-xl font-bold text-sm flex items-center gap-3 shadow-2xl hover:bg-slate-800 transition-all active:scale-95 group"
            >
              Start MGE Emulator <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white border border-slate-200 px-10 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              Explore Case Studies
            </button>
          </div>
        </div>

        {/* Small Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 px-4 mb-20">
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4"><Database size={18} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-2">Leakage Detection</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">Instantly spot revenue drifting between POS and bank deposits.</p>
          </div>
          <div className="p-8 text-center flex flex-col items-center border-x border-slate-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4"><Shield size={18} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-2">Trust Certification</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">Validate data integrity before committing to financial reports.</p>
          </div>
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4"><TrendingUp size={18} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-800 mb-2">Operational ROI</h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">Calculate exact annual savings from automated governance.</p>
          </div>
        </div>

        {/* Major Boxes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Data Integrity Protocol */}
          <div 
            onClick={() => { setShowLanding(false); setOnboardingStep(1); }}
            className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer relative overflow-hidden"
          >
            <div className="w-12 h-12 bg-[#D1FAE5] text-[#059669] rounded-2xl flex items-center justify-center mb-8"><Shield size={24} /></div>
            <h3 className="text-3xl font-black mb-6 tracking-tight">Data Integrity Protocol</h3>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              Real-time validation against US restaurant ontology standards. Our engine enforces deterministic truth across every ingestion layer.
            </p>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mb-24 -mr-24 opacity-50 transition-transform group-hover:scale-125 duration-700" />
          </div>

          {/* Revenue Recovery */}
          <div 
            onClick={() => { setShowLanding(false); setOnboardingStep(1); }}
            className="md:col-span-2 bg-[#2563EB] text-white rounded-[2.5rem] p-12 shadow-2xl hover:shadow-indigo-200 transition-all duration-500 group cursor-pointer relative flex flex-col"
          >
            <TrendingUp size={48} className="mb-10 text-white/50" />
            <h3 className="text-3xl font-black mb-6 tracking-tight">Revenue Recovery</h3>
            <p className="text-blue-100 font-medium leading-relaxed mb-auto">
              Quantify leakage from unclosed checks, vendor fee variances, and labor drift in minutes.
            </p>
            <button className="mt-12 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 transition-colors">
              Test Recovery <ArrowRight size={16} />
            </button>
          </div>

          {/* KPI Certification */}
          <div 
            onClick={() => { setShowLanding(false); setOnboardingStep(1); }}
            className="md:col-span-2 bg-[#0F172A] text-white rounded-[2.5rem] p-12 shadow-2xl hover:scale-[1.02] transition-all duration-500 group cursor-pointer"
          >
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-10"><Award size={24} className="text-blue-400" /></div>
            <h3 className="text-3xl font-black mb-6 tracking-tight">KPI Certification</h3>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              Go beyond basic calculation to certified Stage 3 efficiency metrics with MGE Governance.
            </p>
            <button className="text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
              View Logic Core <ArrowRight size={14} />
            </button>
          </div>

          {/* Technical Pipeline */}
          <div className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm flex items-center justify-between group overflow-hidden">
            <div className="max-w-md">
              <h3 className="text-2xl font-black mb-4 tracking-tight">Technical Pipeline Lifecycle</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                From Immutable Truth Capture to Audit-Grade Certification. Our 5-stage engine is designed for high-stakes restaurant finance.
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors duration-300">
                    {i}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <Layers size={80} className="text-slate-100 group-hover:text-indigo-50 transition-colors duration-500" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-12 py-12 border-t border-slate-100 mt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div>© 2024 FohBoh.ai, Inc. All Rights Reserved. US Patent Pending.</div>
        <div className="flex gap-10 mt-6 md:mt-0">
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Us</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms & Conditions</a>
          <a href="#" className="hover:text-slate-800 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );

  if (showLanding && !user) return renderLandingPage();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-indigo-600 p-10 text-white text-center">
            <ChefHat className="mx-auto mb-4" size={56} />
            <h1 className="text-2xl font-bold tracking-tight uppercase">Truth Table Restaurant</h1>
            <p className="text-indigo-100 mt-2 text-xs font-semibold tracking-widest opacity-80">FOHBOH MGE SIMULATOR V4.0</p>
          </div>
          <div className="p-8">
            <form onSubmit={onboardingStep === 1 ? (e) => { e.preventDefault(); setOnboardingStep(2); } : handleLogin} className="space-y-4">
              {onboardingStep === 1 ? (
                <>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-indigo-600" /> Identity Onboarding
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                      <input required type="text" value={userFormData.firstName} onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="John" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                      <input required type="text" value={userFormData.lastName} onChange={e => setUserFormData({...userFormData, lastName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Email</label>
                    <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="operator@rest.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                    <input required type="text" value={userFormData.company} onChange={e => setUserFormData({...userFormData, company: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Truth Table Group" />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4 transition-all active:scale-95">
                    Next Step <ArrowRight size={18} />
                  </button>
                  <button type="button" onClick={() => setShowLanding(true)} className="w-full text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors mt-2 uppercase tracking-widest">
                    Back to News
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Lock size={20} className="text-indigo-600" /> Secure Credentials
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator Password</label>
                      <input required type="password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Environment Role</label>
                      <select value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value as UserRole})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500">
                        {Object.values(UserRole).map(role => (
                          <option key={role} value={role}>{role.replace('_', ' ').toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-xl transition-all mt-4 active:scale-95">
                    Authenticate & Launch
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div id="printable-content" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          .print-hidden { display: none !important; }
          #printable-content { margin: 0; padding: 20mm; width: 100%; border: none; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          aside, header { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Executive Summary</h2>
          <p className="text-slate-500 text-sm">Audit Period: {dateRange.start} — {dateRange.end}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer size={16} /> Print Report / PDF
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-shadow shadow-md shadow-indigo-100"
          >
            <Download size={16} /> Download CSV Ledger
          </button>
        </div>
      </div>

      <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">FohBoh MGE Certified Intelligence Report</h1>
        <div className="mt-6 grid grid-cols-2 gap-x-12 gap-y-2 text-xs font-bold uppercase tracking-widest text-slate-600">
           <div className="border-b border-slate-200 py-2 flex justify-between"><span>Operator:</span> <span className="text-slate-900">{user.firstName} {user.lastName}</span></div>
           <div className="border-b border-slate-200 py-2 flex justify-between"><span>Company:</span> <span className="text-slate-900">{user.company}</span></div>
           <div className="border-b border-slate-200 py-2 flex justify-between"><span>Audit Period:</span> <span className="text-slate-900">{dateRange.start} / {dateRange.end}</span></div>
           <div className="border-b border-slate-200 py-2 flex justify-between"><span>Generated:</span> <span className="text-slate-900">{new Date().toLocaleString()}</span></div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recoverable Capital</div>
              <div className="text-2xl font-bold text-slate-900">${dashboard.performance.totalFoundMoney.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={14} /> {dashboard.performance.comparisonDeltas[0].deltaPercent}% vs Last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><CheckCircle2 size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certification</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.certificationRate}</div>
            </div>
          </div>
          <div className="text-xs font-semibold text-slate-500">Industry Avg: 92%</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><ShieldCheck size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.averageTrustScore}</div>
            </div>
          </div>
          <div className="text-xs font-semibold text-indigo-600">Audit-Ready State</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><BrainCircuit size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Readiness</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.aiReadinessScore}</div>
            </div>
          </div>
          <div className="text-xs font-semibold text-amber-600">Model Pro v3.0</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Discrepancy Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[420px] print:h-[350px]">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs">
            <Activity size={16} className="text-indigo-600" /> Variance Analysis Timeline
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.map((m) => ({ 
              name: new Date(m.calculationDate).toLocaleDateString(), 
              value: m.foundMoneyAmount, 
            }))}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recommendations */}
        <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl border border-slate-800 print:bg-slate-50 print:text-slate-900 print:border-slate-300">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-indigo-400 print:text-indigo-600">
            <BrainCircuit size={20} /> AI Strategy Insights
          </h3>
          <div className="space-y-4">
            {isGeneratingInsights ? (
              <div className="flex flex-col gap-3 py-16 text-center animate-pulse">
                <Activity size={24} className="animate-spin text-indigo-500 mx-auto" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Processing Intelligence...</p>
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="flex gap-4 text-sm p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors print:bg-white print:border-slate-200">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">0{idx+1}</div>
                  <p className="text-slate-300 text-xs leading-relaxed print:text-slate-600 font-medium">{insight}</p>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-12">
                 <p className="text-sm italic">Run simulation for recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transactional Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-300 page-break">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
            <FileText size={16} className="text-indigo-600" /> Transactional Integrity Ledger
          </h3>
          <span className="text-[10px] font-bold text-slate-400">Total Entries: {metrics.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest print:bg-slate-100 print:text-slate-700">
                <th className="px-6 py-4">Metric ID</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Trust Score</th>
                <th className="px-6 py-4">Date Stamp</th>
                <th className="px-6 py-4 text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentMetrics.map((m) => (
                <tr key={m.metricId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{m.metricId}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-500 uppercase">
                      {m.module.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">${m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-600">{m.trustScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-semibold text-slate-500">{new Date(m.calculationDate).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${m.isCertified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {m.isCertified ? 'CERTIFIED' : 'REVIEW'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {dashboard.recentMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400 italic text-sm">No transaction records found for this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModuleForm = (module: ModuleType) => {
    let title = "";
    let icon = <Database />;
    
    switch (module) {
      case ModuleType.REVENUE_RECOVERY: title = "Revenue Recovery"; icon = <DollarSign />; break;
      case ModuleType.DELIVERY_RECON: title = "Delivery Reconciliation"; icon = <Truck />; break;
      case ModuleType.CC_AUDIT: title = "Credit Card Audit"; icon = <CreditCard />; break;
      case ModuleType.OPERATING_COSTS: title = "Food Cost Intelligence"; icon = <ChefHat />; break;
    }

    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
            <div className="mb-10 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">{icon}</div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                <p className="text-slate-500 mt-1 text-sm">Direct truth-table entry for specialized simulation vectors.</p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={e => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const inputData = Object.fromEntries(formData.entries());
              runSimulation(module, inputData);
              setActiveTab('dashboard');
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {module === ModuleType.REVENUE_RECOVERY && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Check Count</label>
                      <input name="open_checks" required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Closed Check Count</label>
                      <input name="closed_checks" required type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average Check Payout ($)</label>
                      <input name="average_check" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                  </>
                )}

                {module === ModuleType.DELIVERY_RECON && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">POS Sales ($)</label>
                      <input name="pos_sales" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Sales ($)</label>
                      <input name="platform_sales" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Fees ($)</label>
                      <input name="platform_fees" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Bank Deposit ($)</label>
                      <input name="bank_deposit" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                  </>
                )}

                {module === ModuleType.CC_AUDIT && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Batch Amount ($)</label>
                      <input name="amount" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processor Fee Charged ($)</label>
                      <input name="processor_fee" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agreed Interchange Rate (%)</label>
                      <input name="interchange_rate" defaultValue="2.5%" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="2.5%" />
                    </div>
                  </>
                )}

                {module === ModuleType.OPERATING_COSTS && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beginning Inventory ($)</label>
                      <input name="beginning_inventory" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Purchases ($)</label>
                      <input name="purchases" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ending Inventory ($)</label>
                      <input name="ending_inventory" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Food Sales ($)</label>
                      <input name="food_sales" required type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                    </div>
                  </>
                )}
              </div>
              
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">
                Seal Calculation & Update Dashboard
              </button>
            </form>
          </div>

          <div className="bg-slate-50 p-10 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-6 hover:border-indigo-400 transition-colors h-full">
            <div className="p-5 bg-white rounded-2xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform duration-300">
              <Upload size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Batch Ledger Ingestion</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed font-semibold">Upload multiple period audit points using our standardized Truth-Table CSV schemas.</p>
            </div>
            
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <label className="cursor-pointer bg-white border border-slate-200 hover:border-indigo-300 px-6 py-4 rounded-2xl font-black text-xs text-slate-600 shadow-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest hover:text-indigo-600">
                <FileSpreadsheet size={18} />
                {csvUploadLoading ? 'Ingesting Schema...' : 'Select Ingestion CSV'}
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={(e) => handleCSVUpload(e, module)} 
                  disabled={csvUploadLoading}
                />
              </label>
              
              <button 
                onClick={() => downloadTemplate(module)}
                className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Download size={12} /> Get {module.toUpperCase()} Schema Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'recovery': return renderModuleForm(ModuleType.REVENUE_RECOVERY);
      case 'delivery': return renderModuleForm(ModuleType.DELIVERY_RECON);
      case 'audit': return renderModuleForm(ModuleType.CC_AUDIT);
      case 'registry':
        return (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <Database size={24} className="text-indigo-600" /> KPI Governance Registry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formulas.map(f => (
                <div key={f.formulaId} className="p-6 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 -mr-8 -mt-8 rounded-full group-hover:scale-150 transition-transform" />
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">{f.module.replace('_', ' ')}</span>
                    <span className="text-[10px] font-bold text-slate-400">VER {f.version}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{f.name}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{f.description}</p>
                  <code className="block p-3 bg-slate-900 text-indigo-300 rounded-xl text-[10px] font-mono border border-slate-800">{f.expression}</code>
                </div>
              ))}
            </div>
          </div>
        );
      case 'vault':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className={`p-16 rounded-[3rem] border-2 transition-all flex flex-col items-center text-center space-y-8 ${isVaultLocked ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100' : 'bg-amber-50 border-amber-200 shadow-amber-100'} shadow-2xl`}>
                <div className="p-6 bg-white rounded-[2rem] shadow-sm">
                  {isVaultLocked ? <Lock size={64} className="text-emerald-600" /> : <Unlock size={64} className="text-amber-600" />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    Certified Truth Vault
                  </h2>
                  <p className="text-slate-600 mt-4 max-w-md font-medium text-sm leading-relaxed">
                    {isVaultLocked 
                      ? "The period vault is cryptographically sealed. Audit trails are now immutable for regulatory review and AI ingestion."
                      : "The period vault is open. Formulas can be modified for the current audit window. Lock to generate the immutable hash."}
                  </p>
                </div>
                <button 
                  onClick={() => setIsVaultLocked(!isVaultLocked)}
                  className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                    isVaultLocked 
                    ? 'bg-rose-600 text-white hover:bg-rose-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isVaultLocked ? 'Release Audit Seal' : 'Lock & Seal Period Vault'}
                </button>
                {isVaultLocked && (
                  <div className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-4 py-2 rounded-full border border-emerald-200 animate-pulse">
                    SHA-256: {Math.random().toString(16).substr(2, 32).toUpperCase()}
                  </div>
                )}
             </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl">
            <div className="p-6 bg-slate-50 rounded-full inline-block mb-6">
              <HistoryIcon size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">System Integrity Log</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto font-medium">Temporal modifications to the truth-table environment are recorded here for multi-vector verification.</p>
            <div className="mt-12 max-w-2xl mx-auto space-y-3">
              {metrics.length > 0 ? metrics.map((m, i) => (
                <div key={m.metricId} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 text-left shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry ID: {m.metricId}</div>
                      <div className="text-sm font-bold text-slate-700">{m.module.replace('_', ' ').toUpperCase()} SIMULATION</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{new Date(m.calculationDate).toLocaleTimeString()}</div>
                </div>
              )) : (
                <div className="py-20 text-slate-300 italic font-medium">No activity recorded in current session.</div>
              )}
            </div>
          </div>
        );
      default: return renderDashboard();
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      userName={user?.firstName || ''} 
      onLogout={handleLogout}
      dateRange={dateRange}
      setDateRange={setDateRange}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

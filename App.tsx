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
  Award,
  X,
  Target,
  Search,
  CheckCircle
} from 'lucide-react';
import Layout from './components/Layout.tsx';
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
} from './types.ts';
import { STANDARD_FORMULAS, CSV_TEMPLATES } from './constants.tsx';
import { geminiService } from './services/geminiService.ts';

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
  const [hoveredPipelineStage, setHoveredPipelineStage] = useState<number | null>(null);

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

  const pipelineStages = [
    { stage: '01', title: 'Truth Capture', desc: 'Immutable ingestion of raw transactional data.' },
    { stage: '02', title: 'Semantic Alignment', desc: 'Normalizing temporal drift and mapping vendor fields.' },
    { stage: '03', title: 'Detection Engine', desc: 'Running Pattern audits to identify leakage.' },
    { stage: '04', title: 'Action Gating', desc: 'Trust-based firewall that enables automated workflows.' },
    { stage: '05', title: 'Certification', desc: 'Generation of audit-grade ledgers for booking.' }
  ];

  const renderLandingPage = () => (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-indigo-100">
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
          <button onClick={() => { setShowLanding(false); setActiveTab('help'); }} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><HelpCircle size={14} /> Help</button>
        </div>
      </nav>

      <main className="pt-32 pb-24 container mx-auto px-12 max-w-6xl">
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
            <button onClick={() => { setShowLanding(false); setActiveTab('help'); }} className="bg-white border border-slate-200 px-10 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
              Explore Case Studies
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div onClick={() => { setShowLanding(false); setOnboardingStep(1); }} className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
            <div className="w-12 h-12 bg-[#D1FAE5] text-[#059669] rounded-2xl flex items-center justify-center mb-8"><Shield size={24} /></div>
            <h3 className="text-3xl font-black mb-6 tracking-tight">Data Integrity Protocol</h3>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              Real-time validation against US restaurant ontology standards. Our engine enforces deterministic truth across every ingestion layer.
            </p>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-slate-50 rounded-full -mb-24 -mr-24 opacity-50 transition-transform group-hover:scale-125 duration-700" />
          </div>

          <div onClick={() => { setShowLanding(false); setOnboardingStep(1); }} className="md:col-span-2 bg-[#2563EB] text-white rounded-[2.5rem] p-12 shadow-2xl hover:shadow-indigo-200 transition-all duration-500 group cursor-pointer relative flex flex-col">
            <TrendingUp size={48} className="mb-10 text-white/50" />
            <h3 className="text-3xl font-black mb-6 tracking-tight">Revenue Recovery</h3>
            <p className="text-blue-100 font-medium leading-relaxed mb-auto">
              Quantify leakage from unclosed checks, vendor fee variances, and labor drift in minutes.
            </p>
            <button className="mt-12 bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest inline-flex items-center justify-center gap-2 transition-colors">
              Test Recovery <ArrowRight size={16} />
            </button>
          </div>

          <div className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-12 shadow-sm flex items-center justify-between group overflow-hidden">
            <div className="max-w-md w-full">
              <h3 className="text-2xl font-black mb-4 tracking-tight">Technical Pipeline Lifecycle</h3>
              <div className="min-h-[100px] mb-8">
                {hoveredPipelineStage !== null ? (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">Stage {pipelineStages[hoveredPipelineStage].stage}</span>
                       <span className="font-bold text-slate-800 text-sm">{pipelineStages[hoveredPipelineStage].title}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      {pipelineStages[hoveredPipelineStage].desc}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    From Immutable Truth Capture to Audit-Grade Certification. Our 5-stage engine is designed for high-stakes restaurant finance. Hover stages to explore.
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {pipelineStages.map((s, i) => (
                  <div 
                    key={i} 
                    onMouseEnter={() => setHoveredPipelineStage(i)}
                    onMouseLeave={() => setHoveredPipelineStage(null)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-300 cursor-pointer ${
                      hoveredPipelineStage === i 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block shrink-0">
              <Layers size={80} className={`transition-all duration-700 ${hoveredPipelineStage !== null ? 'text-blue-500 scale-110 rotate-12' : 'text-slate-100 group-hover:text-indigo-50'}`} />
            </div>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-12 py-12 border-t border-slate-100 mt-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div>(c) 2026 FohBoh.ai, Inc. All Rights Reserved. US Patent Pending.</div>
        <div className="flex gap-10 mt-6 md:mt-0">
          <a href="#" className="hover:text-slate-800 transition-colors">Contact Us</a>
          <a href="#" className="hover:text-slate-800 transition-colors">Terms & Conditions</a>
          <a href="#" className="hover:text-slate-800 transition-colors">API Docs</a>
        </div>
      </footer>
    </div>
  );

  const renderHelp = () => (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      <div className="bg-[#0F172A] p-8 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black">F</div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-60">MGE Resource Center</div>
            <div className="text-xl font-bold tracking-tight">INTELLIGENCE & FRAMEWORK</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Handbook</button>
          <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
      </div>

      <div className="p-16 border-b border-slate-100">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-12 leading-tight max-w-3xl">
          The Kitchen vs. The Boardroom: <br />
          <span className="text-[#3B82F6]">Why Your Restaurant AI Needs a Single Source of Truth</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest border-l-2 border-rose-500 pl-4 mb-4">The Danger of Assuming You Are Right</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              In the era of Artificial Intelligence, assuming the answers to your data queries are accurate is dangerous. The biggest barrier to successfully adopting AI isn't the technology; it is the "Data Trust Gap".
            </p>
          </div>
          <div className="bg-slate-50 p-10 rounded-[2rem] border border-slate-100 flex items-center italic text-lg text-slate-700 font-semibold leading-relaxed">
            "When you feed conflicting definitions into generative AI models, you don't get intelligence. You accelerate bad decisions -- like mispricing a menu or under-calculating a shift -- and scale that chaos across your entire chain."
          </div>
        </div>
      </div>
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business Email</label>
                    <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="operator@rest.com" />
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
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operator Password</label>
                      <input required type="password" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Executive Summary</h2>
          <p className="text-slate-500 text-sm">Audit Period: {dateRange.start} -- {dateRange.end}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer size={16} /> Print Report
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-shadow shadow-md">
            <Download size={16} /> Download CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recoverable Capital</div>
              <div className="text-2xl font-bold text-slate-900">${dashboard.performance.totalFoundMoney.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-widest text-xs">
            <FileText size={16} className="text-indigo-600" /> Transactional Ledger
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Metric ID</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentMetrics.map((m) => (
                <tr key={m.metricId} className="hover:bg-slate-50 transition-colors text-xs">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{m.metricId}</td>
                  <td className="px-6 py-4 capitalize">{m.module.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-black">${m.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${m.isCertified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {m.isCertified ? 'CERTIFIED' : 'REVIEW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'help': return renderHelp();
      default: return renderDashboard();
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} userName={user?.firstName || ''} onLogout={handleLogout} dateRange={dateRange} setDateRange={setDateRange}>
      {renderContent()}
    </Layout>
  );
};

export default App;
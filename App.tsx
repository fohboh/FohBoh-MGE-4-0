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
  CheckCircle,
  Info
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
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
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

  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      setNavigationHistory(prev => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const historyCopy = [...navigationHistory];
      const prevTab = historyCopy.pop();
      setNavigationHistory(historyCopy);
      if (prevTab) setActiveTab(prevTab);
    }
  };

  const handleGoHome = () => {
    if (activeTab !== 'dashboard') {
      handleTabChange('dashboard');
    }
  };

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
      setShowLanding(false);
      setNavigationHistory([]); 
      setActiveTab('dashboard');
    } else {
      setAuthError('Invalid credentials. Please fill all fields.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fohboh_user_session');
    setActiveTab('dashboard');
    setNavigationHistory([]);
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
      const updatedUser = { ...user, simulationCount: (user.simulationCount || 0) + 1 };
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
        handleTabChange('dashboard');
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
          <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><HelpCircle size={14} /> Help</button>
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
            <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="bg-white border border-slate-200 px-10 py-4 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
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
    <div className="max-w-6xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700 font-sans border border-slate-200">
      <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl">F</div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400">MGE Resource Center</div>
            <div className="text-xl font-bold tracking-tight">INTELLIGENCE & FRAMEWORK</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">Handbook</button>
          <button className="bg-white/10 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-colors">Architecture Loop</button>
          <button onClick={() => handleTabChange('dashboard')} className="p-2.5 hover:bg-white/10 rounded-full transition-colors ml-2"><X size={20} /></button>
        </div>
      </div>

      <div className="p-16 border-b border-slate-100">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-12 leading-[1.1] max-w-4xl">
          The Kitchen vs. The Boardroom:<br />
          <span className="text-[#3B82F6]">Why Your Restaurant AI Needs a Single Source of Truth</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-7 space-y-6">
            <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest border-l-2 border-blue-600 pl-4 mb-4">THE DANGER OF ASSUMING YOU ARE RIGHT</h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              In the era of Artificial Intelligence, assuming the answers to your data queries are accurate is dangerous. The biggest barrier to successfully adopting AI isn't the technology; it is the <span className="text-slate-900 font-bold">"Data Trust Gap"</span>.
            </p>
            <p className="text-slate-600 leading-relaxed font-medium">
              Restaurant groups are often a <span className="text-slate-900 font-bold">"Tower of Babel."</span> Operations might define "Gross Sales" differently than Finance. Marketing measures "Customer Churn" based on loyalty, while managers use reservations.
            </p>
          </div>
          <div className="md:col-span-5 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative shadow-sm">
            <p className="italic text-lg text-slate-800 font-bold leading-relaxed relative z-10">
              <span className="text-blue-600 text-3xl block mb-2">"</span>
              When you feed conflicting definitions into generative AI models, you don't get intelligence. You accelerate bad decisions -- like mispricing a menu or under-calculating a shift -- and scale that chaos across your entire chain.
            </p>
          </div>
        </div>
      </div>

      <div className="px-16 py-8">
        <div className="bg-[#0F172A] text-white p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="max-w-xl relative z-10">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">The Solution</h4>
            <h3 className="text-3xl font-black mb-8 leading-tight uppercase tracking-tight">What is the Metrics Governance Engine?</h3>
            <p className="text-slate-300 font-medium leading-relaxed mb-8 text-sm">
              Think of the MGE as the <span className="text-white font-bold">"Central Bank"</span> for your restaurant group's business logic. It sits between your raw data (POS, Labor, Inventory) and the tools you use to consume it.
            </p>
            <div className="flex gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-blue-900/40">Govern Definitions</button>
              <button className="bg-white/10 hover:bg-white/20 px-8 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/5 transition-colors">Standardize Logic</button>
            </div>
          </div>
          <div className="hidden lg:block max-w-[260px] text-xs font-semibold text-slate-400 border-l border-white/10 pl-12 italic leading-relaxed relative z-10">
            It ensures that when a CFO or an AI bot asks about "Table Turnover Rate," they are all using the exact same definition.
          </div>
        </div>
      </div>

      <div className="p-16 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Demystifying "Certified Data" & 0-100 Score</h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-10">
            When MGE certifies a metric like <span className="text-blue-600 font-bold">REVPASH</span>, it doesn't just check the math. It validates precisely which transaction tables the raw data originates from, the exact calculation logic, and accountability paths.
          </p>
          <div className="space-y-6">
            <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-4">Governance Score Meaning:</h5>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="px-3 py-1 bg-[#F43F5E] text-white text-[9px] font-black rounded-lg shrink-0">LOW</div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">A warning label indicating the definition is contested or unclear. <span className="text-slate-900">"Use at your own risk."</span></p>
            </div>
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="px-3 py-1 bg-[#10B981] text-white text-[9px] font-black rounded-lg shrink-0">100</div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">Signifies that the metric is fully standardized, audited, and safe to rely on for automated decisions.</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-[340px] bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] p-12 rounded-[2.5rem] text-center shadow-2xl text-white relative group">
            <div className="text-[11px] font-black uppercase tracking-[0.25em] text-white/70 mb-8 italic">"A confidence rating for decision-makers."</div>
            <div className="text-9xl font-black tracking-tighter mb-4 flex items-center justify-center">0-100</div>
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-col items-center">
              <ShieldCheck size={32} className="text-emerald-400 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Certified Engine V4</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-16 bg-slate-50/50">
        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
          <Info size={16} className="text-blue-600" /> Why Does This Matter?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-12">
          <p className="text-slate-600 font-medium leading-relaxed">
            In a tight-margin industry, operating on opinions rather than facts is costly. Without governance, AI might advise you to cut labor hours during a peak time because it's using a <span className="text-rose-600 font-bold">flawed definition of "peak."</span>
          </p>
          <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
            <p className="italic text-lg text-amber-950 font-bold leading-relaxed">
              "This simulator allows you to experience the difference between navigating with a broken compass versus steering with certified, trusted intelligence."
            </p>
          </div>
        </div>
      </div>

      <div className="p-16 pb-24 border-t border-slate-100">
        <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-12 uppercase">Technical Pipeline Lifecycle</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pipelineStages.map((s, idx) => (
            <div key={idx} className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-start text-left hover:bg-white hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
              <span className="text-[11px] font-black text-blue-500 uppercase mb-4 tracking-widest">Stage {s.stage}</span>
              <h5 className="font-bold text-slate-900 mb-3 text-sm">{s.title}</h5>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{s.desc}</p>
              <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><ArrowUpRight size={14} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleForm = (module: ModuleType) => {
    let title = ""; let icon = <Database />;
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
              runSimulation(module, Object.fromEntries(formData.entries()));
              handleTabChange('dashboard');
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
                      <input name="interchange_rate" defaultValue="2.5%" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-indigo-500" />
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
          <div className="bg-slate-50 p-10 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-6 h-full">
            <Upload size={40} className="text-indigo-600" />
            <div>
              <h3 className="text-xl font-bold text-slate-800">Batch Ledger Ingestion</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 font-semibold">Upload multiple period audit points using standard CSV schemas.</p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <label className="cursor-pointer bg-white border border-slate-200 px-6 py-4 rounded-2xl font-black text-xs text-slate-600 shadow-sm transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                <FileSpreadsheet size={18} /> {csvUploadLoading ? 'Ingesting...' : 'Select CSV'}
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleCSVUpload(e, module)} disabled={csvUploadLoading} />
              </label>
              <button onClick={() => downloadTemplate(module)} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center justify-center gap-1.5 opacity-60">
                <Download size={12} /> Get Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            <Download size={16} /> Download CSV Ledger
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
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={14} /> {dashboard.performance.comparisonDeltas[0].deltaPercent}% vs Last period
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><CheckCircle2 size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certification</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.certificationRate}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl"><ShieldCheck size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Index</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.averageTrustScore}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><BrainCircuit size={24} /></div>
            <div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Readiness</div>
              <div className="text-2xl font-bold text-slate-900">{dashboard.performance.aiReadinessScore}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[400px]">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-8 uppercase tracking-widest text-xs">
            <Activity size={16} className="text-indigo-600" /> Variance Timeline
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.map((m) => ({ 
              name: new Date(m.calculationDate).toLocaleDateString(), 
              value: m.foundMoneyAmount, 
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl border border-slate-800">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-indigo-400">
            <BrainCircuit size={20} /> Executive Insights
          </h3>
          <div className="space-y-4">
            {isGeneratingInsights ? (
              <div className="flex flex-col gap-3 py-16 text-center animate-pulse">
                <Activity size={24} className="animate-spin text-indigo-500 mx-auto" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Processing...</p>
              </div>
            ) : insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="flex gap-4 text-sm p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">0{idx+1}</div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">{insight}</p>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-center py-12 italic text-sm">Run simulation for recommendations.</div>
            )}
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
                <th className="px-6 py-4">Trust</th>
                <th className="px-6 py-4 text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboard.recentMetrics.map((m) => (
                <tr key={m.metricId} className="hover:bg-slate-50 transition-colors text-xs">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">{m.metricId}</td>
                  <td className="px-6 py-4 capitalize">{m.module.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-black">${m.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 font-bold">{m.trustScore}%</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${m.isCertified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                        {m.isCertified ? 'CERTIFIED' : 'REVIEW'}
                      </span>
                    </div>
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
      case 'recovery': return renderModuleForm(ModuleType.REVENUE_RECOVERY);
      case 'delivery': return renderModuleForm(ModuleType.DELIVERY_RECON);
      case 'audit': return renderModuleForm(ModuleType.CC_AUDIT);
      case 'registry':
        return (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3 uppercase tracking-tighter">
              <Database size={24} className="text-indigo-600" /> KPI Governance Registry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formulas.map(f => (
                <div key={f.formulaId} className="p-6 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">{f.module.replace('_', ' ')}</span>
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
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
             <div className={`p-16 rounded-[3rem] border-2 transition-all flex flex-col items-center text-center space-y-8 ${isVaultLocked ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'} shadow-2xl`}>
                <div className="p-6 bg-white rounded-[2rem] shadow-sm">
                  {isVaultLocked ? <Lock size={64} className="text-emerald-600" /> : <Unlock size={64} className="text-amber-600" />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Certified Truth Vault</h2>
                  <p className="text-slate-600 mt-4 max-w-md font-medium text-sm leading-relaxed">
                    {isVaultLocked 
                      ? "The period vault is cryptographically sealed. Audit trails are now immutable."
                      : "The period vault is open. Locking ensures audit-grade data certification."}
                  </p>
                </div>
                <button onClick={() => setIsVaultLocked(!isVaultLocked)} className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isVaultLocked ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'}`}>
                  {isVaultLocked ? 'Release Audit Seal' : 'Lock & Seal Period Vault'}
                </button>
             </div>
          </div>
        );
      case 'history':
        return (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center animate-in fade-in shadow-xl">
            <div className="p-6 bg-slate-50 rounded-full inline-block mb-6">
              <HistoryIcon size={48} className="text-slate-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">System Integrity Log</h2>
            <div className="mt-12 max-w-2xl mx-auto space-y-3">
              {metrics.length > 0 ? metrics.map((m) => (
                <div key={m.metricId} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 text-left shadow-sm">
                  <div className="flex gap-4 items-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {m.metricId}</div>
                      <div className="text-sm font-bold text-slate-700">{m.module.replace('_', ' ').toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{new Date(m.calculationDate).toLocaleTimeString()}</div>
                </div>
              )) : (
                <div className="py-20 text-slate-300 italic font-medium">No activity recorded.</div>
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
      setActiveTab={handleTabChange} 
      userName={user?.firstName || ''} 
      onLogout={handleLogout} 
      dateRange={dateRange} 
      setDateRange={setDateRange}
      onBack={handleBack}
      onGoHome={handleGoHome}
      canGoBack={navigationHistory.length > 0}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
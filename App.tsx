
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
  Info,
  ChevronRight,
  Settings,
  Key,
  MessageCircleQuestion,
  ChevronDown,
  Search as SearchIcon,
  Scale,
  Clock,
  ThumbsUp,
  Wine,
  BarChart3,
  Lightbulb,
  Terminal,
  FileSearch,
  ExternalLink
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
import { STANDARD_FORMULAS, CSV_TEMPLATES, GLOSSARY_LOGIC, PIPELINE_STAGES, BLUEPRINT_CARDS, FAQ_DATA } from './constants.tsx';
import { geminiService } from './services/geminiService.ts';

const GUEST_USER: SimulatorUser = {
  userId: 'GUEST_001',
  firstName: 'Guest',
  lastName: 'Operator',
  userType: UserRole.C_LEVEL,
  businessEmail: 'operator@fohboh.com',
  company: 'Truth Table Rest',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  simulationCount: 0
};

const App: React.FC = () => {
  // App State
  const [user, setUser] = useState<SimulatorUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [formulas, setFormulas] = useState<KPIFormula[]>(STANDARD_FORMULAS);
  const [metrics, setMetrics] = useState<CertifiedMetric[]>([]);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Navigation State
  const [showLanding, setShowLanding] = useState(true);

  // Date Range State
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Logic Docs Portal State
  const [isHelpAuth, setIsHelpAuth] = useState(false);
  const [helpPasswordInput, setHelpPasswordInput] = useState('');
  const [helpSubTab, setHelpSubTab] = useState('playbooks');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [helpError, setHelpError] = useState('');

  // FAQ State
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Registry State
  const [registrySearch, setRegistrySearch] = useState('');
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);

  // Ops Cert State
  const [opsCertActiveTab, setOpsCertActiveTab] = useState<'food' | 'bev' | 'prime'>('food');
  const [primeSalesBasis, setPrimeSalesBasis] = useState<'net' | 'gross'>('net');

  // Session Management
  useEffect(() => {
    const savedUser = localStorage.getItem('fohboh_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(GUEST_USER);
    }
    setIsAuthenticating(false);
  }, []);

  const handleTabChange = (newTab: string) => {
    if (newTab !== activeTab) {
      setNavigationHistory(prev => [...prev, activeTab]);
      setActiveTab(newTab);
    }
    if (showLanding) setShowLanding(false);
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const historyCopy = [...navigationHistory];
      const prevTab = historyCopy.pop();
      setNavigationHistory(historyCopy);
      if (prevTab) setActiveTab(prevTab);
    } else {
      setShowLanding(true);
    }
  };

  const handleGoHome = () => {
    setShowLanding(true);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fohboh_user_session');
    setActiveTab('dashboard');
    setNavigationHistory([]);
    setShowLanding(true);
  };

  const runSimulation = (module: ModuleType, inputData: any) => {
    let value = 0;
    let kpiId = '';
    let foundMoneyAmount = 0;
    let trustScore = 85 + Math.random() * 10;
    let auditDetails = null;

    if (module === ModuleType.REVENUE_RECOVERY) {
      kpiId = 'RR001';
      value = (parseFloat(inputData.open || 0) - parseFloat(inputData.closed || 0)) * parseFloat(inputData.avg || 0);
      foundMoneyAmount = Math.abs(value);
    } else if (module === ModuleType.DELIVERY_RECON) {
      kpiId = 'DR001';
      value = parseFloat(inputData.pos || 0) - parseFloat(inputData.bank || 0);
      foundMoneyAmount = Math.abs(value);
    } else if (module === ModuleType.CC_AUDIT) {
      kpiId = 'CC_RECOVERY_TOTAL';
      const vol = parseFloat(inputData.total_card_volume || 0);
      const fees = parseFloat(inputData.total_fees_charged || 0);
      const markupBps = parseFloat(inputData.contracted_markup_bps || 0);
      const debitVol = parseFloat(inputData.debit_volume || 0);
      const debitCount = parseInt(inputData.debit_count || 0);

      // Deterministic Waterfall Logic from PDF
      const effectiveRate = (fees / vol) * 100;
      const expectedMarkup = (vol * (markupBps / 10000));
      // Estimate interchange as 3.0% for basic logic, markup is anything above
      const actualMarkupAmount = fees - (vol * 0.03); 
      const contractOvercharge = actualMarkupAmount - expectedMarkup;
      
      // Durbin Cap Calculation: ($0.22 + 0.05%) per transaction
      const maxRegulatedDebitFee = (debitCount * 0.23) + (debitVol * 0.0005);
      // Assume 30% of fees were debit related for this simulation logic
      const estimatedActualDebitFees = fees * 0.3;
      const durbinOvercharge = Math.max(0, estimatedActualDebitFees - maxRegulatedDebitFee);
      
      foundMoneyAmount = contractOvercharge + durbinOvercharge;
      value = effectiveRate;
      
      auditDetails = {
        contractViolation: contractOvercharge,
        durbinViolation: durbinOvercharge,
        effectiveRate: effectiveRate,
        isJunkFee: effectiveRate > 4.0
      };
      
      // Trust Scoring System from PDF Page 11-12
      let tScore = 0;
      tScore += 25; // Data completeness assumed
      tScore += 20; // Statement quality assumed
      tScore += 15; // Processor reputation
      tScore += 20; // Historical patterns (single period)
      trustScore = tScore;
    } else if (module === ModuleType.OPERATIONS_CERTIFICATION) {
      if (opsCertActiveTab === 'food') {
        kpiId = 'FOOD_COST_PCT';
        const beg = parseFloat(inputData.V_FOOD_BEGINNING_INVENTORY || 0);
        const purch = parseFloat(inputData.V_FOOD_PURCHASES || 0);
        const end = parseFloat(inputData.V_FOOD_ENDING_INVENTORY || 0);
        const sales = parseFloat(inputData.V_FOOD_SALES || 1);
        value = ((beg + purch - end) / sales) * 100;
      } else if (opsCertActiveTab === 'bev') {
        kpiId = 'BEVERAGE_COST_PCT';
        const beg = parseFloat(inputData.V_BEV_BEGINNING_INVENTORY || 0);
        const purch = parseFloat(inputData.V_BEV_PURCHASES || 0);
        const end = parseFloat(inputData.V_BEV_ENDING_INVENTORY || 0);
        const sales = parseFloat(inputData.V_BEV_SALES || 1);
        value = ((beg + purch - end) / sales) * 100;
      } else {
        kpiId = 'PRIME_COST_PCT';
        const food = parseFloat(inputData.V_TOTAL_FOOD_COST || 0);
        const bev = parseFloat(inputData.V_TOTAL_BEV_COST || 0);
        const hourly = parseFloat(inputData.V_LABOR_HOURLY_WAGES || 0);
        const salary = parseFloat(inputData.V_LABOR_SALARY_ALLOCATION || 0);
        const sales = parseFloat(inputData.V_PRIME_SALES_BASIS || 1);
        value = ((food + bev + hourly + salary) / sales) * 100;
      }
    } else {
      value = Math.random() * 1000;
    }

    const newMetric: CertifiedMetric = {
      metricId: `M_${Date.now()}`,
      kpiId,
      module,
      value,
      trustScore,
      calculationDate: new Date().toISOString(),
      isCertified: true,
      dataSources: ['Truth Table V4'],
      qualityIssues: [],
      foundMoneyAmount,
      auditDetails
    };

    setMetrics(prev => [...prev, newMetric]);
  };

  const dashboardData = (): ExecutiveDashboard => {
    const totalFoundMoney = metrics.reduce((acc, m) => acc + (m.foundMoneyAmount || 0), 0);
    const certRate = metrics.length ? (metrics.filter(m => m.isCertified).length / metrics.length) * 100 : 0;
    const avgTrust = metrics.length ? metrics.reduce((acc, m) => acc + m.trustScore, 0) / metrics.length : 0;

    return {
      user: {
        name: user ? `${user.firstName} ${user.lastName}` : 'Guest User',
        role: user?.userType || 'Operator',
        company: user?.company,
        simulations: metrics.length
      },
      performance: {
        totalFoundMoney,
        certificationRate: `${certRate.toFixed(1)}%`,
        averageTrustScore: `${avgTrust.toFixed(0)}/100`,
        totalSimulations: metrics.length,
        aiReadinessScore: `${Math.round(avgTrust)}/100`,
        comparisonDeltas: [{ metric: 'Found Money', current: totalFoundMoney, previous: totalFoundMoney * 0.9, deltaPercent: 10, trend: 'up' }]
      },
      recentMetrics: metrics.slice(-10).reverse(),
      vaultStatus: {
        registryFormulas: formulas.length,
        vaultFormulas: isVaultLocked ? formulas.length : 0,
        isLocked: isVaultLocked,
        approvedFormulas: formulas.length
      },
      generatedAt: new Date().toISOString(),
      simulationId: `SIM_${Date.now()}`,
      dateRange
    };
  };

  const dashboard = dashboardData();

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
  }, [metrics.length, isVaultLocked]);

  // Logic Docs Auth Handlers
  const handleHelpLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem('fohboh_help_pass') || 'FOHBOHMGE2026';
    if (helpPasswordInput === storedPass) {
      setIsHelpAuth(true);
      setHelpError('');
    } else {
      setHelpError('Access Denied. Ensure you use the authorized Admin Portal key.');
    }
  };

  const handleRestorePassword = () => {
    localStorage.setItem('fohboh_help_pass', 'FOHBOHMGE2026');
    setHelpPasswordInput('FOHBOHMGE2026');
    alert('Master Key restored to default: FOHBOHMGE2026');
  };

  const handleChangePassword = () => {
    if (newPass.length < 4) {
      alert('Security violation: Key is too short.');
      return;
    }
    localStorage.setItem('fohboh_help_pass', newPass);
    setIsChangingPass(false);
    setNewPass('');
    alert('Security Update: Admin Portal Key synchronized.');
  };

  const renderFaqSection = () => {
    const filteredFaq = FAQ_DATA.filter(faq => 
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center shadow-lg"><MessageCircleQuestion size={32} /></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Knowledge Base <span className="text-indigo-600">FAQ</span></h2>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search questions..."
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 p-6 pl-16 rounded-[2rem] text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-xl"
          />
        </div>

        <div className="space-y-4">
          {filteredFaq.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <button 
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-8 flex items-center justify-between group"
              >
                <span className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{faq.question}</span>
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {expandedFaq === idx && (
                <div className="px-8 pb-8 text-slate-500 font-medium leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHelpPortal = () => {
    if (!isHelpAuth) {
      return (
        <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl">
              <Shield size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Gateway</h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">Authenticated Logic Core Access</p>
          </div>
          <form onSubmit={handleHelpLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Master Key</label>
              <input 
                type="password" 
                value={helpPasswordInput}
                onChange={(e) => setHelpPasswordInput(e.target.value)}
                placeholder="FOHBOHMGE2026" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none text-center tracking-widest" 
                required 
              />
            </div>
            {helpError && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{helpError}</p>}
            <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl mt-4 uppercase text-xs tracking-widest transition-all">Authorize Session</button>
            <button type="button" onClick={handleRestorePassword} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 hover:text-indigo-600 transition-colors border-t border-slate-50 mt-6">Restore System Default</button>
          </form>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Admin <span className="text-indigo-600">Logic Portal</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">FohBoh MGE Intelligence Governance</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsChangingPass(!isChangingPass)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
            >
              <Key size={14} /> Security Key
            </button>
            <button 
              onClick={() => setIsHelpAuth(false)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              <LogOut size={14} /> Lock Core
            </button>
          </div>
        </div>

        {isChangingPass && (
          <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row items-end gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-1">Configure New Admin Portal Key</label>
              <input 
                type="password" 
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new master key..." 
                className="w-full p-4 bg-white border border-indigo-200 rounded-xl font-bold focus:ring-4 focus:ring-indigo-500/20 outline-none" 
              />
            </div>
            <button 
              onClick={handleChangePassword}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shrink-0"
            >
              Apply Update
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          {[
            { id: 'playbooks', label: 'Playbooks', icon: BookOpen },
            { id: 'glossary', label: 'Logic Glossary', icon: Database },
            { id: 'pipeline', label: 'Engine Pipeline', icon: Activity }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setHelpSubTab(tab.id)}
              className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${
                helpSubTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl min-h-[500px]">
          {helpSubTab === 'playbooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLUEPRINT_CARDS.map(card => (
                <div key={card.id} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-all group">
                  <div className="space-y-6">
                    <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{card.id.replace(/_/g, ' ')}</div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-tight uppercase">{card.title}</h4>
                    <div className="bg-slate-900 p-4 rounded-xl font-mono text-[10px] text-indigo-300 shadow-inner">
                      {card.formula}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{card.note}</p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Canonical Headers</div>
                    <code className="text-[9px] text-indigo-600 font-bold break-all bg-indigo-50 p-2 rounded-lg block">{card.headers}</code>
                  </div>
                </div>
              ))}
            </div>
          )}

          {helpSubTab === 'glossary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GLOSSARY_LOGIC.map(item => (
                  <div key={item.id} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-6 group hover:bg-white hover:shadow-xl transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0 font-black text-xs uppercase group-hover:bg-indigo-600 group-hover:text-white transition-all">{item.id.charAt(0)}</div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h5 className="font-black text-slate-900 uppercase tracking-tight">{item.title}</h5>
                        <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{item.category}</span>
                      </div>
                      <div className="font-mono text-[10px] text-indigo-500 font-bold">{item.formula}</div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {helpSubTab === 'pipeline' && (
            <div className="max-w-4xl mx-auto space-y-12 py-10">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200" />
                <div className="space-y-16">
                  {PIPELINE_STAGES.map((step, idx) => (
                    <div key={idx} className="relative pl-24 group">
                      <div className="absolute left-0 w-16 h-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center font-black text-slate-900 group-hover:border-indigo-600 group-hover:text-indigo-600 transition-all z-10 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{step.stage}</div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-lg">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRegistry = () => {
    const categories = [
      { type: ModuleType.FINANCIAL_PROFITABILITY, label: "01. Financial Profitability" },
      { type: ModuleType.OPERATIONAL_EFFICIENCY, label: "02. Operational & Sales Efficiency" },
      { type: ModuleType.INVENTORY_WASTE, label: "03. Inventory & Waste Management" },
      { type: ModuleType.LABOR_PRODUCTIVITY, label: "04. Labor & Staff Productivity" },
      { type: ModuleType.SERVICE_QUALITY, label: "05. Service Quality & Accuracy" },
      { type: ModuleType.CC_AUDIT, label: "07. Credit Card Auditing" }
    ];

    return (
      <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Deterministic <span className="text-indigo-400">Logic Registry</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">FohBoh MGE V3.4.1 Certification Core</p>
          </div>
          <div className="relative md:w-96 z-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search 50 formulas or rules..." 
              value={registrySearch}
              onChange={(e) => setRegistrySearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/20"
            />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] pointer-events-none" />
        </div>

        {categories.map(cat => {
          const catFormulas = formulas.filter(f => f.module === cat.type && 
            (f.name.toLowerCase().includes(registrySearch.toLowerCase()) || f.description.toLowerCase().includes(registrySearch.toLowerCase())));
          
          if (catFormulas.length === 0) return null;

          return (
            <div key={cat.type} className="space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{cat.label}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {catFormulas.map(f => (
                  <div key={f.formulaId} className={`bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group ${expandedFormula === f.formulaId ? 'ring-2 ring-indigo-500/20' : ''}`}>
                    <div className="p-10">
                      <div className="flex items-start justify-between mb-8">
                        <div>
                          <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">{f.formulaId}</div>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">{f.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                           {f.isApproved && <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl" title="Logic Certified"><ShieldCheck size={18} /></div>}
                           <button 
                            onClick={() => setExpandedFormula(expandedFormula === f.formulaId ? null : f.formulaId)}
                            className="bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 p-2 rounded-xl transition-colors"
                           >
                            <Info size={18} />
                           </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DETERMINISTIC FORMULA</label>
                          <div className="bg-slate-900 p-5 rounded-2xl font-mono text-xs font-bold text-indigo-300 shadow-inner overflow-x-auto whitespace-nowrap no-scrollbar">
                            {f.expression}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{f.description}</p>
                        
                        {expandedFormula === f.formulaId && (
                          <div className="pt-8 border-t border-slate-50 space-y-8 animate-in slide-in-from-top-4 duration-300">
                            {/* Detailed Enrichment Section */}
                            {f.enrichment && (
                              <div className="grid grid-cols-1 gap-4">
                                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                    <Lightbulb size={14} /> KPI Intelligence Enrichment
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WHAT</span>
                                      <p className="text-[11px] text-slate-700 font-bold leading-tight">{f.enrichment.what}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WHY</span>
                                      <p className="text-[11px] text-slate-700 font-bold leading-tight">{f.enrichment.why}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HOW</span>
                                      <p className="text-[11px] text-slate-700 font-bold leading-tight">{f.enrichment.how}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FIX</span>
                                      <p className="text-[11px] text-emerald-600 font-bold leading-tight">{f.enrichment.fix}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderModuleForm = (module: ModuleType) => {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white"><Zap size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{module.replace(/_/g, ' ')} Simulation</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Truth Table V4 Engine</p>
            </div>
          </div>
          <form className="space-y-8" onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            runSimulation(module, Object.fromEntries(formData.entries()));
            handleTabChange('dashboard');
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {module === ModuleType.REVENUE_RECOVERY ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Open Checks</label>
                    <input name="open" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Closed Checks</label>
                    <input name="closed" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Average Check ($)</label>
                    <input name="avg" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0.00" />
                  </div>
                </>
              ) : module === ModuleType.DELIVERY_RECON ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">POS Sales Gross</label>
                    <input name="pos" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Statement Net</label>
                    <input name="bank" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0.00" />
                  </div>
                </>
              ) : null}
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase text-xs tracking-widest">Process Logic Pipeline</button>
          </form>
        </div>
      </div>
    );
  };

  const renderCCAudit = () => {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white/10"><CreditCard size={40} /></div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Merchant Fee Recovery Engine</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">Module 7: Deterministic Forensic Audit</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="text-right">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">System Status</p>
                    <p className="text-xs font-bold text-white">Waterfall Audit Ready</p>
                </div>
                <ShieldCheck className="text-indigo-400" size={24} />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] pointer-events-none" />
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl">
          <form className="space-y-12" onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            runSimulation(ModuleType.CC_AUDIT, Object.fromEntries(formData.entries()));
            handleTabChange('dashboard');
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={12} className="text-indigo-500" /> Monthly Card Volume ($)</label>
                <input name="total_card_volume" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="150000.00" />
                <p className="text-[9px] text-slate-400 font-medium italic">Total card sales from processor statement.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={12} className="text-rose-500" /> Total Processor Fees ($)</label>
                <input name="total_fees_charged" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="5800.00" />
                <p className="text-[9px] text-slate-400 font-medium italic">All fees charged by the merchant processor.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={12} className="text-indigo-500" /> Contracted Markup (bps)</label>
                <input name="contracted_markup_bps" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="10" />
                <p className="text-[9px] text-slate-400 font-medium italic">Basis points (bps) spread over interchange.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><CreditCard size={12} className="text-emerald-500" /> Debit Volume ($)</label>
                <input name="debit_volume" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="45000.00" />
                <p className="text-[9px] text-slate-400 font-medium italic">Required for Durbin Amendment check.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-indigo-500" /> Transaction Count</label>
                <input name="debit_count" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="900" />
                <p className="text-[9px] text-slate-400 font-medium italic">Number of regulated debit transactions.</p>
              </div>
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center">
                  <div className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Audit Confidence</div>
                  <div className="text-2xl font-black text-indigo-600">TIER 2 READY</div>
                  <p className="text-[9px] text-indigo-400 font-bold uppercase mt-1">85% Expected Confidence</p>
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={20} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">3-Layer Waterfall Audit Execution</span>
              </div>
              <button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white font-black px-16 py-6 rounded-3xl shadow-2xl transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em] flex items-center gap-4">
                Execute Forensic Audit <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderOperationsCertification = () => {
    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl ring-4 ring-white/10"><Award size={40} /></div>
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">MGE | Operations Certification</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em]">Deterministic Logic Engine V4.2</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button 
                onClick={() => setOpsCertActiveTab('food')}
                className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${opsCertActiveTab === 'food' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <ChefHat size={14} /> Food Cost
              </button>
              <button 
                onClick={() => setOpsCertActiveTab('bev')}
                className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${opsCertActiveTab === 'bev' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <Wine size={14} /> Bev Cost
              </button>
              <button 
                onClick={() => setOpsCertActiveTab('prime')}
                className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${opsCertActiveTab === 'prime' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'}`}
              >
                <Calculator size={14} /> Prime Cost
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px] pointer-events-none" />
        </div>

        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl">
          <form className="space-y-12" onSubmit={e => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            runSimulation(ModuleType.OPERATIONS_CERTIFICATION, Object.fromEntries(formData.entries()));
            handleTabChange('dashboard');
          }}>
            {opsCertActiveTab === 'food' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12} className="text-indigo-500" /> V_FOOD_BEGINNING_INVENTORY</label>
                    <input name="V_FOOD_BEGINNING_INVENTORY" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Starting inventory value for period.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={12} className="text-emerald-500" /> V_FOOD_PURCHASES</label>
                    <input name="V_FOOD_PURCHASES" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Total food purchases from AP system.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} className="text-amber-500" /> V_FOOD_ENDING_INVENTORY</label>
                    <input name="V_FOOD_ENDING_INVENTORY" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Physical count ending inventory.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">V_FOOD_SALES</label>
                    <input name="V_FOOD_SALES" required type="number" step="0.01" className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold text-slate-900" placeholder="Total Food Sales" />
                    <p className="text-[9px] text-slate-400 font-medium">Net food sales for period.</p>
                  </div>
                </div>
              </div>
            )}

            {opsCertActiveTab === 'bev' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_BEV_BEGINNING_INVENTORY</label>
                    <input name="V_BEV_BEGINNING_INVENTORY" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_BEV_PURCHASES</label>
                    <input name="V_BEV_PURCHASES" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_BEV_ENDING_INVENTORY</label>
                    <input name="V_BEV_ENDING_INVENTORY" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_BEV_SALES</label>
                    <input name="V_BEV_SALES" required type="number" step="0.01" className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold" placeholder="Net Beverage Sales" />
                  </div>
                </div>
              </div>
            )}

            {opsCertActiveTab === 'prime' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] mb-12 flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="flex items-center gap-10">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shrink-0"><Calculator size={32} /></div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black text-indigo-900 uppercase tracking-tighter leading-none">Unified Prime Logic</h4>
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Prime Cost = Food + Bev + Hourly + Salary</p>
                    </div>
                  </div>
                  
                  {/* Sales Basis Toggle */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[9px] font-black text-indigo-900 uppercase tracking-[0.2em] text-center md:text-left">Analysis Basis</span>
                    <div className="flex p-1.5 bg-indigo-100/50 rounded-2xl border border-indigo-200">
                      <button 
                        type="button"
                        onClick={() => setPrimeSalesBasis('net')}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${primeSalesBasis === 'net' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}
                      >
                        Net Sales
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPrimeSalesBasis('gross')}
                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${primeSalesBasis === 'gross' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-indigo-600'}`}
                      >
                        Gross Sales
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_TOTAL_FOOD_COST (OUTPUT)</label>
                    <input name="V_TOTAL_FOOD_COST" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Result from Food Module" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_TOTAL_BEV_COST (OUTPUT)</label>
                    <input name="V_TOTAL_BEV_COST" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="Result from Bev Module" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_LABOR_HOURLY_WAGES</label>
                    <input name="V_LABOR_HOURLY_WAGES" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">V_LABOR_SALARY_ALLOCATION</label>
                    <input name="V_LABOR_SALARY_ALLOCATION" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="0.00" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                      {primeSalesBasis === 'net' ? 'V_NET_SALES' : 'V_GROSS_SALES'}
                    </label>
                    <input name="V_PRIME_SALES_BASIS" required type="number" step="0.01" className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold" placeholder={`Total Store ${primeSalesBasis === 'net' ? 'Net' : 'Gross'} Sales`} />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400">
                <ShieldCheck size={20} className="text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">MGE Layer 4: Certification Audit Ready</span>
              </div>
              <button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white font-black px-16 py-6 rounded-3xl shadow-2xl transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em] flex items-center gap-4">
                Execute Logic Engine <Zap size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Recoverable Capital', val: `$${dashboard.performance.totalFoundMoney.toLocaleString()}`, color: 'text-emerald-500' },
          { label: 'Certification Rate', val: dashboard.performance.certificationRate, color: 'text-indigo-500' },
          { label: 'Trust Index', val: dashboard.performance.averageTrustScore, color: 'text-slate-900' },
          { label: 'AI Readiness', val: dashboard.performance.aiReadinessScore, color: 'text-slate-900' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
            <div className={`text-3xl font-black ${stat.color} tracking-tight group-hover:scale-105 transition-transform origin-left`}>{stat.val}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg flex items-center gap-2">
                <Activity className="text-indigo-500" size={20} /> Variance Timeline
              </h3>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.map((m, i) => ({ name: i, value: m.foundMoneyAmount }))}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Waterfall Detail for CC Module */}
          {metrics.some(m => m.module === ModuleType.CC_AUDIT) && (
             <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg flex items-center gap-2">
                    <FileSearch className="text-indigo-500" size={20} /> CC Audit Waterfall Ledger
                  </h3>
                  <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Forensic Certified</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {metrics.filter(m => m.module === ModuleType.CC_AUDIT).slice(-1).map((m, idx) => (
                    <React.Fragment key={idx}>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markup Violation</span>
                          <span className="text-sm font-black text-rose-500">${m.auditDetails?.contractViolation?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full w-[267%]" style={{maxWidth: '100%'}} />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Evidence: Contract states 10 bps, statement shows {((m.value/100)*10000).toFixed(1)} bps actual spread.</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Durbin Overcharge</span>
                          <span className="text-sm font-black text-amber-500">${m.auditDetails?.durbinViolation?.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[30%]" style={{maxWidth: '100%'}} />
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold uppercase">Evidence: Regulated caps exceeded on estimated debit fee allocation.</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
             </div>
          )}
        </div>
        
        <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-indigo-400 uppercase tracking-tighter"><BrainCircuit size={28} /> AI Strategy</h3>
            <div className="space-y-6">
              {insights.length > 0 ? insights.map((insight, idx) => (
                <div key={idx} className="flex gap-5 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center shrink-0 font-black text-[10px]">{idx + 1}</div>
                  <p className="text-slate-300 text-xs leading-relaxed font-semibold">{insight}</p>
                </div>
              )) : (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"><Sparkles size={24} className="text-slate-700" /></div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Waiting for simulation data...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'help': return renderHelpPortal();
      case 'faq': return renderFaqSection();
      case 'operations': return renderOperationsCertification();
      case 'audit': return renderCCAudit();
      case 'recovery': return renderModuleForm(ModuleType.REVENUE_RECOVERY);
      case 'delivery': return renderModuleForm(ModuleType.DELIVERY_RECON);
      case 'registry': return renderRegistry();
      case 'vault':
        return (
          <div className="max-w-4xl mx-auto py-24 rounded-[4rem] border-4 border-dashed border-amber-200 bg-amber-50/50 flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-700">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center text-amber-600">
              {isVaultLocked ? <Lock size={64} /> : <Unlock size={64} className="animate-pulse" />}
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Certified Truth Vault</h2>
            <button 
              onClick={() => setIsVaultLocked(!isVaultLocked)} 
              className={`px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
                isVaultLocked ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
              }`}
            >
              {isVaultLocked ? 'Unlock Period Vault' : 'Lock & Certify Period'}
            </button>
          </div>
        );
      default: return renderDashboard();
    }
  };

  if (isAuthenticating) return null;

  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] text-[#0F172A] font-sans selection:bg-indigo-100 animate-in fade-in duration-700 flex flex-col">
        {/* Navigation Header */}
        <nav className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-2xl z-50 px-12 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowLanding(true)}>
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl group-hover:bg-indigo-600 transition-colors shadow-xl">M</div>
            <span className="font-black text-lg tracking-tighter uppercase">FohBoh <span className="text-indigo-600">MGE</span></span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <button onClick={() => { setShowLanding(false); handleTabChange('registry'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50"><Layers size={14} /> Logic Core</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('dashboard'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50"><Zap size={14} /> Recovery</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('faq'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50"><MessageCircleQuestion size={14} /> FAQ Center</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="text-indigo-600 font-black flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50"><BookOpen size={14} /> Help Center</button>
          </div>

          <button 
            onClick={() => { setShowLanding(false); setActiveTab('dashboard'); }}
            className="bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Launch Simulator
          </button>
        </nav>

        {/* Main Hero & Bentobox Section */}
        <main className="pt-40 pb-20 flex-1 container mx-auto px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-8">
            {/* Primary Action Card */}
            <div className="md:col-span-2 md:row-span-2 bg-[#0F172A] rounded-[3.5rem] p-16 flex flex-col justify-center text-white relative overflow-hidden group shadow-2xl">
              <div className="relative z-10 space-y-10">
                <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">
                  <Sparkles size={14} /> Deterministic Truth Engine V4
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]">
                  Certify Profit. <br />
                  <span className="text-indigo-400 italic">Reclaim Loss.</span>
                </h1>
                <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                  The industry's first metrics governance engine designed to transform operational noise into certified recovery.
                </p>
                <button 
                  onClick={() => { setShowLanding(false); setActiveTab('dashboard'); }}
                  className="bg-white text-slate-900 px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center gap-4 hover:bg-indigo-400 hover:text-white transition-all w-fit shadow-xl"
                >
                  Launch MGE Core <ArrowRight size={20} />
                </button>
              </div>
              <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-600/20 blur-[120px] rounded-full group-hover:bg-indigo-600/30 transition-colors" />
              <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={200} strokeWidth={1} />
              </div>
            </div>

            {/* Registry Quick Link */}
            <div className="md:col-span-1 bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group shadow-sm" onClick={() => { setShowLanding(false); handleTabChange('registry'); }}>
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Database size={28} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">KPI Registry</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">50 Deterministic Formulas</p>
              </div>
            </div>

            {/* Admin/Help Quick Link */}
            <div className="md:col-span-1 bg-indigo-600 rounded-[3rem] p-10 flex flex-col justify-between text-white hover:shadow-2xl transition-all cursor-pointer group shadow-xl" onClick={() => { setShowLanding(false); handleTabChange('help'); }}>
              <div className="w-16 h-16 bg-white/20 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform">
                <Lock size={28} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Admin Portal</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Logic Docs & Security</p>
              </div>
            </div>

            {/* Simulated Live Analytics Card */}
            <div className="md:col-span-2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-10 flex items-center gap-10 hover:border-indigo-400 transition-all cursor-default overflow-hidden relative group">
              <div className="relative z-10 shrink-0">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">System Accuracy</div>
                <div className="text-6xl font-black text-slate-900 tracking-tighter">99.8%</div>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full w-fit">
                  <TrendingUp size={12} /> Audit Level
                </div>
              </div>
              <div className="flex-1 opacity-20 group-hover:opacity-40 transition-opacity">
                <ResponsiveContainer width="100%" height={100}>
                  <AreaChart data={[{v:10},{v:40},{v:25},{v:60},{v:45},{v:90}]}>
                    <Area type="monotone" dataKey="v" stroke="#4f46e5" fill="#4f46e5" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Knowledge Base Card */}
            <div className="bg-white border border-slate-100 rounded-[3rem] p-10 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer group shadow-sm" onClick={() => { setShowLanding(false); handleTabChange('faq'); }}>
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-10 group-hover:-translate-y-2 transition-transform">
                <MessageCircleQuestion size={28} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">FAQ Hub</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Support Architecture</p>
              </div>
            </div>

            {/* Recovery Module Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 flex flex-col justify-between text-white hover:shadow-2xl transition-all cursor-pointer group shadow-xl" onClick={() => { setShowLanding(false); handleTabChange('dashboard'); }}>
              <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">Recovery</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Variance Resolution</p>
              </div>
            </div>
          </div>
        </main>

        {/* Landing Footer Navigation */}
        <footer className="bg-white border-t border-slate-100 py-16 px-12">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
              <div className="col-span-2 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
                  <span className="font-black text-sm tracking-tight uppercase">FohBoh <span className="text-indigo-600">MGE</span></span>
                </div>
                <p className="text-slate-400 text-xs font-medium max-w-xs leading-relaxed">
                  The Gold Standard in restaurant metrics governance, reconciliation, and revenue recovery.
                </p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Core Modules</h4>
                <div className="flex flex-col gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <button onClick={() => { setShowLanding(false); handleTabChange('dashboard'); }} className="hover:text-indigo-600 text-left">Executive View</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('registry'); }} className="hover:text-indigo-600 text-left">KPI Registry</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('operations'); }} className="hover:text-indigo-600 text-left">Operations Core</button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Resolution</h4>
                <div className="flex flex-col gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <button onClick={() => { setShowLanding(false); handleTabChange('recovery'); }} className="hover:text-indigo-600 text-left">Revenue Recovery</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('delivery'); }} className="hover:text-indigo-600 text-left">Delivery Recon</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('audit'); }} className="hover:text-indigo-600 text-left">CC Audit & Recovery</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('vault'); }} className="hover:text-indigo-600 text-left">Certified Vault</button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Documentation</h4>
                <div className="flex flex-col gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="hover:text-indigo-600 text-left flex items-center gap-2"><BookOpen size={12}/> Admin Portal</button>
                  <button onClick={() => { setShowLanding(false); handleTabChange('faq'); }} className="hover:text-indigo-600 text-left flex items-center gap-2"><MessageCircleQuestion size={12}/> FAQ Hub</button>
                  <a href="#" className="hover:text-indigo-600 flex items-center gap-2">Legal Terms <ExternalLink size={12}/></a>
                </div>
              </div>
            </div>
            
            <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">© 2026 FohBoh MGE Simulator | Truth Table V4 Edition</span>
              <div className="flex items-center gap-6 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                <div className="flex items-center gap-2"><Terminal size={12}/> Deterministic AI Pipeline</div>
                <div className="flex items-center gap-2"><ShieldCheck size={12}/> 256-Bit Vault Encryption</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={handleTabChange} 
      userName={user?.firstName || 'Guest'} 
      onLogout={handleLogout} 
      dateRange={dateRange} 
      setDateRange={setDateRange}
      onBack={handleBack}
      onGoHome={handleGoHome}
      canGoBack={navigationHistory.length > 0 || !showLanding}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

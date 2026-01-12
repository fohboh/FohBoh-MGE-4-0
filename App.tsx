
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
  BarChart3
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
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: UserRole.C_LEVEL
  });

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

  // Session Management
  useEffect(() => {
    const savedUser = localStorage.getItem('fohboh_user_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
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
    setActiveTab('dashboard');
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
    const trustScore = 85 + Math.random() * 10;

    if (module === ModuleType.REVENUE_RECOVERY) {
      kpiId = 'RR001';
      value = (parseFloat(inputData.open || 0) - parseFloat(inputData.closed || 0)) * parseFloat(inputData.avg || 0);
    } else if (module === ModuleType.DELIVERY_RECON) {
      kpiId = 'DR001';
      value = parseFloat(inputData.pos || 0) - parseFloat(inputData.bank || 0);
    } else if (module === ModuleType.OPERATIONS_CERTIFICATION) {
      // Logic from PDF documentation
      if (opsCertActiveTab === 'food') {
        kpiId = 'OPS_FOOD_001';
        const beg = parseFloat(inputData.V_FOOD_BEGINNING_INVENTORY || 0);
        const purch = parseFloat(inputData.V_FOOD_PURCHASES || 0);
        const transIn = parseFloat(inputData.V_FOOD_TRANSFERS_IN || 0);
        const transOut = parseFloat(inputData.V_FOOD_TRANSFERS_OUT || 0);
        const end = parseFloat(inputData.V_FOOD_ENDING_INVENTORY || 0);
        const emp = parseFloat(inputData.V_FOOD_EMPLOYEE_MEALS || 0);
        const sales = parseFloat(inputData.V_FOOD_SALES || 1);
        
        const foodCost = (beg + purch + transIn - transOut - end - emp);
        value = (foodCost / sales) * 100;
      } else if (opsCertActiveTab === 'bev') {
        kpiId = 'OPS_BEV_001';
        const beg = parseFloat(inputData.V_BEV_BEGINNING_INVENTORY || 0);
        const purch = parseFloat(inputData.V_BEV_PURCHASES || 0);
        const transIn = parseFloat(inputData.V_BEV_TRANSFERS_IN || 0);
        const transOut = parseFloat(inputData.V_BEV_TRANSFERS_OUT || 0);
        const end = parseFloat(inputData.V_BEV_ENDING_INVENTORY || 0);
        const sales = parseFloat(inputData.V_BEV_SALES || 1);
        
        const bevCost = (beg + purch + transIn - transOut - end);
        value = (bevCost / sales) * 100;
      } else {
        kpiId = 'OPS_PRIME_001';
        const food = parseFloat(inputData.V_TOTAL_FOOD_COST || 0);
        const bev = parseFloat(inputData.V_TOTAL_BEV_COST || 0);
        const hourly = parseFloat(inputData.V_LABOR_HOURLY_WAGES || 0);
        const salary = parseFloat(inputData.V_LABOR_SALARY_ALLOCATION || 0);
        const sales = parseFloat(inputData.V_NET_SALES || 1);
        
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
      foundMoneyAmount: Math.abs(value)
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
      setHelpError('Unauthorized Access. Invalid Credentials.');
    }
  };

  const handleRestorePassword = () => {
    localStorage.setItem('fohboh_help_pass', 'FOHBOHMGE2026');
    alert('Password restored to default: FOHBOHMGE2026');
    setHelpPasswordInput('FOHBOHMGE2026');
  };

  const handleChangePassword = () => {
    if (newPass.length < 4) {
      alert('Password too short.');
      return;
    }
    localStorage.setItem('fohboh_help_pass', newPass);
    setIsChangingPass(false);
    setNewPass('');
    alert('Password updated successfully.');
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
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Gateway</h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">Restricted Logic Documentation Portal</p>
          </div>
          <form onSubmit={handleHelpLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Access Key</label>
              <input 
                type="password" 
                value={helpPasswordInput}
                onChange={(e) => setHelpPasswordInput(e.target.value)}
                placeholder="••••••••••••" 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none" 
                required 
              />
            </div>
            {helpError && <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{helpError}</p>}
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl mt-4 uppercase text-xs tracking-widest transition-all">Authenticate Session</button>
            <button type="button" onClick={handleRestorePassword} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4 hover:text-indigo-600 transition-colors">Restore Default Access</button>
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
              <Key size={14} /> Security
            </button>
            <button 
              onClick={() => setIsHelpAuth(false)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"
            >
              <LogOut size={14} /> Lock Portal
            </button>
          </div>
        </div>

        {isChangingPass && (
          <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100 flex flex-col md:flex-row items-end gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-1">Update Administrative Access Key</label>
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
              Commit Change
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
      { type: ModuleType.OPERATIONS_CERTIFICATION, label: "06. Operations Certification CORE" }
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
              placeholder="Search formulas or rules..." 
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
                            {f.governanceRules && (
                              <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                  <Scale size={14} className="text-indigo-500" /> Governance Rules
                                </h5>
                                <div className="grid gap-2">
                                  {f.governanceRules.map((rule, idx) => (
                                    <div key={idx} className="flex gap-3 text-[10px] font-bold text-slate-500 leading-snug">
                                      <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full mt-1 shrink-0" />
                                      {rule}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {f.trustScoreComponents && (
                              <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                  <ThumbsUp size={14} className="text-indigo-500" /> Trust Score Weights
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                  {Object.entries(f.trustScoreComponents).map(([comp, weight]) => (
                                    <div key={comp} className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                                      <span className="text-[9px] font-black text-slate-400 uppercase truncate pr-2">{comp.replace(/_/g, ' ')}</span>
                                      <span className="text-xs font-black text-indigo-600">{weight}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {f.targetRanges && (
                              <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                  <Target size={14} className="text-indigo-500" /> Target Benchmarks
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(f.targetRanges).map(([seg, range]) => (
                                    <div key={seg} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                      {seg}: {range}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {expandedFormula !== f.formulaId && (
                      <button 
                        onClick={() => setExpandedFormula(f.formulaId)}
                        className="w-full bg-slate-50 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 transition-all border-t border-slate-100"
                      >
                        Deep Inspect Logic
                      </button>
                    )}
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
                </>
              ) : (
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
              )}
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase text-xs tracking-widest">Process Logic Pipeline</button>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowRight size={12} className="text-blue-500" /> V_FOOD_TRANSFERS_IN</label>
                    <input name="V_FOOD_TRANSFERS_IN" type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Transferred from other locations.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ArrowRight size={12} className="text-rose-500 rotate-180" /> V_FOOD_TRANSFERS_OUT</label>
                    <input name="V_FOOD_TRANSFERS_OUT" type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Transferred to other locations.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12} className="text-amber-500" /> V_FOOD_ENDING_INVENTORY</label>
                    <input name="V_FOOD_ENDING_INVENTORY" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Physical count ending inventory.</p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calculator size={12} className="text-purple-500" /> V_FOOD_EMPLOYEE_MEALS</label>
                    <input name="V_FOOD_EMPLOYEE_MEALS" type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-900" placeholder="0.00" />
                    <p className="text-[9px] text-slate-400 font-medium">Cost of meals provided to staff.</p>
                  </div>
                  <div className="space-y-3 lg:col-span-3">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">V_FOOD_SALES (DENOMINATOR)</label>
                    <input name="V_FOOD_SALES" required type="number" step="0.01" className="w-full p-6 bg-indigo-50 border border-indigo-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/20 outline-none font-black text-xl text-indigo-900" placeholder="Net Food Sales" />
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Crucial: All percentages are calculated against this certified net value.</p>
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
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] mb-12 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shrink-0"><Calculator size={32} /></div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-indigo-900 uppercase tracking-tighter leading-none">Unified Prime Logic</h4>
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Prime Cost = Food + Bev + Hourly + Salary</p>
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
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">V_NET_SALES</label>
                    <input name="V_NET_SALES" required type="number" step="0.01" className="w-full p-5 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold" placeholder="Total Store Net Sales" />
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
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm h-[500px] flex flex-col">
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
    if (!user && !showLanding) {
      return (
        <div className="max-w-md mx-auto bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl">F</div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Simulator Identity</h2>
            <p className="text-slate-400 text-xs font-semibold mt-2">Access the MGE V4 Intelligence Core</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" placeholder="First Name" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} required />
            <input type="email" placeholder="Business Email" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" onChange={e => setUserFormData({...userFormData, email: e.target.value})} required />
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl mt-4">Initialize MGE Session</button>
          </form>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'help': return renderHelpPortal();
      case 'faq': return renderFaqSection();
      case 'operations': return renderOperationsCertification();
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
      <div className="min-h-screen bg-[#FDFDFD] text-[#0F172A] font-sans selection:bg-indigo-100 animate-in fade-in duration-700">
        <nav className="fixed top-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl z-50 px-12 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setShowLanding(true)}>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:bg-indigo-600 transition-colors shadow-lg">M</div>
            <span className="font-black text-sm tracking-tight uppercase">FohBoh <span className="text-indigo-600">MGE</span></span>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <button onClick={() => { if(user) { setShowLanding(false); handleTabChange('registry'); } }} className="hover:text-indigo-600 transition-colors flex items-center gap-2"><Layers size={14} /> Logic Core</button>
            <button onClick={() => { if(user) { setShowLanding(false); handleTabChange('dashboard'); } }} className="hover:text-indigo-600 transition-colors flex items-center gap-2"><Zap size={14} /> Recovery</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('faq'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 text-indigo-500"><MessageCircleQuestion size={14} /> FAQ Center</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 text-slate-400"><BookOpen size={14} /> Admin Portal</button>
          </div>
          <button 
            onClick={() => { if(user) { setShowLanding(false); setActiveTab('dashboard'); } else { setShowLanding(false); } }}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
          >
            {user ? 'Enter App' : 'Get Access'}
          </button>
        </nav>

        <main className="pt-40 pb-32 container mx-auto px-12 max-w-7xl">
          <div className="text-center mb-32 space-y-12">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-sm animate-bounce">
              <Sparkles size={14} /> Deterministic Truth Engine
            </div>
            <h1 className="text-7xl md:text-[9rem] font-black mb-12 tracking-tighter leading-[0.85]">
              Certify Profit. <br />
              <span className="text-indigo-600">Automate Recovery.</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10">
              <button 
                onClick={() => { if(user) { setShowLanding(false); setActiveTab('dashboard'); } else { setShowLanding(false); } }}
                className="bg-slate-900 text-white px-12 py-6 rounded-[1.5rem] font-black text-sm flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all group"
              >
                Start MGE Simulator <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>
        </main>
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


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
  Key
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
import { STANDARD_FORMULAS, CSV_TEMPLATES, GLOSSARY_LOGIC, PIPELINE_STAGES, BLUEPRINT_CARDS } from './constants.tsx';
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
    role: UserRole.C_LEVEL,
    password: '' 
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

    switch (module) {
      case ModuleType.REVENUE_RECOVERY:
        kpiId = 'RR001';
        value = (parseFloat(inputData.open || 0) - parseFloat(inputData.closed || 0)) * parseFloat(inputData.avg || 0);
        break;
      case ModuleType.DELIVERY_RECON:
        kpiId = 'DR001';
        value = parseFloat(inputData.pos || 0) - parseFloat(inputData.bank || 0);
        break;
      default:
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
    const storedPass = localStorage.getItem('fohboh_help_pass') || 'fohboh-admin';
    if (helpPasswordInput === storedPass) {
      setIsHelpAuth(true);
      setHelpError('');
    } else {
      setHelpError('Unauthorized Access. Invalid Credentials.');
    }
  };

  const handleRestorePassword = () => {
    localStorage.setItem('fohboh_help_pass', 'fohboh-admin');
    alert('Password restored to default: fohboh-admin');
    setHelpPasswordInput('fohboh-admin');
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

  const renderHelpPortal = () => {
    if (!isHelpAuth) {
      return (
        <div className="max-w-xl mx-auto py-20 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-[#0F172A] p-12 rounded-[2.5rem] shadow-2xl border border-slate-800 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-xl shadow-indigo-900/20">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Internal Admin Portal</h2>
            <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed px-12">
              Unauthorized access is strictly prohibited. Access to MGE Internal Documentation requires admin verification.
            </p>
            <form onSubmit={handleHelpLogin} className="space-y-4">
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={helpPasswordInput}
                  onChange={(e) => setHelpPasswordInput(e.target.value)}
                  placeholder="Enter Admin Access Key" 
                  className="w-full bg-slate-900/50 border border-slate-700 p-5 pl-12 rounded-2xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                />
              </div>
              {helpError && <p className="text-rose-400 text-[10px] font-black uppercase tracking-widest animate-pulse">{helpError}</p>}
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase text-xs tracking-[0.2em] mt-4">
                Verify Credentials
              </button>
            </form>
            <div className="mt-8 flex items-center justify-center gap-6">
              <button onClick={handleRestorePassword} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Forgot Password?</button>
              <div className="w-1 h-1 bg-slate-700 rounded-full" />
              <button onClick={() => setShowLanding(true)} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Exit Portal</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[1400px] mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[800px] flex flex-col animate-in fade-in duration-700">
        {/* Portal Header */}
        <div className="bg-[#0F172A] px-12 py-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-900/50">F</div>
            <div>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational & Strategic Logic Core</div>
              <div className="text-2xl font-black text-white tracking-tight uppercase">MGE <span className="text-slate-500 font-bold">Internal Docs & Logic</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsChangingPass(!isChangingPass)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
              <Settings size={14} /> Security
            </button>
            <button onClick={handleBack} className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>

        {/* Change Password Overlay */}
        {isChangingPass && (
          <div className="bg-indigo-600 px-12 py-4 flex items-center justify-center gap-6 text-white text-xs font-bold animate-in slide-in-from-top duration-300">
            <span>Update Admin Key:</span>
            <input 
              type="password" 
              className="bg-indigo-700 border border-indigo-500 px-4 py-1.5 rounded-lg text-white placeholder:text-indigo-400 outline-none focus:ring-2 focus:ring-white/20" 
              placeholder="New Access Key"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
            <button onClick={handleChangePassword} className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors">Apply</button>
            <button onClick={() => setIsChangingPass(false)} className="text-white/60 hover:text-white transition-colors">Cancel</button>
          </div>
        )}

        {/* Internal Navigation */}
        <div className="px-12 bg-slate-50 border-b border-slate-200 flex items-center gap-12 overflow-x-auto no-scrollbar">
          {['playbooks', 'glossary', 'pipeline', 'blueprints'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setHelpSubTab(tab)}
              className={`py-6 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative shrink-0 ${
                helpSubTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.replace('_', ' & ')}
              {helpSubTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content Renderers */}
        <div className="flex-1 p-16 overflow-y-auto bg-[#FDFDFD]">
          {helpSubTab === 'playbooks' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-1 bg-indigo-600 h-8 rounded-full" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">01. PERSONA PLAYBOOKS</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Manager Playbook */}
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><BarChart size={32} /></div>
                    <ChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Product Manager</h3>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">Protect the Commercial Wedge</div>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    The PM ensures technical architecture translates into financial ROI, moving users from 'Observation' to 'Autonomous Recovery' by standardizing truth across the pipeline.
                  </p>
                  <ul className="space-y-6">
                    {[
                      { title: 'Stage 5 Roadmap alignment', desc: 'Align engineering with goal of 100% automated actions.' },
                      { title: 'Defining Truth Anchors', desc: 'Mandate use of immutable nodes like Bank Statements.' },
                      { title: 'ROI Calculation Certification', desc: 'Verify recovery impact formulas are audited before release.' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-5">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm mb-1">{item.title}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{item.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Customer Success Playbook */}
                <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><Shield size={32} /></div>
                    <ChevronRight className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Customer Success</h3>
                  <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-8">Bridge the Trust Gap</div>
                  <p className="text-slate-500 font-medium leading-relaxed mb-10">
                    CSMs bridge the gap between technical data and human trust, proving 'MGE Truth' is more accurate than client internal assumptions.
                  </p>
                  <ul className="space-y-6">
                    {[
                      { title: 'Onboarding Lifecycle management', desc: 'Guide users through Bronze to Gold certification within 90 days.' },
                      { title: 'Objection handling (CFO level)', desc: "Address 'The POS is different' concerns via Stage 2 logic." },
                      { title: 'ROI Calculation Certification', desc: 'Ensure recovery impacts are quantified for business reviews.' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-5">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm mb-1">{item.title}</div>
                          <div className="text-[11px] text-slate-400 font-semibold">{item.desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {helpSubTab === 'glossary' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-1 bg-indigo-600 h-8 rounded-full" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">02. CERTIFICATION TIERS & GLOSSARY</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                {[
                  { tier: 'Bronze', label: 'DIRECTIONAL', color: 'bg-amber-100 text-amber-900', desc: 'Stage 1 & 2 Complete. Identifies where money might be leaking.' },
                  { tier: 'Silver', label: 'OPERATIONAL', color: 'bg-slate-100 text-slate-900', desc: 'Validated Pattern Detection. Safe for store-level performance tweaks.' },
                  { tier: 'Gold', label: 'AUDIT-GRADE', color: 'bg-indigo-600 text-white shadow-xl shadow-indigo-200', desc: '100% Truth-Anchored. Stage 5 certified for financial booking.' }
                ].map((t) => (
                  <div key={t.tier} className={`${t.color} p-10 rounded-3xl`}>
                    <div className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">{t.label}</div>
                    <div className="text-3xl font-black mb-4">{t.tier}</div>
                    <p className="text-xs font-semibold leading-relaxed opacity-80">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
                {GLOSSARY_LOGIC.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 p-8 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{item.category}</div>
                      <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">LOGIC CARD</div>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 mb-2">{item.title}</h4>
                    <div className="bg-slate-50 p-3 rounded-xl mb-4">
                      <code className="text-[10px] font-black text-indigo-600 font-mono">{item.formula}</code>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {helpSubTab === 'pipeline' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-1 bg-indigo-600 h-8 rounded-full" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">04. THE 5-STAGE PIPELINE</h2>
              </div>
              <div className="space-y-4 max-w-4xl">
                {PIPELINE_STAGES.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-8 group">
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:bg-indigo-600 transition-colors">
                      <div className="text-center">
                        <div className="text-[8px] font-black text-white/50 uppercase tracking-widest leading-none">STAGE</div>
                        <div className="text-2xl font-black text-white leading-none mt-1">{idx + 1}</div>
                      </div>
                    </div>
                    <div className="flex-1 bg-white border border-slate-100 p-8 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                      <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{s.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {helpSubTab === 'blueprints' && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-1 bg-indigo-600 h-8 rounded-full" />
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">05. MODULE BLUEPRINTS</h2>
              </div>
              
              <div className="bg-[#0F172A] p-12 rounded-[2.5rem] mb-16 relative overflow-hidden group">
                <div className="relative z-10 max-w-2xl">
                  <h3 className="text-3xl font-black text-white mb-6">TECHNICAL TEMPLATES & CSV SCHEMAS</h3>
                  <p className="text-slate-400 font-medium mb-10 text-sm">Download the exact CSV structures required for Stage 1 Immutable Ingestion. These templates ensure your POS, platform, and bank data streams align perfectly with the MGE logic core.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {['FOOD & PRIME', 'BEVERAGE (POUR)', 'DELIVERY AUDIT', 'REVENUE RECOVERY', 'LABOR & SPLH', 'CAPACITY & REVPASH'].map((t) => (
                      <button key={t} className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all group/btn">
                        {t} <Download size={14} className="text-indigo-400 group-hover/btn:text-indigo-600" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-12 right-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                  <FileSpreadsheet size={300} className="text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {BLUEPRINT_CARDS.map((card) => (
                  <div key={card.id} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:border-indigo-400 transition-all">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{card.title}</h4>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors"><Info size={16} /></div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">LOGIC FORMULA</div>
                        <div className="bg-slate-50 p-4 rounded-xl font-mono text-[11px] font-bold text-slate-900">{card.formula}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">MANDATORY CSV HEADERS</div>
                        <div className="bg-slate-900 p-4 rounded-xl font-mono text-[10px] font-medium text-indigo-300 leading-relaxed overflow-x-auto whitespace-nowrap no-scrollbar">{card.headers}</div>
                      </div>
                      <div className="pt-4 border-t border-slate-50">
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">{card.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
              <h2 className="text-2xl font-black text-slate-900 capitalize tracking-tight">{module.replace('_', ' ')} Simulation</h2>
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
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Average Check Value ($)</label>
                    <input name="avg" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-900" placeholder="0.00" />
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
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovered Revenue</span>
            </div>
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[100px] rounded-full" />
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
            <input type="text" placeholder="First Name" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} required />
            <input type="email" placeholder="Business Email" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" onChange={e => setUserFormData({...userFormData, email: e.target.value})} required />
            <input type="password" placeholder="Access Code" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" onChange={e => setUserFormData({...userFormData, password: e.target.value})} required />
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-5 rounded-2xl shadow-xl transition-all active:scale-[0.98] uppercase text-xs tracking-widest mt-4">Initialize MGE Session</button>
          </form>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'help': return renderHelpPortal();
      case 'recovery': return renderModuleForm(ModuleType.REVENUE_RECOVERY);
      case 'delivery': return renderModuleForm(ModuleType.DELIVERY_RECON);
      case 'registry':
        return (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Database size={24} /></div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">KPI Registry <span className="text-slate-300 font-bold">V4</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {formulas.map(f => (
                <div key={f.formulaId} className="p-8 border border-slate-100 rounded-[2rem] hover:bg-slate-50 transition-all group hover:shadow-xl hover:shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-black text-slate-900 text-base uppercase tracking-tight">{f.name}</h4>
                    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm"><CheckCircle size={14} /></div>
                  </div>
                  <code className="block p-5 bg-slate-900 text-indigo-300 rounded-2xl text-[11px] font-mono leading-relaxed shadow-inner">{f.expression}</code>
                  <p className="mt-6 text-xs text-slate-500 font-medium leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'vault':
        return (
          <div className="max-w-4xl mx-auto py-24 rounded-[4rem] border-4 border-dashed border-amber-200 bg-amber-50/50 flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-700">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border border-amber-100 text-amber-600">
              {isVaultLocked ? <Lock size={64} /> : <Unlock size={64} className="animate-pulse" />}
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Certified Truth Vault</h2>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em] max-w-sm mx-auto leading-relaxed">Immutable storage for period-certified ledgers and governing KPIs.</p>
            </div>
            <button 
              onClick={() => setIsVaultLocked(!isVaultLocked)} 
              className={`px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${
                isVaultLocked ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-slate-800'
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
            <div className="flex flex-col leading-none">
              <span className="font-black text-sm tracking-tight uppercase">FohBoh <span className="text-indigo-600">MGE</span></span>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">Simulator V4.0</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <button onClick={() => { if(user) { setShowLanding(false); handleTabChange('registry'); } }} className="hover:text-indigo-600 transition-colors flex items-center gap-2"><Layers size={14} /> Logic Core</button>
            <button onClick={() => { if(user) { setShowLanding(false); handleTabChange('dashboard'); } }} className="hover:text-indigo-600 transition-colors flex items-center gap-2"><Zap size={14} /> Recovery</button>
            <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="hover:text-indigo-600 transition-colors flex items-center gap-2 text-indigo-500"><BookOpen size={14} /> Admin Portal</button>
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
            <p className="text-slate-500 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              The MGE Simulator quantifies operational leakage through deterministic 5-stage governance models, turning fragmented data into audit-grade financial ledgers.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-10">
              <button 
                onClick={() => { if(user) { setShowLanding(false); setActiveTab('dashboard'); } else { setShowLanding(false); } }}
                className="bg-slate-900 text-white px-12 py-6 rounded-[1.5rem] font-black text-sm flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:bg-indigo-600 transition-all active:scale-95 group"
              >
                Start MGE Emulator <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button onClick={() => { setShowLanding(false); handleTabChange('help'); }} className="bg-white border-2 border-slate-100 px-12 py-6 rounded-[1.5rem] font-black text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-xl shadow-slate-200/20">
                MGE Architecture Docs
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: 'Data Integrity', desc: 'Immutable ingestion of POS and Bank streams ensure zero-drift truth.', color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Zap, title: 'Rapid Recovery', desc: 'Identify variance patterns A-E in minutes, not monthly close cycles.', color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { icon: BrainCircuit, title: 'AI Governance', desc: 'Feed LLMs with certified metrics, eliminating hallucinations in strategy.', color: 'text-amber-500', bg: 'bg-amber-50' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-default">
                <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}><feature.icon size={32} /></div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
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

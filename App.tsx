
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  Calculator,
  BrainCircuit,
  Upload,
  CreditCard,
  Truck,
  Database,
  Sparkles,
  Zap,
  Shield,
  Layers,
  BookOpen,
  Award,
  MessageCircleQuestion,
  ChevronDown,
  Scale,
  Clock,
  Wine,
  BarChart3,
  Lightbulb,
  Terminal,
  FileSearch,
  ExternalLink,
  ChevronRight,
  Lock,
  Unlock,
  Plus,
  Info,
  Search,
  CheckCircle,
  FileText,
  AlertTriangle,
  LogOut,
  Calendar,
  LayoutDashboard,
  ChefHat
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import Layout from './components/Layout.tsx';
import { 
  RestaurantType, 
  UserRole, 
  ModuleType, 
  SimulatorUser, 
  KPIFormula, 
  CertifiedMetric, 
  ExecutiveDashboard,
  DateRange
} from './types.ts';
import { STANDARD_FORMULAS, BLUEPRINT_CARDS, GLOSSARY_LOGIC, PIPELINE_STAGES, FAQ_DATA } from './constants.tsx';
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

  // Portal States
  const [isHelpAuth, setIsHelpAuth] = useState(false);
  const [helpPasswordInput, setHelpPasswordInput] = useState('');
  const [helpSubTab, setHelpSubTab] = useState('playbooks');
  const [helpError, setHelpError] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [registrySearch, setRegistrySearch] = useState('');
  const [expandedFormula, setExpandedFormula] = useState<string | null>(null);
  const [opsCertActiveTab, setOpsCertActiveTab] = useState<'food' | 'bev' | 'prime'>('food');
  const [primeSalesBasis, setPrimeSalesBasis] = useState<'net' | 'gross'>('net');

  // Session Management
  useEffect(() => {
    const savedUser = localStorage.getItem('fohboh_user_session');
    setUser(savedUser ? JSON.parse(savedUser) : GUEST_USER);
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

  const runSimulation = (module: ModuleType, inputData: any) => {
    let value = 0;
    let kpiId = '';
    let foundMoneyAmount = 0;
    let trustScore = 85 + Math.random() * 10;
    let auditDetails = null;

    if (module === ModuleType.CC_AUDIT) {
      kpiId = 'CC_RECOVERY_TOTAL';
      const vol = parseFloat(inputData.total_card_volume || 0);
      const fees = parseFloat(inputData.total_fees_charged || 0);
      const markupBps = parseFloat(inputData.contracted_markup_bps || 0);
      const debitVol = parseFloat(inputData.debit_volume || 0);
      const debitCount = parseInt(inputData.debit_count || 0);

      const expectedMarkup = (vol * (markupBps / 10000));
      const actualMarkupAmount = fees - (vol * 0.02); 
      const contractOvercharge = Math.max(0, actualMarkupAmount - expectedMarkup);
      const durbinOvercharge = Math.max(0, (fees * 0.1) - ((debitCount * 0.23) + (debitVol * 0.0005)));
      
      foundMoneyAmount = contractOvercharge + durbinOvercharge;
      value = (fees / vol) * 100;
      auditDetails = { contractViolation: contractOvercharge, durbinViolation: durbinOvercharge };
    } else if (module === ModuleType.DELIVERY_RECON) {
      kpiId = 'DR001';
      const pos = parseFloat(inputData.pos_gross || 0);
      const bank = parseFloat(inputData.bank_net || 0);
      const commRate = parseFloat(inputData.commission_rate || 25) / 100;
      const expectedNet = pos * (1 - commRate);
      foundMoneyAmount = Math.max(0, expectedNet - bank);
      value = bank;
    } else if (module === ModuleType.OPERATIONS_CERTIFICATION) {
      kpiId = 'OPS_CERT_SCORE';
      value = 92.4;
    }

    const newMetric: CertifiedMetric = {
      metricId: `M_${Date.now()}`,
      kpiId,
      module,
      value,
      trustScore,
      calculationDate: new Date().toISOString(),
      isCertified: true,
      dataSources: ['MGE Truth Engine'],
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

  useEffect(() => {
    if (user && metrics.length > 0 && !isGeneratingInsights) {
      const fetchInsights = async () => {
        setIsGeneratingInsights(true);
        const newInsights = await geminiService.generateInsights(dashboardData());
        setInsights(newInsights);
        setIsGeneratingInsights(false);
      };
      fetchInsights();
    }
  }, [metrics.length, isVaultLocked]);

  const renderDashboard = () => {
    const dashboard = dashboardData();
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Recovered', val: `$${dashboard.performance.totalFoundMoney.toLocaleString()}`, color: 'text-emerald-500' },
            { label: 'Audit Certification', val: dashboard.performance.certificationRate, color: 'text-indigo-500' },
            { label: 'Trust Index', val: dashboard.performance.averageTrustScore, color: 'text-slate-900' },
            { label: 'Simulations Run', val: dashboard.performance.totalSimulations.toString(), color: 'text-slate-900' }
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
            
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg mb-8">Recent Forensic Results</h3>
              <div className="space-y-4">
                {metrics.slice(-5).reverse().map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        {m.module === ModuleType.CC_AUDIT ? <CreditCard size={20} /> : <Truck size={20} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{m.module.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score: {m.trustScore.toFixed(0)}/100</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-emerald-600">+${m.foundMoneyAmount.toLocaleString()}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recoverable Capital</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-[#0F172A] p-10 rounded-[2.5rem] text-white shadow-2xl space-y-8">
            <h3 className="font-black text-xl flex items-center gap-3 text-indigo-400 uppercase tracking-tighter"><BrainCircuit size={28} /> AI Strategy</h3>
            <div className="space-y-6">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex gap-5 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center shrink-0 font-black text-[10px]">{idx + 1}</div>
                  <p className="text-slate-300 text-xs leading-relaxed font-semibold">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCCAudit = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Merchant Fee Recovery</h2>
          <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.3em]">Module 7: Deterministic Forensic Audit</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl">
        <form className="space-y-10" onSubmit={e => {
          e.preventDefault();
          runSimulation(ModuleType.CC_AUDIT, Object.fromEntries(new FormData(e.currentTarget).entries()));
          handleTabChange('dashboard');
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Card Volume ($)</label>
              <input name="total_card_volume" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="150,000.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Processor Fees ($)</label>
              <input name="total_fees_charged" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="5,800.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contracted Markup (bps)</label>
              <input name="contracted_markup_bps" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="10" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Debit Volume ($)</label>
              <input name="debit_volume" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="45,000.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Count</label>
              <input name="debit_count" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="900" />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-widest">Run Merchant Audit</button>
        </form>
      </div>
    </div>
  );

  const renderDeliveryRecon = () => (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="bg-[#059669] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden text-white">
        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-2">Delivery Fee Recovery</h2>
          <p className="text-xs text-emerald-200 font-bold uppercase tracking-[0.3em]">Module 8: Marketplace Reconciliation</p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px]" />
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-xl">
        <form className="space-y-10" onSubmit={e => {
          e.preventDefault();
          runSimulation(ModuleType.DELIVERY_RECON, Object.fromEntries(new FormData(e.currentTarget).entries()));
          handleTabChange('dashboard');
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">POS Marketplace Sales ($)</label>
              <input name="pos_gross" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="25,000.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketplace Net Payout ($)</label>
              <input name="bank_net" required type="number" step="0.01" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="18,000.00" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contracted Commission (%)</label>
              <input name="commission_rate" required type="number" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold" placeholder="25" />
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-2xl shadow-xl transition-all uppercase text-xs tracking-widest">Run Delivery Audit</button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'audit': return renderCCAudit();
      case 'delivery': return renderDeliveryRecon();
      case 'operations': return <div className="text-center py-20 font-black uppercase text-slate-300 tracking-widest">Ops Cert Module Loading...</div>;
      case 'registry': return <div className="text-center py-20 font-black uppercase text-slate-300 tracking-widest">KPI Registry Loading...</div>;
      default: return renderDashboard();
    }
  };

  if (isAuthenticating) return null;

  if (showLanding) {
    return (
      <div className="min-h-screen bg-white text-[#0F172A] font-sans selection:bg-indigo-100 animate-in fade-in duration-700 flex flex-col">
        {/* Navigation */}
        <nav className="h-24 px-12 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">M</div>
            <span className="font-black text-lg tracking-tighter uppercase">FohBoh <span className="text-indigo-600">MGE</span></span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={() => { setShowLanding(false); setActiveTab('dashboard'); }} className="bg-[#0F172A] text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">Command Center</button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-12 py-20 container mx-auto max-w-7xl">
          <div className="text-center space-y-8 mb-20 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
              <Sparkles size={12} /> Truth Table Engine V4.2
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.85] text-[#0F172A]">
              Stop Revenue <br /> Leakage Today.
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              FohBoh MGE automatically identifies overcharges and processing errors in your restaurant's financial operations. Choose a starter module below to find your found money.
            </p>
          </div>

          {/* Core Starter Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            {/* Merchant Fee Card */}
            <div 
              onClick={() => { setShowLanding(false); setActiveTab('audit'); }}
              className="group relative bg-[#F8FAFC] rounded-[3.5rem] p-12 border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-16">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl group-hover:scale-110 transition-transform">
                    <CreditCard size={32} />
                  </div>
                  <div className="px-5 py-2 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Tier 1 Strategy</div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Merchant Fee Recovery</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                    Identifies junk fees, Durbin Amendment violations, and processor markup creep in your credit card statements.
                  </p>
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest pt-4">
                    Launch Certification Audit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] group-hover:bg-indigo-500/10 transition-colors" />
            </div>

            {/* Delivery Fee Card */}
            <div 
              onClick={() => { setShowLanding(false); setActiveTab('delivery'); }}
              className="group relative bg-[#F8FAFC] rounded-[3.5rem] p-12 border border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden"
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-16">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-600 shadow-xl group-hover:scale-110 transition-transform">
                    <Truck size={32} />
                  </div>
                  <div className="px-5 py-2 bg-emerald-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Tier 1 Strategy</div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black tracking-tighter uppercase leading-none">Delivery Fee Recovery</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                    Reconciles POS data against marketplace payouts to surface missing orders and incorrect commission deductions.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest pt-4">
                    Launch Certification Audit <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-colors" />
            </div>
          </div>

          {/* Secondary Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mt-20 pt-20 border-t border-slate-50">
            <div onClick={() => { setShowLanding(false); setActiveTab('dashboard'); }} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Analytics</div>
              <h4 className="text-sm font-black uppercase tracking-tight">Executive Dashboard</h4>
            </div>
            <div onClick={() => { setShowLanding(false); setActiveTab('registry'); }} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Governance</div>
              <h4 className="text-sm font-black uppercase tracking-tight">KPI Logic Registry</h4>
            </div>
            <div onClick={() => { setShowLanding(false); setActiveTab('vault'); }} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Security</div>
              <h4 className="text-sm font-black uppercase tracking-tight">Certified Vault</h4>
            </div>
            <div onClick={() => { setShowLanding(false); setActiveTab('faq'); }} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Support</div>
              <h4 className="text-sm font-black uppercase tracking-tight">Knowledge Base</h4>
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
      onLogout={() => { setUser(null); setShowLanding(true); }} 
      dateRange={dateRange} 
      setDateRange={setDateRange}
      onBack={handleBack}
      onGoHome={() => setShowLanding(true)}
      canGoBack={navigationHistory.length > 0 || !showLanding}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;

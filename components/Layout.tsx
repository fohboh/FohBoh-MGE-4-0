
import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Lock, 
  Settings, 
  History, 
  Database,
  ChefHat,
  LayoutDashboard,
  Menu,
  X,
  CreditCard,
  Truck,
  LogOut,
  Calendar,
  Layers,
  Zap,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { DateRange } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  userName, 
  onLogout,
  dateRange,
  setDateRange
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'registry', label: 'KPI Registry', icon: Database },
    { id: 'recovery', label: 'Revenue Recovery', icon: BarChart3 },
    { id: 'delivery', label: 'Delivery Recon', icon: Truck },
    { id: 'audit', label: 'CC Audit', icon: CreditCard },
    { id: 'vault', label: 'Certified Vault', icon: Lock },
    { id: 'history', label: 'Audit Log', icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg transition-transform active:scale-90 print-hidden"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0 print-hidden`}>
        <div className="p-8 flex items-center gap-3 border-b border-slate-800">
          <ChefHat className="text-indigo-400" size={28} />
          <span className="font-black text-xl text-white tracking-tighter uppercase">FohBoh <span className="text-indigo-400">MGE</span></span>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
          >
            <LogOut size={16} />
            Term Session
          </button>
        </div>

        <div className="p-8 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <ShieldCheck size={14} className="text-indigo-500" />
            V4.0 TRUTH TABLE
          </div>
          <div className="text-[10px] text-slate-600 font-bold">© 2026 FOHBOH.AI INC.</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        {/* Header */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 print-hidden">
          <div className="flex items-center gap-10">
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest hidden lg:block">
              {activeTab.replace('_', ' ')}
            </h1>

            {/* Top Navigation Links */}
            <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <button onClick={() => setActiveTab('registry')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Layers size={14} /> Modules</button>
              <button onClick={() => setActiveTab('recovery')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><Zap size={14} /> Use Cases</button>
              <button onClick={() => setActiveTab('help')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><BookOpen size={14} /> Logic Docs</button>
              <button onClick={() => setActiveTab('help')} className="flex items-center gap-2 hover:text-indigo-600 transition-colors"><HelpCircle size={14} /> Help</button>
            </div>
            
            {/* Global Date Period Picker */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
              <Calendar size={18} className="text-indigo-500" />
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="flex flex-col">
                   <span className="opacity-50 text-[8px]">Period Start</span>
                   <input 
                    type="date" 
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-slate-900"
                  />
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col">
                   <span className="opacity-50 text-[8px]">Period End</span>
                   <input 
                    type="date" 
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 cursor-pointer text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{userName}</div>
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise Operator</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

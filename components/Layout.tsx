
import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Lock, 
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
  HelpCircle,
  ArrowLeft,
  MessageCircleQuestion,
  Award
} from 'lucide-react';
import { DateRange } from '../types.ts';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  onLogout: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onBack?: () => void;
  onGoHome?: () => void;
  canGoBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  userName, 
  onLogout,
  dateRange,
  setDateRange,
  onBack,
  onGoHome,
  canGoBack = false
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'MGE Command Center', icon: LayoutDashboard },
    { id: 'audit', label: 'Merchant Fee Recovery', icon: CreditCard },
    { id: 'delivery', label: 'Delivery Fee Recovery', icon: Truck },
    { id: 'operations', label: 'Ops Certification', icon: Award },
    { id: 'registry', label: 'KPI Registry', icon: Database },
    { id: 'vault', label: 'Certified Vault', icon: Lock },
    { id: 'faq', label: 'Knowledge Base', icon: MessageCircleQuestion },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} transition-all duration-300 bg-[#0F172A] text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0`}>
        <div 
          className="p-8 flex items-center gap-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group"
          onClick={onGoHome}
          title="Return to Home Dashboard"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">M</div>
          <span className="font-black text-lg text-white tracking-tighter uppercase">FohBoh <span className="text-indigo-400">MGE</span></span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-rose-400 transition-colors">
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            {canGoBack && (
              <button 
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group shadow-sm"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back</span>
              </button>
            )}
            <div className="w-px h-6 bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Calendar size={14} className="text-indigo-500" />
              <span>Audit Window:</span>
              <span className="text-slate-900">{dateRange.start} — {dateRange.end}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{userName}</div>
              <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                <ShieldCheck size={10} /> Certified Operator
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase shadow-md">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

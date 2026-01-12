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
  ArrowLeft
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
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 shrink-0`}>
        <div 
          className="p-8 flex items-center gap-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors group"
          onClick={onGoHome}
          title="Return to Home Dashboard"
        >
          <ChefHat className="text-indigo-400 group-hover:scale-110 transition-transform" size={28} />
          <span className="font-black text-xl text-white tracking-tighter uppercase">FohBoh <span className="text-indigo-400">MGE</span></span>
        </div>
        
        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-colors">
            <LogOut size={16} /> Term Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-6">
            {canGoBack && (
              <button 
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all group shadow-sm"
                title="Proceed to Prior Page"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Go Back</span>
              </button>
            )}
            
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm">
              <Calendar size={18} className="text-indigo-500" />
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} 
                  className="bg-transparent border-none p-0 cursor-pointer text-slate-900 outline-none focus:ring-0" 
                />
                <div className="w-px h-6 bg-slate-200" />
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
                  className="bg-transparent border-none p-0 cursor-pointer text-slate-900 outline-none focus:ring-0" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider">{userName}</div>
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Enterprise Operator</div>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xs uppercase">
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
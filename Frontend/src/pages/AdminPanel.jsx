import React from "react";
import { Building2, Users, Settings, BarChart3, Shield } from "lucide-react";

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Admin Control Panel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Verified Admin Access
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Doctors"
            value="24"
            color="bg-indigo-500"
          />
          <StatCard
            icon={Building2}
            label="Departments"
            value="12"
            color="bg-emerald-500"
          />
          <StatCard
            icon={BarChart3}
            label="Weekly Revenue"
            value="₹45,200"
            color="bg-amber-500"
          />
          <StatCard
            icon={Settings}
            label="System Status"
            value="Healthy"
            color="bg-rose-500"
          />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Management Modules
          </h3>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${color} text-white rounded-2xl`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

export default AdminPanel;

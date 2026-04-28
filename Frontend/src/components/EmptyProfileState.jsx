import { PlusCircle, Stethoscope } from "lucide-react";

const EmptyProfileState = () => (
  <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-sm border border-slate-100 flex flex-col items-center text-center">
    <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-8 relative">
      <Stethoscope className="w-12 h-12" />
    </div>
    <h2 className="text-3xl font-extrabold text-slate-900 mb-4 max-w-md">
      Complete Your Professional Profile
    </h2>

    <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all hover:-translate-y-0.5">
      <PlusCircle className="w-5 h-5" />
      Create Doctor Profile
    </button>
  </div>
);

export default EmptyProfileState;

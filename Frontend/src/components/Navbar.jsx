import {
  LogOut,
  Menu,
  ShieldCheck,
  User,
  X,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Building2,
} from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { logout } from "../features/usersSlice";
import apiRequest from "../utils/apiRequest";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.users);

  const handleLogout = async () => {
    try {
      await apiRequest.post("/users/logout");
      dispatch(logout());
      navigate("/login");
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const getRoleIcon = (role) => {
    switch (role) {
      case "Doctor":
        return <Stethoscope className="w-4 h-4" />;
      case "Clinic Admin":
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              HABS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {currentUser ? (
              <div className="flex items-center gap-6 ">
                {currentUser.role === "Doctor" && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}

                {currentUser?.role === "Patient" && (
                  <Link
                    to="/appointments"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Appointments
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-2">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-slate-900 leading-tight">
                      {currentUser.username}
                    </span>
                    <span className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      {getRoleIcon(currentUser.role)}
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden absolute w-full bg-white border-b border-slate-200 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-2">
          {currentUser ? (
            <>
              <div className="h-px bg-slate-100 my-2" />
              {currentUser.role === "Doctor" && (
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5 text-slate-400" />
                  Dashboard
                </Link>
              )}
              {currentUser.role === "Patient" && (
                <Link
                  to="/appointments"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Calendar className="w-5 h-5 text-slate-400" />
                  Appointments
                </Link>
              )}
              <div className="mt-4 px-4 py-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {currentUser.username}
                    </p>
                    <p className="text-[11px] font-medium text-indigo-600 uppercase tracking-tighter">
                      {currentUser.role}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 grid grid-cols-2 gap-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import {
  AlertCircle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  MapPin,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BlackoutModal from "../components/BlackoutModal";
import CreateDoctorModal from "../components/CreateDoctorModal";
import EditDoctorProfileModal from "../components/EditDoctorProfileModal";
import EmptyProfileState from "../components/EmptyProfileState";
import InfoItem from "../components/InfoItem";
import WeeklyAvailabilityModel from "../components/WeeklyAvailabilityModel";
import { setError, setLoading, setProfile } from "../features/doctorSlice";
import apiRequest from "../utils/apiRequest";
import { Edit3 } from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.doctor);
  const { currentUser } = useSelector((state) => state.users);

  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState(false);
  const [isWeeklyAvailabilityOpen, setWeeklyAvailabilityModalOpen] =
    useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      dispatch(setLoading(true));
      try {
        const res = await apiRequest.get("/doctor");
        dispatch(setProfile(res.data.data));
      } catch (err) {
        if (err.response?.status === 404) {
          dispatch(setProfile(null));
        } else {
          dispatch(
            setError(err.response?.data?.message || "Failed to fetch profile"),
          );
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (currentUser?.role === "Doctor") {
      fetchDoctorProfile();
    }
  }, [dispatch, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse">Loading....</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, Dr. {currentUser?.username || "Doctor"}
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              System Active
            </span>
            <div className="w-px h-4 bg-slate-200" />
            <span className="px-3 py-1.5 text-slate-500 text-xs font-medium">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!profile ? (
          <EmptyProfileState onOpenCreateModal={() => setIsCreateModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-24 h-24 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <User className="w-12 h-12" />
                  </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold text-slate-900">
                            {profile.specialty}
                          </h2>
                          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                            {profile.experienceYears} Years Exp.
                          </span>
                        </div>
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-5 h-5 transition-transform group-hover:scale-110" />
                        </button>
                      </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoItem
                        icon={MapPin}
                        label="Location"
                        value={profile.location}
                      />
                      <InfoItem
                        icon={IndianRupee}
                        label="Consultation Fee"
                        value={`₹${profile.consultationFee}`}
                      />
                      <InfoItem
                        icon={Clock}
                        label="Slot Duration"
                        value={`${profile.slotDurationMin} Minutes`}
                      />
                      <InfoItem
                        icon={Users}
                        label="Max Patients/Slot"
                        value={profile.maxPatientsPerSlot}
                      />
                      <InfoItem
                        icon={CheckCircle2}
                        label="Accepting Appointments"
                        value={
                          <span
                            className={
                              profile.isAcceptingAppointments !== false
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }
                          >
                            {profile.isAcceptingAppointments !== false
                              ? "YES"
                              : "NO"}
                          </span>
                        }
                      />
                    </div>

                    <div className="pt-4 flex flex-wrap gap-2">
                      {profile.qualifications?.map((q, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Weekly Availability
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      Currently Active
                    </div>
                    <button
                      onClick={() => setWeeklyAvailabilityModalOpen(true)}
                      className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-colors"
                    >
                      Edit Schedule
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                  <div className="flex lg:grid lg:grid-cols-7 gap-4 min-w-max lg:min-w-0">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day, index) => {
                        const slots = profile.weeklyAvailability?.[day] || [];
                        const isActive = slots.length > 0;

                        const d = new Date();
                        const currentDay = d.getDay();
                        const diff =
                          d.getDate() -
                          currentDay +
                          (currentDay === 0 ? -6 : 1) +
                          index;
                        const dateObj = new Date(new Date().setDate(diff));
                        const dateStr = dateObj.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <div
                            key={day}
                            className="flex flex-col items-center gap-4 w-32 lg:w-full"
                          >
                            <div className="text-center space-y-1">
                              {/* <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {day.toUpperCase()}
                              </p> */}
                              <p className="text-sm font-extrabold text-slate-800">
                                {day.toUpperCase()}
                              </p>
                              {/* <p className="text-sm font-extrabold text-slate-800">
                                {dateStr}
                              </p> */}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                              {isActive ? (
                                slots.map((slot, i) => (
                                  <div
                                    key={i}
                                    className={`py-3 px-2 rounded-xl text-[11px] font-black text-center transition-all cursor-default
                                      ${
                                        day === "Tue" && i === 0
                                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                      }`}
                                  >
                                    {slot.start} - {slot.end}
                                  </div>
                                ))
                              ) : (
                                <div className="h-32 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 group/closed">
                                  <div className="p-2 bg-slate-50 rounded-full group-hover/closed:scale-110 transition-transform">
                                    <Ban className="w-4 h-4 text-slate-300" />
                                  </div>
                                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                    Closed
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900">Blackout Dates</h4>
                </div>
                {profile.blackoutDates?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.blackoutDates.map((date, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No upcoming blackout dates.
                  </p>
                )}
                <button
                  onClick={() => setIsBlackoutModalOpen(true)}
                  className="w-full mt-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 rounded-xl transition-all hover:border-slate-400"
                >
                  Manage Blackouts
                </button>
              </section>
            </div>
          </div>
        )}

        <BlackoutModal
          isOpen={isBlackoutModalOpen}
          onClose={() => setIsBlackoutModalOpen(false)}
          currentDates={profile?.blackoutDates}
        />

        <WeeklyAvailabilityModel
          onClose={() => setWeeklyAvailabilityModalOpen(false)}
          isOpen={isWeeklyAvailabilityOpen}
          currentWeeklyAvailability={profile?.weeklyAvailability}
        />

        <CreateDoctorModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        <EditDoctorProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      </div>
    </div>
  );
};

export default Dashboard;

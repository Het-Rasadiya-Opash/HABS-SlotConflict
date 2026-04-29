import { DateTime } from "luxon";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  IndianRupee,
  MapPin,
  User,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import BlackoutData from "../components/BlackoutData";
import CreateDoctorModal from "../components/CreateDoctorModal";
import EditDoctorProfileModal from "../components/EditDoctorProfileModal";
import EmptyProfileState from "../components/EmptyProfileState";
import InfoItem from "../components/InfoItem";
import WeeklyAvailabilityData from "../components/WeeklyAvailabilityData";
import { setError, setLoading, setProfile } from "../features/doctorSlice";
import apiRequest from "../utils/apiRequest";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.doctor);
  const { currentUser } = useSelector((state) => state.users);
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
              {DateTime.local().toFormat("MMM d, yyyy")}
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
          <EmptyProfileState
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
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

              <WeeklyAvailabilityData profile={profile} />
            </div>

            <BlackoutData profile={profile} />
          </div>
        )}

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

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { DateTime } from "luxon";
import { useDispatch } from "react-redux";
import { setBookingContext } from "../features/appointmentSlice";
import apiRequest from "../utils/apiRequest";
import {
  Search,
  MapPin,
  Calendar,
  Stethoscope,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const [selectedSlotKey, setSelectedSlotKey] = useState(null);
  const [slotsByDoctor, setSlotsByDoctor] = useState({});

  const handleSlotClick = (doctor, slot, key) => {
    setSelectedSlotKey(key);
    setSlotsByDoctor((prev) => ({ ...prev, [doctor._id]: slot }));
  };

  const handleBookAppointment = (doctor) => {
    const slot = slotsByDoctor[doctor._id];
    if (!slot) return;
    dispatch(
      setBookingContext({
        doctor,
        slot,
      }),
    );
    navigate("/book-appointment");
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const params = {};
      if (specialty.trim()) params.specialty = specialty.trim();
      if (location.trim()) params.location = location.trim();
      if (date) params.date = date;

      const response = await apiRequest.get("/doctor/search", { params });
      setDoctors(response.data.data);
    } catch (err) {
      console.error("Search error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch doctors. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Find and Book the{" "}
            <span className="text-indigo-600">Best Doctors</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Search for doctors by specialty, location, or availability and book
            your appointment in seconds.
          </p>

          <form
            onSubmit={handleSearch}
            className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center px-4 py-3 bg-slate-50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Stethoscope className="text-slate-400 mr-3 h-5 w-5" />
              <input
                type="text"
                placeholder="Specialty (e.g. Cardiologist)"
                className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder-slate-400 outline-none"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div className="flex-1 w-full flex items-center px-4 py-3 bg-slate-50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <MapPin className="text-slate-400 mr-3 h-5 w-5" />
              <input
                type="text"
                placeholder="Location (e.g. New York)"
                className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder-slate-400 outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="flex-1 w-full flex items-center px-4 py-3 bg-slate-50 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
              <Calendar className="text-slate-400 mr-3 h-5 w-5" />
              <input
                type="date"
                className="bg-transparent border-none focus:ring-0 w-full text-slate-900 placeholder-slate-400 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!searched && !loading && (
          <div className="text-center py-20">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Ready to find a doctor?
            </h2>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">
              Searching for best doctors...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <span className="font-bold text-lg">!</span>
            </div>
            {error}
          </div>
        )}

        {searched && !loading && doctors.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-slate-500 text-lg">No doctors found matching</p>
          </div>
        )}

        {searched && !loading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden hover:shadow-[0_15px_50px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-[#E8EFFF] rounded-full flex items-center justify-center text-[#5D5FEF] font-bold text-2xl">
                        {doctor.userId?.username?.charAt(0).toUpperCase() ||
                          "D"}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#111827] text-xl mb-1">
                          Dr. {doctor.userId?.username || "Unknown"}
                        </h3>
                        <p className="text-[#5D5FEF] font-medium text-base">
                          {doctor.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        CONSULTATION FEE
                      </p>
                      <p className="text-[#111827] font-bold text-2xl flex items-center justify-end gap-1">
                        <span className="text-xl font-semibold">₹</span>
                        {doctor.consultationFee}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mb-10">
                    <div className="flex items-center text-slate-500 font-medium text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center text-slate-500 font-medium text-sm">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      {doctor.experienceYears} Years Experience
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
                      AVAILABLE SLOTS
                    </p>
                    <div className="space-y-6">
                      {doctor.nextSlots && doctor.nextSlots.length > 0 ? (
                        Object.entries(
                          doctor.nextSlots.reduce((acc, slot) => {
                            const localDate = DateTime.fromISO(slot.slotStartUTC).toLocal().toFormat("yyyy-MM-dd");
                            if (!acc[localDate]) acc[localDate] = [];
                            acc[localDate].push(slot);
                            return acc;
                          }, {}),
                        ).map(([date, daySlots]) => (
                          <div key={date}>
                            <p className="text-sm font-bold text-[#111827] mb-3">
                              {DateTime.fromISO(date).toFormat("ccc, MMM d")}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {daySlots.map((slot, index) => {
                                const key = `${doctor._id}-${date}-${index}`;
                                const isSelected = selectedSlotKey === key;
                                return (
                                  <div
                                    key={key}
                                    onClick={() =>
                                      handleSlotClick(doctor, slot, key)
                                    }
                                    className={`text-sm px-6 py-3 rounded-[12px] font-semibold border transition-all cursor-pointer select-none ${
                                      isSelected
                                        ? "bg-[#5D5FEF] text-white border-[#5D5FEF] shadow-md shadow-indigo-200"
                                        : "bg-[#F3F6FF] text-[#5D5FEF] border-[#E8EFFF] hover:bg-[#E8EFFF]"
                                    }`}
                                  >
                                    {DateTime.fromISO(slot.slotStartUTC).toLocal().toFormat("hh:mm a")} - {DateTime.fromISO(slot.slotEndUTC).toLocal().toFormat("hh:mm a")}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 rounded-xl p-4 text-center">
                          <p className="text-sm text-slate-400 italic">
                            No slots available soon
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    disabled={!slotsByDoctor[doctor._id]}
                    className="w-full bg-[#000000] hover:bg-slate-900 text-white font-bold py-4 rounded-[12px] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {slotsByDoctor[doctor._id]
                      ? "Book Appointment"
                      : "Select a Slot First"}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

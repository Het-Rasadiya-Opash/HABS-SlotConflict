import appointmentModel from "../models/appointment.model.js";
import doctorProfileModel from "../models/doctorProfile.model.js";
import userModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DateTime } from "luxon";

const DAY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const bookAppointment = asyncHandler(async (req, res) => {
  const {
    doctorId,
    slotStartUTC: rawStart,
    slotEndUTC: rawEnd,
    reason,
    notes,
    timezone = "UTC",
  } = req.body;

  if (!doctorId || !rawStart || !rawEnd || !reason) {
    throw new ApiError(
      400,
      "doctorId, slotStartUTC, slotEndUTC, and reason are required",
    );
  }

  const slotStart = DateTime.fromISO(rawStart, { zone: "utc" });
  const slotEnd = DateTime.fromISO(rawEnd, { zone: "utc" });

  if (!slotStart.isValid || !slotEnd.isValid) {
    throw new ApiError(
      400,
      "slotStartUTC and slotEndUTC must be valid datetime strings",
    );
  }

  if (slotEnd <= slotStart) {
    throw new ApiError(400, "slotEndUTC must be after slotStartUTC");
  }
  if (slotStart <= DateTime.utc()) {
    throw new ApiError(400, "Cannot book a slot in the past");
  }

  const doctor = await doctorProfileModel.findById(doctorId).lean();

  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  if (!doctor.isAcceptingAppointments) {
    throw new ApiError(
      409,
      "This doctor is not accepting appointments at the moment",
    );
  }

  const slotDateStr = slotStart.toFormat("yyyy-MM-dd");
  const dayKey = DAY_MAP[slotStart.weekday % 7];

  const windows = doctor.weeklyAvailability?.[dayKey] ?? [];

  if (windows.length === 0) {
    throw new ApiError(409, `Dr. is not available on ${dayKey}s`);
  }

  if (doctor.blackoutDates?.includes(slotDateStr)) {
    throw new ApiError(409, `The date ${slotDateStr} is blocked by the doctor`);
  }

  const reqStartHHMM = slotStart.toFormat("HH:mm");
  const reqEndHHMM = slotEnd.toFormat("HH:mm");

  const fitsWindow = windows.some(
    (w) => reqStartHHMM >= w.start && reqEndHHMM <= w.end,
  );

  if (!fitsWindow) {
    throw new ApiError(
      409,
      `Requested time ${reqStartHHMM}–${reqEndHHMM} is outside the doctor's availability window on ${dayKey}`,
    );
  }

  const requestedDurationMin = slotEnd.diff(slotStart, "minutes").minutes;
  if (requestedDurationMin !== doctor.slotDurationMin) {
    throw new ApiError(
      400,
      `Slot duration must be exactly ${doctor.slotDurationMin} minutes for this doctor`,
    );
  }

  const conflictCount = await appointmentModel.countDocuments({
    doctorId,
    status: { $in: ["PENDING", "CONFIRMED"] },
    slotStartUTC: { $lt: slotEnd.toJSDate() },
    slotEndUTC: { $gt: slotStart.toJSDate() },
  });

  if (conflictCount >= doctor.maxPatientsPerSlot) {
    throw new ApiError(
      409,
      "This slot is fully booked. Please choose another time.",
    );
  }

  const patientId = req.user?._id;

  if (!patientId) {
    throw new ApiError(401, "Authentication required to book an appointment");
  }

  const patient = await userModel
    .findById(patientId)
    .select("username email role")
    .lean();

  if (!patient) {
    throw new ApiError(404, "Authenticated patient not found");
  }

  if (patient.role !== "Patient") {
    throw new ApiError(403, "Only patients can book appointments");
  }

  const appointment = await appointmentModel.create({
    doctorId,
    patientId,
    slotStartUTC: slotStart.toJSDate(),
    slotEndUTC: slotEnd.toJSDate(),
    reason: reason.trim(),
    ...(notes ? { notes: notes.trim() } : {}),
    status: "PENDING",
  });

  let localTime;
  try {
    localTime = appointment.toLocalTime(timezone);
  } catch {
    localTime = appointment.toLocalTime("UTC");
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        bookingId: appointment.bookingId,
        status: appointment.status,

        slot: {
          startUTC: slotStart.toISO(),
          endUTC: slotEnd.toISO(),
          durationMin: requestedDurationMin,
          localStart: localTime.displayStart,
          localEnd: localTime.displayEnd,
          timezone,
        },

        patient: {
          id: patient._id,
          username: patient.username,
          email: patient.email,
        },

        doctor: {
          id: doctor._id,
          specialty: doctor.specialty,
          consultationFee: doctor.consultationFee,
          location: doctor.location,
        },

        reason: appointment.reason,
        ...(appointment.notes ? { notes: appointment.notes } : {}),
        bookedAt: appointment.createdAt,
      },
      "Appointment booked successfully",
    ),
  );
});

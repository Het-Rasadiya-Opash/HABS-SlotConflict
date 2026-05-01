import waitlistModel from "../models/waitlist.model.js";
import appointmentModel from "../models/appointment.model.js";
import doctorProfileModel from "../models/doctorProfile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DateTime } from "luxon";
import { IST } from "../utils/dateUtils.js";

function shapeEntry(entry, timezone = IST) {
  const tz = timezone || IST;

  const start = DateTime.fromJSDate(
    entry.slotStartUTC instanceof Date
      ? entry.slotStartUTC
      : new Date(entry.slotStartUTC),
    { zone: "utc" },
  ).setZone(tz);

  const end = DateTime.fromJSDate(
    entry.slotEndUTC instanceof Date
      ? entry.slotEndUTC
      : new Date(entry.slotEndUTC),
    { zone: "utc" },
  ).setZone(tz);

  return {
    _id: entry._id,
    waitlistId: entry.waitlistId,
    status: entry.status,
    position: entry.position,

    slot: {
      startUTC: entry.slotStartUTC,
      endUTC: entry.slotEndUTC,
      displayStart: start.toFormat("ccc, MMM d, yyyy, hh:mm a ZZZZ"),
      displayEnd: end.toFormat("hh:mm a"),
      timezone: tz,
    },

    doctor: entry.doctorId
      ? {
          id: entry.doctorId._id ?? entry.doctorId,
          name: entry.doctorId.userId?.username ?? null,
          email: entry.doctorId.userId?.email ?? null,
          specialty: entry.doctorId.specialty ?? null,
          location: entry.doctorId.location ?? null,
          consultationFee: entry.doctorId.consultationFee ?? null,
        }
      : null,

    patient: entry.patientId
      ? {
          id: entry.patientId._id ?? entry.patientId,
          username: entry.patientId.username ?? null,
          email: entry.patientId.email ?? null,
        }
      : null,

    reason: entry.reason ?? null,
    notifyWindowMin: entry.notifyWindowMin,
    notifiedAt: entry.notifiedAt ?? null,
    autoBookedAppointmentId: entry.autoBookedAppointmentId ?? null,
    bookedAt: entry.bookedAt ?? null,
    joinedAt: entry.createdAt,
  };
}

export const joinWaitlist = asyncHandler(async (req, res) => {
  const {
    doctorId,
    slotStartUTC: rawStart,
    slotEndUTC: rawEnd,
    reason,
    timezone = IST,
  } = req.body;

  const patientId = req.user?._id;

  if (!patientId) {
    throw new ApiError(401, "Authentication required");
  }
  if (req.user.role !== "Patient") {
    throw new ApiError(403, "Only patients can join the waitlist");
  }

  if (!doctorId || !rawStart || !rawEnd) {
    throw new ApiError(
      400,
      "doctorId, slotStartUTC, and slotEndUTC are required",
    );
  }

  const slotStart = DateTime.fromISO(rawStart, { zone: "utc" });
  const slotEnd = DateTime.fromISO(rawEnd, { zone: "utc" });

  if (!slotStart.isValid || !slotEnd.isValid) {
    throw new ApiError(
      400,
      "slotStartUTC and slotEndUTC must be valid ISO datetime strings",
    );
  }
  if (slotEnd <= slotStart) {
    throw new ApiError(400, "slotEndUTC must be after slotStartUTC");
  }
  if (slotStart <= DateTime.utc()) {
    throw new ApiError(400, "Cannot join the waitlist for a past slot");
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

  const currentBookings = await appointmentModel.countDocuments({
    doctorId,
    status: { $in: ["PENDING", "CONFIRMED"] },
    slotStartUTC: { $lt: slotEnd.toJSDate() },
    slotEndUTC: { $gt: slotStart.toJSDate() },
  });

  if (currentBookings < doctor.maxPatientsPerSlot) {
    throw new ApiError(
      409,
      "This slot still has availability — please book an appointment directly instead of joining the waitlist",
    );
  }

  const existing = await waitlistModel.findOne({
    doctorId,
    slotStartUTC: slotStart.toJSDate(),
    patientId,
    status: { $in: ["WAITING", "NOTIFIED"] },
  });

  if (existing) {
    throw new ApiError(
      409,
      `You are already on the waitlist for this slot at position #${existing.position} (${existing.waitlistId})`,
    );
  }

  const lastEntry = await waitlistModel
    .findOne({ doctorId, slotStartUTC: slotStart.toJSDate() })
    .sort({ position: -1 })
    .select("position")
    .lean();

  const position = lastEntry ? lastEntry.position + 1 : 1;

  const entry = await waitlistModel.create({
    doctorId,
    patientId,
    slotStartUTC: slotStart.toJSDate(),
    slotEndUTC: slotEnd.toJSDate(),
    position,
    reason: reason?.trim() || undefined,
    status: "WAITING",
  });

  await entry.populate([
    {
      path: "doctorId",
      select: "specialty location consultationFee",
      populate: { path: "userId", select: "username email" },
    },
    { path: "patientId", select: "username email" },
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        shapeEntry(entry, timezone),
        `Added to waitlist at position #${position}`,
      ),
    );
});

export const getMyWaitlist = asyncHandler(async (req, res) => {
  const patientId = req.user?._id;

  if (!patientId) {
    throw new ApiError(401, "Authentication required");
  }

  const waitlists = await waitlistModel
    .find({
      patientId,
      status: { $in: ["WAITING", "NOTIFIED"] },
    })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, waitlists, "Waitlist fetched successfully"));
});

export const leaveWaitlist = asyncHandler(async (req, res) => {
  const { waitlistId } = req.params;
  const patientId = req.user?._id;

  if (!patientId) {
    throw new ApiError(401, "Authentication required");
  }

  const waitlistEntry = await waitlistModel.findOne({
    waitlistId,
    patientId,
  });

  if (!waitlistEntry) {
    throw new ApiError(404, "Waitlist entry not found");
  }

  if (!["WAITING", "NOTIFIED"].includes(waitlistEntry.status)) {
    throw new ApiError(
      400,
      `Cannot leave waitlist. Current status is ${waitlistEntry.status}`,
    );
  }

  console.log(waitlistEntry.position);

  await waitlistModel.updateMany(
    {
      doctorId: waitlistEntry.doctorId,
      slotStartUTC: waitlistEntry.slotStartUTC,
      position: waitlistEntry.position,
      status: { $in: ["WAITING", "NOTIFIED"] },
    },
    {
      $inc: { position: -1 },
    },
  );

    waitlistEntry.status = "SKIPPED";
    await waitlistEntry.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Successfully left the waitlist"));
});

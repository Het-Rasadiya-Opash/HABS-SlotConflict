import doctorProfileModel from "../models/doctorProfile.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const defineWeeklyAvailability = asyncHandler(async (req, res) => {
  const { weeklyAvailability } = req.body;

  if (!weeklyAvailability) {
    throw new ApiError(400, "Weekly availability data is required");
  }

  const doctorProfile = await doctorProfileModel.findOne({
    userId: req.user?._id,
  });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  doctorProfile.weeklyAvailability = weeklyAvailability;

  const updatedProfile = await doctorProfile.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "Weekly availability updated successfully",
      ),
    );
});

export const createDoctorProfile = asyncHandler(async (req, res) => {
  const {
    specialty,
    qualifications,
    experienceYears,
    consultationFee,
    location,
    slotDurationMin,
    maxPatientsPerSlot,
    isAcceptingAppointments,
  } = req.body;

  if (!specialty || !location || !slotDurationMin) {
    throw new ApiError(
      400,
      "Specialty, location, and slot duration are required",
    );
  }

  const existingProfile = await doctorProfileModel.findOne({
    userId: req.user?._id,
  });
  if (existingProfile) {
    throw new ApiError(409, "Doctor profile already exists for this user");
  }

  const doctorProfile = await doctorProfileModel.create({
    userId: req.user?._id,
    specialty,
    qualifications,
    experienceYears,
    consultationFee,
    location,
    slotDurationMin,
    maxPatientsPerSlot,
    isAcceptingAppointments,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        doctorProfile,
        "Doctor profile created successfully",
      ),
    );
});

export const updateBlackoutDates = asyncHandler(async (req, res) => {
  const { blackoutDates } = req.body;

  if (!blackoutDates || !Array.isArray(blackoutDates)) {
    throw new ApiError(400, "Blackout dates are required and must be an array");
  }

  const doctorProfile = await doctorProfileModel.findOne({
    userId: req.user?._id,
  });

  if (!doctorProfile) {
    throw new ApiError(404, "Doctor profile not found");
  }

  const uniqueBlackoutDates = [...new Set(blackoutDates)];
  doctorProfile.blackoutDates = uniqueBlackoutDates;

  const updatedProfile = await doctorProfile.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedProfile,
        "Blackout dates updated successfully",
      ),
    );
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const doctorProfile = await doctorProfileModel.findOne({
    userId: req.user?._id,
  });

  if (!doctorProfile) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          null,
          "Doctor Profile Not Found, Please create a Doctor Profile",
        ),
      );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, doctorProfile, "Doctor Profile Fetch successfully"),
    );
});

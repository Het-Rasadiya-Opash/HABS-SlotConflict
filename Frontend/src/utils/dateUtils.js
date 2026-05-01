import { DateTime } from "luxon";

export const IST = "Asia/Calcutta";

export const toIST = (isoString) =>
  DateTime.fromISO(isoString, { zone: "utc" }).setZone(IST);

export const formatDateIST = (isoString) =>
  toIST(isoString).toFormat("ccc, MMM d, yyyy");

export const formatTimeIST = (isoString) =>
  toIST(isoString).toFormat("hh:mm a");

export const formatDateTimeIST = (isoString) =>
  `${formatDateIST(isoString)} – ${formatTimeIST(isoString)}`;

export const formatSlotRangeIST = (startISO, endISO) =>
  `${formatTimeIST(startISO)} – ${formatTimeIST(endISO)}`;

export const groupSlotsByISTDate = (slots) =>
  slots.reduce((acc, slot) => {
    const dateKey = toIST(slot.slotStartUTC).toFormat("yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

export const formatDateKeyIST = (dateKey) =>
  DateTime.fromISO(dateKey, { zone: IST }).toFormat("ccc, MMM d, yyyy");

export const todayIST = () =>
  DateTime.now().setZone(IST).toFormat("yyyy-MM-dd");

export const nowIST = () => DateTime.now().setZone(IST);

export const formatHHmmTo12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return DateTime.fromObject({ hour: h, minute: m }).toFormat("hh:mm a");
};

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(text = "") {
  const normalized = text.toLowerCase();
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (normalized.includes("today")) {
    return { label: "today", startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }

  if (normalized.includes("last quarter")) {
    const quarter = Math.floor(now.getMonth() / 3);
    const startMonth = quarter === 0 ? 9 : (quarter - 1) * 3;
    const year = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return {
      label: "last quarter",
      startDate: toIsoDate(new Date(year, startMonth, 1)),
      endDate: toIsoDate(new Date(year, startMonth + 3, 0)),
    };
  }

  if (normalized.includes("quarter")) {
    const startMonth = Math.floor(now.getMonth() / 3) * 3;
    return {
      label: "this quarter",
      startDate: toIsoDate(new Date(now.getFullYear(), startMonth, 1)),
      endDate: toIsoDate(end),
    };
  }

  if (normalized.includes("last month")) {
    return {
      label: "last month",
      startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      endDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 0)),
    };
  }

  if (normalized.includes("year")) {
    return {
      label: "this year",
      startDate: toIsoDate(new Date(now.getFullYear(), 0, 1)),
      endDate: toIsoDate(end),
    };
  }

  return {
    label: "this month",
    startDate: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    endDate: toIsoDate(end),
  };
}

module.exports = {
  getDateRange,
};

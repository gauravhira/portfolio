// Static, approximate US state -> IANA timezone mapping. States that
// straddle multiple zones (e.g. TN, ID, OR) are bucketed to their
// predominant zone — good enough for scheduling sends, not for precision
// geo work (that's what lat/lng would be for, which we're skipping).
const STATE_TIMEZONES = {
  // Eastern
  CT: "America/New_York",
  DE: "America/New_York",
  FL: "America/New_York",
  GA: "America/New_York",
  IN: "America/New_York",
  KY: "America/New_York",
  ME: "America/New_York",
  MD: "America/New_York",
  MA: "America/New_York",
  MI: "America/New_York",
  NH: "America/New_York",
  NJ: "America/New_York",
  NY: "America/New_York",
  NC: "America/New_York",
  OH: "America/New_York",
  PA: "America/New_York",
  RI: "America/New_York",
  SC: "America/New_York",
  VT: "America/New_York",
  VA: "America/New_York",
  WV: "America/New_York",
  DC: "America/New_York",

  // Central
  AL: "America/Chicago",
  AR: "America/Chicago",
  IL: "America/Chicago",
  IA: "America/Chicago",
  KS: "America/Chicago",
  LA: "America/Chicago",
  MN: "America/Chicago",
  MS: "America/Chicago",
  MO: "America/Chicago",
  NE: "America/Chicago",
  ND: "America/Chicago",
  OK: "America/Chicago",
  SD: "America/Chicago",
  TN: "America/Chicago",
  TX: "America/Chicago",
  WI: "America/Chicago",

  // Mountain
  AZ: "America/Denver",
  CO: "America/Denver",
  ID: "America/Denver",
  MT: "America/Denver",
  NM: "America/Denver",
  UT: "America/Denver",
  WY: "America/Denver",

  // Pacific
  CA: "America/Los_Angeles",
  NV: "America/Los_Angeles",
  OR: "America/Los_Angeles",
  WA: "America/Los_Angeles",

  // Non-contiguous
  AK: "America/Anchorage",
  HI: "Pacific/Honolulu",
};

const DEFAULT_TIMEZONE = "America/New_York";

// Looks for a recognized state abbreviation immediately after a comma
// (", TX", ", CA 78701", ", NY,") and scans from the rightmost match
// backward, since the real state code sits closest to the end of a
// standard "Street, City, ST ZIP, Country" address — earlier commas
// separating multi-word city names rarely produce a false two-letter match,
// but scanning back-to-front skips over ones like ", USA" (fails on the
// letter-boundary check) or coincidental two-caps in a country/suffix.
//
// Falls back to a bare trailing "City ST" pattern (no comma) since that's
// the shape of the leads table's `location` field, e.g. "Denver CO".
function extractStateAbbr(text) {
  if (!text) return null;

  const commaMatches = [...text.matchAll(/,\s*([A-Z]{2})\b/g)];
  for (let i = commaMatches.length - 1; i >= 0; i--) {
    const code = commaMatches[i][1];
    if (STATE_TIMEZONES[code]) return code;
  }

  const trailingMatch = text.trim().match(/\b([A-Z]{2})$/);
  if (trailingMatch && STATE_TIMEZONES[trailingMatch[1]]) return trailingMatch[1];

  return null;
}

function inferTimezone(address, location) {
  const fromAddress = extractStateAbbr(address);
  if (fromAddress) return STATE_TIMEZONES[fromAddress];

  const fromLocation = extractStateAbbr(location);
  if (fromLocation) return STATE_TIMEZONES[fromLocation];

  return DEFAULT_TIMEZONE;
}

module.exports = { inferTimezone, STATE_TIMEZONES, DEFAULT_TIMEZONE };

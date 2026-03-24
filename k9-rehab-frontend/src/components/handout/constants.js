// Printable Exercise Handout — Layout & Content Configuration
// Inspired by Canine Exercise Solutions multi-density format

export const DENSITIES = {
  FULL:       { perPage: 1, label: "1 per page — Detailed",          fontSize: 13, maxSteps: 10, trackingCol: false },
  STANDARD:   { perPage: 2, label: "2 per page",                     fontSize: 11, maxSteps: 7,  trackingCol: false },
  COMPACT3:   { perPage: 3, label: "3 per page",                     fontSize: 9,  maxSteps: 5,  trackingCol: false },
  TRACK3:     { perPage: 3, label: "3 per page + Tracking Column",   fontSize: 9,  maxSteps: 4,  trackingCol: true  },
  COMPACT5:   { perPage: 5, label: "5 per page — Summary",           fontSize: 8,  maxSteps: 3,  trackingCol: false },
  COMPACT6:   { perPage: 6, label: "6 per page — Quick Reference",   fontSize: 8,  maxSteps: 0,  trackingCol: false },
};

export const DEFAULT_TOGGLES = {
  steps: true,
  equipment: true,
  dosage: true,
  goodForm: true,
  redFlags: true,
  tracking: true,
  evidenceBadge: true,
};

export const TIER_COLORS = {
  "Evidence-Based": { bg: "#DCFCE7", text: "#166534", border: "#86EFAC" },
  "Evidence-Adjacent": { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
  "Consensus-Only": { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
};

export const DIFF_COLORS = {
  Easy: "#166534",
  Moderate: "#1E40AF",
  Advanced: "#92400E",
};

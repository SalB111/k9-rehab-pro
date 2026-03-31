// ============================================================================
// Exercise Library V2 — Domains, Phases, Tiers, Exercises
// ============================================================================

const domains = [
  { id: 'MOB', name: 'Mobility and Range of Motion', description: null },
  { id: 'WB', name: 'Weight Bearing and Foundational Strength', description: null },
  { id: 'CORE', name: 'Core Stability and Postural Control', description: null },
  { id: 'BAL', name: 'Balance and Proprioception', description: null },
  { id: 'GAIT', name: 'Gait Retraining', description: null },
  { id: 'END', name: 'Endurance and Cardiovascular Conditioning', description: null },
  { id: 'FUNC', name: 'Functional Strength and Task Training', description: null },
  { id: 'ATH', name: 'Athletic Performance and Return to Sport', description: null }
];

const phases = [
  { id: 1, name: 'Protection and Mobility', description: null },
  { id: 2, name: 'Early Strength', description: null },
  { id: 3, name: 'Advanced Strength and Coordination', description: null },
  { id: 4, name: 'Functional Reintegration', description: null },
  { id: 5, name: 'Return to Sport or Maintenance', description: null }
];

const tiers = [
  { id: 1, name: 'Passive or Fully Assisted', description: null },
  { id: 2, name: 'Low Load Active', description: null },
  { id: 3, name: 'Moderate Resistance or Coordination', description: null },
  { id: 4, name: 'Advanced Strength or Balance', description: null },
  { id: 5, name: 'Athletic or High Demand', description: null }
];

const exercises = [
  { id: 'MOB-P1-01', name: 'Passive Range of Motion', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-02', name: 'Passive Cycling', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-03', name: 'Joint Approximation', domain: 'MOB', category: 'Passive Mobility', phases: [1], tiers: [1] },
  { id: 'MOB-P1-04', name: 'Passive Stretching', domain: 'MOB', category: 'Passive Mobility', phases: [1,2], tiers: [1,2] },
  { id: 'MOB-PP-05', name: 'Assisted Limb Placement', domain: 'MOB', category: 'Assisted Mobility', phases: [1,2], tiers: [1,2] },
  { id: 'MOB-P1-06', name: 'Neurologic Toe Stimulation', domain: 'MOB', category: 'Assisted Mobility', phases: [1], tiers: [1] },

  { id: 'WB-TS-01', name: 'Sit to Stand', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
  { id: 'WB-TS-02', name: 'Stand to Sit', domain: 'WB', category: 'Transitional Strength', phases: [2,3,4], tiers: [2,3,4] },
  { id: 'WB-ST-03', name: 'Square Stand', domain: 'WB', category: 'Static Strength', phases: [1,2,3], tiers: [1,2] },
  { id: 'WB-ST-04', name: 'Static Hold Stand', domain: 'WB', category: 'Static Strength', phases: [2,3], tiers: [2,3] },
  { id: 'WB-ST-05', name: 'Three Legged Stand', domain: 'WB', category: 'Static Strength', phases: [3,4], tiers: [3,4] },
  { id: 'WB-AS-06', name: 'Assisted Standing', domain: 'WB', category: 'Supported Stance', phases: [1,2], tiers: [1,2] },
  { id: 'WB-WS-07', name: 'Lateral Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },
  { id: 'WB-WS-08', name: 'Cranial Caudal Weight Shift', domain: 'WB', category: 'Weight Shifting', phases: [2,3], tiers: [2,3] },

  { id: 'CORE-ST-01', name: 'Peanut Ball Stand', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
  { id: 'CORE-ST-02', name: 'Forelimb Elevation', domain: 'CORE', category: 'Static Core', phases: [2,3], tiers: [2,3] },
  { id: 'CORE-ST-03', name: 'Hindlimb Elevation', domain: 'CORE', category: 'Static Core', phases: [3,4], tiers: [3,4] },
  { id: 'CORE-DY-04', name: 'Diagonal Limb Lift', domain: 'CORE', category: 'Dynamic Core', phases: [3,4], tiers: [3,4] },
  { id: 'CORE-DY-05', name: 'Core Bracing Hold', domain: 'CORE', category: 'Dynamic Core', phases: [2,3], tiers: [2,3] },

  { id: 'BAL-ST-01', name: 'Balance Disc Stand', domain: 'BAL', category: 'Static Balance', phases: [2,3], tiers: [2,3] },
  { id: 'BAL-ST-02', name: 'Wobble Board Stand', domain: 'BAL', category: 'Static Balance', phases: [3,4], tiers: [3,4] },
  { id: 'BAL-DY-03', name: 'Rocking Weight Shift', domain: 'BAL', category: 'Dynamic Balance', phases: [2,3], tiers: [2,3] },
  { id: 'BAL-DY-04', name: 'Unstable Surface Stand', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },
  { id: 'BAL-DY-05', name: 'Lateral Platform Step', domain: 'BAL', category: 'Dynamic Balance', phases: [3,4], tiers: [3,4] },

  { id: 'GAIT-SL-01', name: 'Controlled Leash Walk', domain: 'GAIT', category: 'Straight Line', phases: [1,2,3,4], tiers: [1,2] },
  { id: 'GAIT-SL-02', name: 'Treadmill Walk', domain: 'GAIT', category: 'Straight Line', phases: [2,3,4], tiers: [2,3] },
  { id: 'GAIT-DIR-03', name: 'Figure 8 Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3] },
  { id: 'GAIT-DIR-04', name: 'Circle Walk', domain: 'GAIT', category: 'Directional', phases: [2,3,4], tiers: [2,3] },
  { id: 'GAIT-DIR-05', name: 'Backward Walk', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
  { id: 'GAIT-DIR-06', name: 'Side Step', domain: 'GAIT', category: 'Directional', phases: [3,4], tiers: [3,4] },
  { id: 'GAIT-OBS-07', name: 'Low Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3] },
  { id: 'GAIT-OBS-08', name: 'Raised Cavaletti', domain: 'GAIT', category: 'Obstacle', phases: [4,5], tiers: [4] },
  { id: 'GAIT-OBS-09', name: 'Obstacle Step', domain: 'GAIT', category: 'Obstacle', phases: [3,4], tiers: [3,4] },

  { id: 'END-AQ-01', name: 'Underwater Treadmill', domain: 'END', category: 'Aquatic', phases: [2,3,4], tiers: [2,3] },
  { id: 'END-AQ-02', name: 'Swimming', domain: 'END', category: 'Aquatic', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-03', name: 'Hill Walking', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-04', name: 'Incline Treadmill', domain: 'END', category: 'Land Endurance', phases: [3,4], tiers: [3,4] },
  { id: 'END-LD-05', name: 'Stair Climbing', domain: 'END', category: 'Land Endurance', phases: [3,4,5], tiers: [3,4] },
  { id: 'END-LD-06', name: 'Endurance Leash Walking', domain: 'END', category: 'Land Endurance', phases: [2,3,4], tiers: [2,3] },

  { id: 'FUNC-TR-01', name: 'Sit to Beg', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
  { id: 'FUNC-TR-02', name: 'Pivot Exercise', domain: 'FUNC', category: 'Transitional Movements', phases: [3,4], tiers: [3,4] },
  { id: 'FUNC-TR-03', name: 'Tight Turns', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4], tiers: [3] },
  { id: 'FUNC-TR-04', name: 'Platform Step', domain: 'FUNC', category: 'Environmental Navigation', phases: [3,4,5], tiers: [3,4] },
  { id: 'FUNC-TR-05', name: 'Controlled Fetch', domain: 'FUNC', category: 'Task Specific', phases: [4,5], tiers: [4,5] },

  { id: 'ATH-PL-01', name: 'Low Jump Grid', domain: 'ATH', category: 'Plyometric', phases: [4,5], tiers: [4,5] },
  { id: 'ATH-PL-02', name: 'Sprint Intervals', domain: 'ATH', category: 'Sprint', phases: [5], tiers: [5] },
  { id: 'ATH-PL-03', name: 'Direction Change Drill', domain: 'ATH', category: 'Agility', phases: [4,5], tiers: [4,5] },
  { id: 'ATH-PL-04', name: 'Sport Obstacle Sequence', domain: 'ATH', category: 'Agility', phases: [5], tiers: [5] }
];

module.exports = {
  domains,
  phases,
  tiers,
  exercises
};
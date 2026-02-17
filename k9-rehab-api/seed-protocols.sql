-- K9 Rehab Pro: TPLO Protocol Seed
-- Run AFTER seed-exercises.sql

-- First insert the 4 TPLO phase protocols
INSERT INTO protocols (slug, name, condition, phase, goal, description) VALUES
  ('tplo-weeks-0-2',  'TPLO Post-Op: Weeks 0-2',  'TPLO', 'weeks_0_2',  'Reduce swelling, pain control, initiate weight bearing', 'Immediate post-surgical phase focusing on inflammation management and gentle tissue healing.'),
  ('tplo-weeks-2-6',  'TPLO Post-Op: Weeks 2-6',  'TPLO', 'weeks_2_6',  'Restore range of motion, begin strengthening', 'Progressive rehabilitation building controlled mobility and early strengthening.'),
  ('tplo-weeks-6-10', 'TPLO Post-Op: Weeks 6-10', 'TPLO', 'weeks_6_10', 'Build strength and endurance, improve gait', 'Intermediate phase emphasizing functional strength and normalized gait mechanics.'),
  ('tplo-weeks-10-16','TPLO Post-Op: Weeks 10-16','TPLO', 'weeks_10_16','Return to full activity and sport conditioning', 'Final rehabilitation phase restoring full function and preparing for return to activity.')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Weeks 0-2: passive exercises only
INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 1, 3, 10, NULL, 3,
  'Gentle passive ROM only. Ice after each session 15 min.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-0-2' AND e.slug IN ('prom-stifle','cold-therapy','effleurage','massage-thera')
ON CONFLICT DO NOTHING;

INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 2, 3, 10, NULL, 3,
  'Add weight shifting when comfortable. Continue icing.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-0-2' AND e.slug IN ('prom-stifle','prom-hip','cold-therapy','weight-shift')
ON CONFLICT DO NOTHING;

-- Weeks 2-6: add controlled walking
INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 3, 3, NULL, 300, 3,
  'Begin 5 min leash walks, increase by 2 min/day.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-2-6' AND e.slug IN ('slow-walk','sit-stand','prom-stifle','heat-therapy')
ON CONFLICT DO NOTHING;

INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 4, 3, 15, NULL, 2,
  'Add sit-stands. Goal: 15 reps without hesitation.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-2-6' AND e.slug IN ('sit-stand','slow-walk','curb-walk','cavaletti-rails')
ON CONFLICT DO NOTHING;

-- Weeks 6-10: strengthening
INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 7, 3, 12, NULL, 2,
  'Begin hill work and step exercises. Monitor for gait asymmetry.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-6-10' AND e.slug IN ('hill-climb','three-leg-stand','stair-climb','cavaletti-rails','figure-8')
ON CONFLICT DO NOTHING;

-- Weeks 10-16: return to sport
INSERT INTO protocol_exercises (protocol_id, exercise_id, week_number, sets, reps, duration_seconds, frequency_per_day, notes)
SELECT 
  p.id, e.id, 11, 4, 15, NULL, 2,
  'Advanced strengthening. Clear for jogging if full weight bearing.'
FROM protocols p, exercises e
WHERE p.slug = 'tplo-weeks-10-16' AND e.slug IN ('stair-run','resist-walk','slow-trot','down-stand','hill-climb')
ON CONFLICT DO NOTHING;

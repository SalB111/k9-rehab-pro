// ai-storyboard-animator.js — Generates animation keyframe data from storyboard frames
// Converts 14-point storyboard data into smooth SVG animation sequences

/**
 * Dog silhouette keyframe poses mapped to common exercise actions.
 * Each pose defines joint positions on a 0-100 coordinate system.
 * The SVG dog silhouette will interpolate between these poses.
 */
const DOG_POSES = {
  standing: {
    body: { x: 50, y: 40, rotation: 0 },
    head: { x: 30, y: 28, rotation: -5 },
    tail: { x: 78, y: 35, rotation: 15 },
    frontLeg: { hip: { x: 38, y: 52 }, knee: { x: 36, y: 68 }, paw: { x: 36, y: 82 } },
    hindLeg: { hip: { x: 65, y: 52 }, knee: { x: 68, y: 68 }, paw: { x: 68, y: 82 } },
    spine: [{ x: 30, y: 38 }, { x: 42, y: 36 }, { x: 55, y: 36 }, { x: 68, y: 38 }]
  },
  sitting: {
    body: { x: 50, y: 45, rotation: 5 },
    head: { x: 32, y: 25, rotation: -10 },
    tail: { x: 72, y: 55, rotation: -20 },
    frontLeg: { hip: { x: 38, y: 55 }, knee: { x: 35, y: 70 }, paw: { x: 34, y: 82 } },
    hindLeg: { hip: { x: 62, y: 58 }, knee: { x: 70, y: 68 }, paw: { x: 60, y: 78 } },
    spine: [{ x: 32, y: 35 }, { x: 44, y: 38 }, { x: 56, y: 42 }, { x: 66, y: 50 }]
  },
  lying_lateral: {
    body: { x: 50, y: 60, rotation: 0 },
    head: { x: 25, y: 52, rotation: -15 },
    tail: { x: 80, y: 58, rotation: 5 },
    frontLeg: { hip: { x: 35, y: 65 }, knee: { x: 30, y: 72 }, paw: { x: 25, y: 78 } },
    hindLeg: { hip: { x: 68, y: 65 }, knee: { x: 75, y: 72 }, paw: { x: 80, y: 78 } },
    spine: [{ x: 28, y: 58 }, { x: 42, y: 58 }, { x: 58, y: 58 }, { x: 72, y: 58 }]
  },
  walking: {
    body: { x: 48, y: 40, rotation: -2 },
    head: { x: 26, y: 30, rotation: -8 },
    tail: { x: 76, y: 36, rotation: 20 },
    frontLeg: { hip: { x: 36, y: 52 }, knee: { x: 30, y: 66 }, paw: { x: 28, y: 80 } },
    hindLeg: { hip: { x: 64, y: 52 }, knee: { x: 72, y: 66 }, paw: { x: 74, y: 80 } },
    spine: [{ x: 28, y: 38 }, { x: 40, y: 36 }, { x: 54, y: 36 }, { x: 68, y: 37 }]
  },
  flexion: {
    body: { x: 50, y: 58, rotation: 0 },
    head: { x: 28, y: 50, rotation: -10 },
    tail: { x: 78, y: 56, rotation: 5 },
    frontLeg: { hip: { x: 36, y: 62 }, knee: { x: 32, y: 70 }, paw: { x: 30, y: 78 } },
    hindLeg: { hip: { x: 65, y: 62 }, knee: { x: 60, y: 55 }, paw: { x: 55, y: 62 } },
    spine: [{ x: 30, y: 55 }, { x: 42, y: 55 }, { x: 56, y: 56 }, { x: 68, y: 58 }]
  },
  extension: {
    body: { x: 50, y: 58, rotation: 0 },
    head: { x: 28, y: 50, rotation: -10 },
    tail: { x: 78, y: 56, rotation: 5 },
    frontLeg: { hip: { x: 36, y: 62 }, knee: { x: 32, y: 70 }, paw: { x: 30, y: 78 } },
    hindLeg: { hip: { x: 65, y: 62 }, knee: { x: 72, y: 75 }, paw: { x: 75, y: 82 } },
    spine: [{ x: 30, y: 55 }, { x: 42, y: 55 }, { x: 56, y: 56 }, { x: 68, y: 58 }]
  }
};

/**
 * Map frame titles/actions to dog poses
 */
function detectPoseFromFrame(frame) {
  const text = `${frame.frame_title} ${frame.dog_action} ${frame.frame_description}`.toLowerCase();

  if (text.includes('sit') && !text.includes('sit to stand')) return 'sitting';
  if (text.includes('lateral') || text.includes('lying') || text.includes('recumbent')) return 'lying_lateral';
  if (text.includes('walk') || text.includes('gait') || text.includes('stride')) return 'walking';
  if (text.includes('flexion') || text.includes('flex')) return 'flexion';
  if (text.includes('extension') || text.includes('extend') || text.includes('return')) return 'extension';
  if (text.includes('stand') || text.includes('position') || text.includes('setup')) return 'standing';
  if (text.includes('sit to stand') || text.includes('rise')) return 'standing';
  return 'standing';
}

/**
 * Interpolate between two values
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Interpolate between two pose objects
 */
function interpolatePose(poseA, poseB, t) {
  const result = {};
  for (const key of Object.keys(poseA)) {
    const a = poseA[key];
    const b = poseB[key];
    if (Array.isArray(a)) {
      result[key] = a.map((pt, i) => ({
        x: lerp(pt.x, b[i].x, t),
        y: lerp(pt.y, b[i].y, t)
      }));
    } else if (typeof a === 'object' && a !== null) {
      result[key] = {};
      for (const subKey of Object.keys(a)) {
        if (typeof a[subKey] === 'object' && a[subKey] !== null) {
          result[key][subKey] = {};
          for (const k of Object.keys(a[subKey])) {
            result[key][subKey][k] = lerp(a[subKey][k], b[subKey][k], t);
          }
        } else {
          result[key][subKey] = lerp(a[subKey], b[subKey], t);
        }
      }
    }
  }
  return result;
}

/**
 * Generate animation keyframes from storyboard data
 *
 * @param {Object} storyboard - Full 14-point storyboard object
 * @returns {Object} Animation data with keyframes, timeline, and metadata
 */
function generateAnimationData(storyboard) {
  if (!storyboard || !storyboard.frames || storyboard.frames.length === 0) {
    return null;
  }

  const frames = storyboard.frames;
  let cumulativeTime = 0;

  const keyframes = frames.map((frame, index) => {
    const pose = detectPoseFromFrame(frame);
    const dogPose = DOG_POSES[pose] || DOG_POSES.standing;
    const startTime = cumulativeTime;
    cumulativeTime += frame.duration_seconds || 4;

    return {
      frameNumber: frame.frame_number,
      title: frame.frame_title,
      description: frame.frame_description,
      dogAction: frame.dog_action,
      handlerAction: frame.handler_action,
      clinicalCues: frame.clinical_cues,
      safetyNotes: frame.safety_notes,
      status: frame.status,

      // Timing
      startTime,
      duration: frame.duration_seconds || 4,
      endTime: startTime + (frame.duration_seconds || 4),

      // Dog pose
      pose: dogPose,
      poseType: pose,

      // SVG overlays
      indicators: (frame.svg_indicators || []).map(ind => ({
        type: ind.type,
        x: ind.x,
        y: ind.y,
        label: ind.label,
        color: ind.color,
        angleStart: ind.angle_start,
        angleEnd: ind.angle_end,
        dx: ind.dx,
        dy: ind.dy,
        region: ind.region,
        rx: ind.rx,
        ry: ind.ry
      })),

      // CSS transition config
      transition: {
        property: 'all',
        duration: index === 0 ? 0 : 0.8,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    };
  });

  // Generate interpolation midpoints (for smooth animation between frames)
  const interpolatedFrames = [];
  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i];
    const next = keyframes[i + 1];
    interpolatedFrames.push(current);

    // Add 2 interpolation frames between each keyframe
    const steps = 2;
    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const interpolatedPose = interpolatePose(current.pose, next.pose, t);
      interpolatedFrames.push({
        frameNumber: current.frameNumber + t,
        title: current.title,
        description: '(transition)',
        isInterpolation: true,
        startTime: lerp(current.startTime, next.startTime, t),
        duration: 0,
        pose: interpolatedPose,
        poseType: `${current.poseType}_to_${next.poseType}`,
        indicators: [],
        transition: { property: 'all', duration: 0.3, easing: 'linear' }
      });
    }
  }
  // Add last keyframe
  if (keyframes.length > 0) {
    interpolatedFrames.push(keyframes[keyframes.length - 1]);
  }

  return {
    exerciseCode: storyboard.exercise_code,
    exerciseName: storyboard.exercise_name,
    clinicalPurpose: storyboard.clinical_purpose,
    totalFrames: frames.length,
    totalDuration: cumulativeTime,
    keyframes,
    interpolatedFrames,
    overlayGroups: storyboard.overlay_groups || {},
    branding: storyboard.branding || {},
    clientScript: storyboard.client_script || null,
    clinicianScript: storyboard.clinician_script || null,

    // Timeline markers for scrubber
    timeline: keyframes.map(kf => ({
      frameNumber: kf.frameNumber,
      title: kf.title,
      startTime: kf.startTime,
      endTime: kf.endTime,
      duration: kf.duration
    }))
  };
}

/**
 * Get the dog pose at a specific time in the animation
 */
function getPoseAtTime(animationData, time) {
  if (!animationData || !animationData.keyframes.length) return null;

  const { keyframes } = animationData;

  // Before first frame
  if (time <= keyframes[0].startTime) return keyframes[0];

  // After last frame
  const last = keyframes[keyframes.length - 1];
  if (time >= last.endTime) return last;

  // Find current and next keyframe
  for (let i = 0; i < keyframes.length - 1; i++) {
    const current = keyframes[i];
    const next = keyframes[i + 1];
    if (time >= current.startTime && time < next.startTime) {
      const t = (time - current.startTime) / (next.startTime - current.startTime);
      return {
        ...current,
        pose: interpolatePose(current.pose, next.pose, t),
        interpolationT: t
      };
    }
  }

  return last;
}

module.exports = {
  generateAnimationData,
  getPoseAtTime,
  DOG_POSES,
  interpolatePose
};

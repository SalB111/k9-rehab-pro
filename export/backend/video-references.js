// ============================================================================
// VIDEO DEMONSTRATION REFERENCES
// K9-REHAB-PRO - Professional Exercise Video Metadata
// Medical-Grade Video Library System
// ============================================================================

const CAMERA_ANGLES = {
  LATERAL: 'lateral',      // Side view (primary angle for most exercises)
  FRONTAL: 'frontal',      // Front view
  OVERHEAD: 'overhead',    // Top-down view
  CLOSEUP: 'closeup',      // Close-up detail shots
  HANDLER_POV: 'handler_pov', // Handler's perspective
  REAR: 'rear'             // Rear view (for gait analysis)
};

const VIDEO_QUALITY = {
  HD_1080: { code: '1080p', label: '1080p HD', bitrate: '4000k', resolution: '1920x1080' },
  HD_720: { code: '720p', label: '720p HD', bitrate: '2500k', resolution: '1280x720' },
  SD_480: { code: '480p', label: '480p SD', bitrate: '1000k', resolution: '854x480' }
};

// ============================================================================
// INSTRUCTORS DATABASE
// Certified veterinary rehabilitation professionals
// ============================================================================
const INSTRUCTORS = {
  DR_JANE_SMITH: {
    id: 'dr_jane_smith',
    name: 'Dr. Jane Smith',
    credentials: ['DVM', 'CCRP', 'CCRT'],
    title: 'Board Certified Veterinary Rehabilitation Specialist',
    institution: 'University of Tennessee College of Veterinary Medicine',
    photo_url: '/assets/instructor-photos/dr_jane_smith.jpg',
    bio: 'Dr. Smith has 15 years of experience in veterinary rehabilitation, specializing in post-surgical orthopedic recovery and sports medicine for canine athletes.',
    certifications: [
      {
        type: 'CCRP',
        full_name: 'Certified Canine Rehabilitation Practitioner',
        issuing_body: 'University of Tennessee',
        year_obtained: 2010
      },
      {
        type: 'CCRT',
        full_name: 'Certified Canine Rehabilitation Therapist',
        issuing_body: 'CCRT',
        year_obtained: 2012
      },
      {
        type: 'DVM',
        full_name: 'Doctor of Veterinary Medicine',
        issuing_body: 'Cornell University',
        year_obtained: 2008
      }
    ],
    specializations: ['Post-surgical rehabilitation', 'Orthopedic conditions', 'Manual therapy']
  },

  DR_ROBERT_JOHNSON: {
    id: 'dr_robert_johnson',
    name: 'Dr. Robert Johnson',
    credentials: ['DVM', 'CCRP', 'CVPP'],
    title: 'Veterinary Pain Management & Rehabilitation Specialist',
    institution: 'Colorado State University',
    photo_url: '/assets/instructor-photos/dr_robert_johnson.jpg',
    bio: 'Dr. Johnson focuses on therapeutic exercise prescription and pain management strategies for canine patients with chronic conditions.',
    certifications: [
      {
        type: 'CCRP',
        full_name: 'Certified Canine Rehabilitation Practitioner',
        issuing_body: 'University of Tennessee',
        year_obtained: 2015
      },
      {
        type: 'CVPP',
        full_name: 'Certified Veterinary Pain Practitioner',
        issuing_body: 'IVAPM',
        year_obtained: 2017
      }
    ],
    specializations: ['Chronic pain management', 'Geriatric rehabilitation', 'Strengthening protocols']
  }
};

// ============================================================================
// VIDEO LIBRARY
// Comprehensive metadata for exercise demonstration videos
// ============================================================================
const VIDEO_LIBRARY = {

  // ==========================================================================
  // PASSIVE RANGE OF MOTION - STIFLE
  // Most commonly prescribed post-surgical exercise
  // ==========================================================================
  PROM_STIFLE: {
    exercise_code: 'PROM_STIFLE',
    production_date: '2025-09-15',
    version: '2.1',
    certification_status: 'Certified Demonstration',
    review_date: '2025-12-01',
    last_updated: '2026-02-10',

    // Primary instructor
    instructor: INSTRUCTORS.DR_JANE_SMITH,

    // Multiple camera angles for comprehensive viewing
    angles: [
      {
        angle: CAMERA_ANGLES.LATERAL,
        angle_label: 'Side View (Sagittal Plane)',
        is_primary: true,
        duration_seconds: 180,
        description: 'Primary demonstration showing proper hand placement and range of motion arc from lateral perspective',

        videos: [
          {
            quality: VIDEO_QUALITY.HD_1080.code,
            url: '/assets/videos/exercises/PROM_STIFLE_lateral_1080p.mp4',
            file_size_mb: 45,
            format: 'mp4',
            codec: 'H.264'
          },
          {
            quality: VIDEO_QUALITY.HD_720.code,
            url: '/assets/videos/exercises/PROM_STIFLE_lateral_720p.mp4',
            file_size_mb: 20,
            format: 'mp4',
            codec: 'H.264'
          },
          {
            quality: VIDEO_QUALITY.SD_480.code,
            url: '/assets/videos/exercises/PROM_STIFLE_lateral_480p.mp4',
            file_size_mb: 8,
            format: 'mp4',
            codec: 'H.264'
          }
        ],

        thumbnail: '/assets/videos/thumbnails/PROM_STIFLE_lateral_thumb.jpg',

        // Clinical annotations at specific timestamps
        annotations: [
          {
            timestamp: 15,
            timestamp_display: '0:15',
            type: 'instruction',
            title: 'Proper Hand Placement',
            description: 'Note the stabilization of the femur with the proximal hand while the distal hand grasps the tibia just above the hock. This prevents compensatory movement.',
            evidence_reference_id: 'PROM_CCL', // Links to evidence-references.js
            safety_level: 'info'
          },
          {
            timestamp: 45,
            timestamp_display: '0:45',
            type: 'technique',
            title: 'Smooth Flexion Motion',
            description: 'Observe the slow, controlled flexion through the available range. Movement should take 3-5 seconds to complete the arc.',
            safety_level: 'info'
          },
          {
            timestamp: 60,
            timestamp_display: '1:00',
            type: 'warning',
            title: 'Stop Point Recognition',
            description: 'CRITICAL: Stop immediately if patient vocalizes, guards, or shows signs of discomfort. Never force beyond pain-free range.',
            safety_level: 'warning'
          },
          {
            timestamp: 90,
            timestamp_display: '1:30',
            type: 'evidence',
            title: 'Evidence-Based Benefit',
            description: 'Marsolais et al. (2003) demonstrated that early PROM post-CCL surgery reduces complications by 40% and improves outcomes at 12 weeks.',
            evidence_reference_id: 'PROM_CCL',
            safety_level: 'info'
          },
          {
            timestamp: 120,
            timestamp_display: '2:00',
            type: 'technique',
            title: 'Extension Phase',
            description: 'Return to neutral position with same controlled speed. Maintain consistent rhythm throughout all repetitions.',
            safety_level: 'info'
          },
          {
            timestamp: 150,
            timestamp_display: '2:30',
            type: 'instruction',
            title: 'Repetition Guidelines',
            description: 'Perform 10-15 repetitions per session, 2-3 times daily in acute phase. Progress to 20-25 reps as tolerated.',
            safety_level: 'info'
          }
        ],

        // Fallback options if local video unavailable
        fallback_youtube: 'https://youtube.com/watch?v=EXAMPLE_PROM_STIFLE',
        fallback_vimeo: null
      },

      {
        angle: CAMERA_ANGLES.FRONTAL,
        angle_label: 'Front View (Frontal Plane)',
        is_primary: false,
        duration_seconds: 120,
        description: 'Front-facing view demonstrating patient positioning and handler stance',

        videos: [
          {
            quality: VIDEO_QUALITY.HD_1080.code,
            url: '/assets/videos/exercises/PROM_STIFLE_frontal_1080p.mp4',
            file_size_mb: 30,
            format: 'mp4',
            codec: 'H.264'
          },
          {
            quality: VIDEO_QUALITY.HD_720.code,
            url: '/assets/videos/exercises/PROM_STIFLE_frontal_720p.mp4',
            file_size_mb: 15,
            format: 'mp4',
            codec: 'H.264'
          }
        ],

        thumbnail: '/assets/videos/thumbnails/PROM_STIFLE_frontal_thumb.jpg',

        annotations: [
          {
            timestamp: 10,
            timestamp_display: '0:10',
            type: 'instruction',
            title: 'Patient Positioning',
            description: 'Front view shows optimal lateral recumbency positioning. Note comfortable surface padding and patient relaxation.',
            safety_level: 'info'
          },
          {
            timestamp: 40,
            timestamp_display: '0:40',
            type: 'technique',
            title: 'Handler Stance',
            description: 'Observe proper ergonomic positioning of handler to prevent fatigue and maintain control.',
            safety_level: 'info'
          }
        ]
      },

      {
        angle: CAMERA_ANGLES.CLOSEUP,
        angle_label: 'Close-Up Detail',
        is_primary: false,
        duration_seconds: 90,
        description: 'Detailed close-up of hand positioning and joint mechanics',

        videos: [
          {
            quality: VIDEO_QUALITY.HD_1080.code,
            url: '/assets/videos/exercises/PROM_STIFLE_closeup_1080p.mp4',
            file_size_mb: 25,
            format: 'mp4',
            codec: 'H.264'
          }
        ],

        thumbnail: '/assets/videos/thumbnails/PROM_STIFLE_closeup_thumb.jpg',

        annotations: [
          {
            timestamp: 10,
            timestamp_display: '0:10',
            type: 'technique',
            title: 'Grip Detail',
            description: 'Close-up of proper finger placement for stifle stabilization. Note gentle but firm contact.',
            safety_level: 'info'
          },
          {
            timestamp: 45,
            timestamp_display: '0:45',
            type: 'instruction',
            title: 'Joint Motion Arc',
            description: 'Detailed view of the tibiofemoral joint moving through flexion. Watch for smooth, uninterrupted motion.',
            safety_level: 'info'
          }
        ]
      }
    ],

    // Client education variant (simplified version for pet owners)
    client_version: {
      simplified_language: true,
      video_url: '/assets/videos/exercises/PROM_STIFLE_client_720p.mp4',
      duration_seconds: 120,
      thumbnail: '/assets/videos/thumbnails/PROM_STIFLE_client_thumb.jpg',
      key_points: [
        'Always move slowly and gently - take 3-5 seconds per movement',
        'Stop immediately if your dog shows any pain or discomfort',
        'Do this exercise 2-3 times per day as directed by your veterinarian',
        'Call your vet if you notice increased swelling, heat, or limping'
      ],
      safety_warnings: [
        'Never force the joint beyond comfortable range',
        'Keep your dog calm and relaxed during the exercise',
        'Watch for signs of pain: whining, pulling away, or muscle tensing'
      ]
    },

    // Transcript for download
    transcript: {
      professional: [
        {
          time: '0:00',
          speaker: 'Dr. Smith',
          text: 'In this demonstration, we will show proper passive range of motion technique for the stifle joint, a critical intervention for post-surgical CCL repair patients.'
        },
        {
          time: '0:15',
          speaker: 'Dr. Smith',
          text: 'First, stabilize the femur with your proximal hand, ensuring the patient is in comfortable lateral recumbency on a padded surface.'
        },
        {
          time: '0:30',
          speaker: 'Dr. Smith',
          text: 'With your distal hand, gently grasp the tibia just above the hock. This positioning allows you to control the tibiofemoral joint while preventing compensatory hip movement.'
        },
        {
          time: '0:45',
          speaker: 'Dr. Smith',
          text: 'Slowly flex the stifle through the available pain-free range. This should take 3 to 5 seconds. Notice the smooth, controlled motion without any jerking or forcing.'
        },
        {
          time: '1:00',
          speaker: 'Dr. Smith',
          text: 'If at any point the patient vocalizes, guards, or shows signs of discomfort, stop immediately. Never force beyond the pain-free range.'
        },
        {
          time: '1:30',
          speaker: 'Dr. Smith',
          text: 'Research by Marsolais and colleagues in 2003 demonstrated that early PROM reduces post-surgical complications by 40% and significantly improves functional outcomes.'
        },
        {
          time: '2:00',
          speaker: 'Dr. Smith',
          text: 'Return to neutral position with the same controlled speed. Maintain this consistent rhythm throughout all repetitions.'
        },
        {
          time: '2:30',
          speaker: 'Dr. Smith',
          text: 'Perform 10 to 15 repetitions per session, 2 to 3 times daily during the acute phase. Progress to 20-25 repetitions as the patient tolerates.'
        },
        {
          time: '2:50',
          speaker: 'Dr. Smith',
          text: 'Remember: PROM is contraindicated within 48 hours post-surgery, during acute inflammation, or if there is joint instability.'
        }
      ],
      client: [
        {
          time: '0:00',
          speaker: 'Dr. Smith',
          text: 'Let me show you how to gently exercise your dog\'s knee at home to help with recovery.'
        },
        {
          time: '0:15',
          speaker: 'Dr. Smith',
          text: 'Have your dog lie comfortably on their side on a soft surface. Place one hand on their thigh to keep it steady.'
        },
        {
          time: '0:30',
          speaker: 'Dr. Smith',
          text: 'With your other hand, gently hold their lower leg just above the paw. Slowly bend the knee toward their chest, taking about 5 seconds.'
        },
        {
          time: '0:50',
          speaker: 'Dr. Smith',
          text: 'If your dog whines, pulls away, or seems uncomfortable, stop right away. Never force the movement.'
        },
        {
          time: '1:10',
          speaker: 'Dr. Smith',
          text: 'Gently straighten the leg back out, taking the same amount of time. Do this 10-15 times, 2-3 times a day.'
        },
        {
          time: '1:40',
          speaker: 'Dr. Smith',
          text: 'Call your vet if you notice more swelling, if the leg feels hot, or if your dog seems more painful than before.'
        }
      ]
    },

    // Continuing education metadata (future-ready)
    ce_credit_eligible: true,
    ce_credit_hours: 0.5,
    ce_category: 'Technical Skills - Manual Therapy',
    ce_provider: 'K9 Rehab Pro Academy',
    ce_provider_number: 'KRP-2025-001',
    quiz_required: true,
    quiz_passing_score: 80,
    certificate_available: true,

    // Analytics tracking (future-ready)
    view_tracking: true,
    completion_tracking: true,
    bookmark_enabled: true
  },

  // ==========================================================================
  // SIT-TO-STAND TRANSITIONS
  // Foundational strengthening exercise
  // ==========================================================================
  SIT_STAND: {
    exercise_code: 'SIT_STAND',
    production_date: '2025-10-01',
    version: '1.5',
    certification_status: 'Certified Demonstration',
    review_date: '2025-12-15',
    last_updated: '2026-01-20',

    instructor: INSTRUCTORS.DR_ROBERT_JOHNSON,

    angles: [
      {
        angle: CAMERA_ANGLES.LATERAL,
        angle_label: 'Side View',
        is_primary: true,
        duration_seconds: 150,
        description: 'Side view demonstrating weight shift and hindlimb loading patterns',

        videos: [
          {
            quality: VIDEO_QUALITY.HD_1080.code,
            url: '/assets/videos/exercises/SIT_STAND_lateral_1080p.mp4',
            file_size_mb: 40,
            format: 'mp4',
            codec: 'H.264'
          },
          {
            quality: VIDEO_QUALITY.HD_720.code,
            url: '/assets/videos/exercises/SIT_STAND_lateral_720p.mp4',
            file_size_mb: 18,
            format: 'mp4',
            codec: 'H.264'
          }
        ],

        thumbnail: '/assets/videos/thumbnails/SIT_STAND_lateral_thumb.jpg',

        annotations: [
          {
            timestamp: 20,
            timestamp_display: '0:20',
            type: 'instruction',
            title: 'Initial Sit Position',
            description: 'Patient should be in square sit position with equal weight distribution. Avoid "puppy sitting" or asymmetric postures.',
            safety_level: 'info'
          },
          {
            timestamp: 50,
            timestamp_display: '0:50',
            type: 'technique',
            title: 'Weight Shift Cues',
            description: 'Use treat lure to encourage forward weight shift onto hindlimbs. Observe quadriceps and gluteal muscle engagement.',
            evidence_reference_id: 'THERAPEUTIC_EX_OA',
            safety_level: 'info'
          },
          {
            timestamp: 80,
            timestamp_display: '1:20',
            type: 'warning',
            title: 'Common Compensation',
            description: 'Watch for patients pushing off with forelimbs instead of hindlimbs. This indicates insufficient hindlimb strength or pain.',
            safety_level: 'warning'
          },
          {
            timestamp: 110,
            timestamp_display: '1:50',
            type: 'technique',
            title: 'Full Stand Achievement',
            description: 'Patient should achieve complete hip and stifle extension. Hold position for 3-5 seconds before releasing.',
            safety_level: 'info'
          }
        ]
      },

      {
        angle: CAMERA_ANGLES.REAR,
        angle_label: 'Rear View (Gait Analysis)',
        is_primary: false,
        duration_seconds: 120,
        description: 'Rear view showing bilateral weight distribution and symmetry',

        videos: [
          {
            quality: VIDEO_QUALITY.HD_1080.code,
            url: '/assets/videos/exercises/SIT_STAND_rear_1080p.mp4',
            file_size_mb: 35,
            format: 'mp4',
            codec: 'H.264'
          }
        ],

        thumbnail: '/assets/videos/thumbnails/SIT_STAND_rear_thumb.jpg',

        annotations: [
          {
            timestamp: 30,
            timestamp_display: '0:30',
            type: 'instruction',
            title: 'Symmetry Assessment',
            description: 'From rear view, assess bilateral weight distribution. Patient should load both hindlimbs equally during rise.',
            safety_level: 'info'
          }
        ]
      }
    ],

    client_version: {
      simplified_language: true,
      video_url: '/assets/videos/exercises/SIT_STAND_client_720p.mp4',
      duration_seconds: 90,
      key_points: [
        'Have your dog sit squarely with weight on both back legs',
        'Use a treat to encourage them to stand up slowly',
        'Make sure they use their back legs to push up, not just their front legs',
        'Repeat 5-10 times, 2-3 times per day'
      ],
      safety_warnings: [
        'Stop if your dog seems painful or reluctant',
        'Use non-slip surface to prevent slipping',
        'Don\'t force if they can\'t complete the movement'
      ]
    },

    transcript: {
      professional: [
        {
          time: '0:00',
          speaker: 'Dr. Johnson',
          text: 'Sit-to-stand transitions are a foundational strengthening exercise targeting the quadriceps, gluteal muscles, and hamstrings.'
        },
        {
          time: '0:20',
          speaker: 'Dr. Johnson',
          text: 'Begin with the patient in a square sit position with equal weight distribution on both hindlimbs. Avoid allowing puppy sitting or asymmetric postures.'
        },
        {
          time: '0:50',
          speaker: 'Dr. Johnson',
          text: 'Use a treat lure to encourage forward weight shift onto the hindlimbs. Observe for quadriceps and gluteal muscle engagement as they prepare to rise.'
        },
        {
          time: '1:20',
          speaker: 'Dr. Johnson',
          text: 'A common compensation is pushing off with the forelimbs instead of the hindlimbs. This indicates either insufficient hindlimb strength or pain avoidance.'
        },
        {
          time: '1:50',
          speaker: 'Dr. Johnson',
          text: 'The patient should achieve complete hip and stifle extension in the standing position. Hold this position for 3-5 seconds before releasing the reward.'
        }
      ],
      client: [
        {
          time: '0:00',
          speaker: 'Dr. Johnson',
          text: 'This exercise helps strengthen your dog\'s back legs and is great for recovery from surgery or managing arthritis.'
        },
        {
          time: '0:20',
          speaker: 'Dr. Johnson',
          text: 'Have your dog sit with their weight evenly on both back legs, not off to one side.'
        },
        {
          time: '0:40',
          speaker: 'Dr. Johnson',
          text: 'Hold a treat just above their nose and slightly forward. This encourages them to push up with their back legs.'
        },
        {
          time: '1:00',
          speaker: 'Dr. Johnson',
          text: 'Make sure they\'re using their back legs to stand, not just pulling themselves up with their front legs.'
        }
      ]
    },

    ce_credit_eligible: true,
    ce_credit_hours: 0.25,
    ce_category: 'Therapeutic Exercise',
    view_tracking: true,
    completion_tracking: true
  }

};

// ============================================================================
// HELPER FUNCTIONS
// Utility functions for accessing video metadata
// ============================================================================

/**
 * Get video metadata by exercise code
 * @param {string} exerciseCode - Exercise code (e.g., 'PROM_STIFLE')
 * @returns {Object|null} Video metadata object or null if not found
 */
function getVideosByExerciseCode(exerciseCode) {
  return VIDEO_LIBRARY[exerciseCode] || null;
}

/**
 * Get primary camera angle for an exercise
 * @param {string} exerciseCode - Exercise code
 * @returns {Object|null} Primary angle object or null
 */
function getPrimaryAngle(exerciseCode) {
  const videoData = VIDEO_LIBRARY[exerciseCode];
  if (!videoData || !videoData.angles) return null;
  return videoData.angles.find(angle => angle.is_primary) || videoData.angles[0];
}

/**
 * Get annotations near a specific timestamp
 * @param {string} exerciseCode - Exercise code
 * @param {string} angle - Camera angle
 * @param {number} timestamp - Current timestamp in seconds
 * @param {number} threshold - Time threshold in seconds (default 3)
 * @returns {Array} Array of relevant annotations
 */
function getAnnotationsByTimestamp(exerciseCode, angle, timestamp, threshold = 3) {
  const videoData = VIDEO_LIBRARY[exerciseCode];
  if (!videoData || !videoData.angles) return [];

  const angleData = videoData.angles.find(a => a.angle === angle);
  if (!angleData || !angleData.annotations) return [];

  return angleData.annotations.filter(ann =>
    Math.abs(ann.timestamp - timestamp) < threshold
  );
}

/**
 * Get instructor by ID
 * @param {string} instructorId - Instructor ID
 * @returns {Object|null} Instructor object or null
 */
function getInstructorById(instructorId) {
  return Object.values(INSTRUCTORS).find(inst => inst.id === instructorId) || null;
}

/**
 * Get all exercises with video available
 * @returns {Array} Array of exercise codes with videos
 */
function getExercisesWithVideos() {
  return Object.keys(VIDEO_LIBRARY);
}

/**
 * Get all videos by instructor
 * @param {string} instructorId - Instructor ID
 * @returns {Array} Array of video metadata objects
 */
function getVideosByInstructor(instructorId) {
  return Object.values(VIDEO_LIBRARY).filter(
    video => video.instructor.id === instructorId
  );
}

/**
 * Get video statistics
 * @returns {Object} Statistics about video library
 */
function getVideoStats() {
  const totalExercises = Object.keys(VIDEO_LIBRARY).length;
  const totalAngles = Object.values(VIDEO_LIBRARY).reduce(
    (sum, video) => sum + (video.angles ? video.angles.length : 0),
    0
  );
  const totalAnnotations = Object.values(VIDEO_LIBRARY).reduce(
    (sum, video) => sum + (video.angles ? video.angles.reduce(
      (angleSum, angle) => angleSum + (angle.annotations ? angle.annotations.length : 0),
      0
    ) : 0),
    0
  );

  return {
    total_exercises: totalExercises,
    total_angles: totalAngles,
    total_annotations: totalAnnotations,
    total_instructors: Object.keys(INSTRUCTORS).length,
    ce_eligible: Object.values(VIDEO_LIBRARY).filter(v => v.ce_credit_eligible).length
  };
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  CAMERA_ANGLES,
  VIDEO_QUALITY,
  INSTRUCTORS,
  VIDEO_LIBRARY,
  getVideosByExerciseCode,
  getPrimaryAngle,
  getAnnotationsByTimestamp,
  getInstructorById,
  getExercisesWithVideos,
  getVideosByInstructor,
  getVideoStats
};

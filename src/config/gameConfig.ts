export const gameConfig = {
  // Milestones for the solar system (Pre-Warp Phase)
  milestones: [
    { name: "Moon", distance: 384000, sessionsRequired: { "10min": 6, "30min": 2, "1hour": 1 } },
    { name: "Mars", distance: 1152000, sessionsRequired: { "10min": 18, "30min": 6, "1hour": 3 } },
    { name: "Jupiter", distance: 2304000, sessionsRequired: { "10min": 36, "30min": 12, "1hour": 6 } },
    { name: "Saturn", distance: 3840000, sessionsRequired: { "10min": 60, "30min": 20, "1hour": 10 } },
    { name: "Uranus", distance: 6720000, sessionsRequired: { "10min": 105, "30min": 35, "1hour": 18 } },
    { name: "Neptune", distance: 10080000, sessionsRequired: { "10min": 158, "30min": 53, "1hour": 26 } },
    { name: "Pluto", distance: 15120000, sessionsRequired: { "10min": 237, "30min": 79, "1hour": 39 } }
  ],

  spaceship: {
    model: "Basic Craft",
    multiplier: 1,
    baseSpeed: {
      "10sec": 15120000,    // Test speed for 10-second sessions
      "10min": 64000,
      "30min": 192000,
      "1hour": 384000
    },
    description: "A standard spacecraft with reliable propulsion based on realistic solar system distances."
  }
}; 
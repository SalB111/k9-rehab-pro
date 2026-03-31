async function progressTrackerAgent({ species, dogName, catName, weeksPostSurgery }) {
  if (species === "feline") {
    return {
      species,
      name: catName || "your cat",
      weeksPostSurgery,
      checklist: [
        "Is your cat grooming normally?",
        "Any hiding or withdrawal?",
        "Any decrease in jumping or mobility?",
        "Any signs of irritability or sensitivity when touched?",
        "Appetite normal?",
        "Litterbox habits normal?"
      ],
      flags: [
        {
          condition: "Week 6 milestone not met",
          message: "If your cat is still avoiding the operated limb or hiding frequently by week 6, contact your veterinarian."
        }
      ]
    };
  }

  return {
    species,
    name: dogName || "your dog",
    weeksPostSurgery,
    checklist: [
      "Is your dog bearing weight on the operated limb?",
      "Any increase in swelling?",
      "Any increase in limping?",
      "Any signs of pain?",
      "Energy level normal?",
      "Incision area looks normal?"
    ],
    flags: [
      {
        condition: "Week 6 milestone not met",
        message: "If your dog is still not bearing weight by week 6, contact your veterinarian."
      }
    ]
  };
}

module.exports = progressTrackerAgent;
const names = [
  [
    "Color Reaction",
    "colorReaction"
  ],
  [
    "Color + Shape",
    "colorShape"
  ],
  [
    "Memory Match",
    "memoryMatch"
  ],
  [
    "Pro Challenge",
    "proChallenge"
  ],
  [
    "Pattern Recognition",
    "patternRecognition"
  ],
  [
    "Number Memory",
    "numberMemory"
  ],
  [
    "Sequence Memory",
    "sequenceMemory"
  ],
  [
    "Juice Maker",
    "juiceMaker"
  ],
  [
    "Pattern Prediction",
    "patternPrediction"
  ],
  [
    "Shape Sorting",
    "shapeSorting"
  ],
  [
    "Twin Hunt",
    "twinHunt"
  ],
  [
    "Quick Count",
    "quickCount"
  ],
  [
    "Speed Match",
    "speedMatch"
  ],
  [
    "Light Track",
    "lightTrack"
  ],
  [
    "Color Invaders",
    "colorInvaders"
  ],
  [
    "Reverse Sequence",
    "reverseSequence"
  ],
  [
    "Visual Search",
    "visualSearch"
  ],
  [
    "Stroop Color",
    "stroopColor"
  ],
  [
    "Reaction Target",
    "reactionTarget"
  ],
  [
    "Speed Tap",
    "speedTap"
  ],
  [
    "Quick Color",
    "quickColor"
  ],
  [
    "Go / No-Go",
    "goNoGo"
  ],
  [
    "Memory Matrix",
    "memoryMatrix"
  ],
  [
    "Shape Stack",
    "shapeStack"
  ],
  [
    "N-Back",
    "nBack"
  ],
  [
    "Odd Color",
    "oddColor"
  ],
  [
    "Odd Size",
    "oddSize"
  ],
  [
    "Spot Difference",
    "spotDifference"
  ],
  [
    "Find Max",
    "findMax"
  ],
  [
    "Tap Order",
    "tapOrder"
  ],
  [
    "Math Flash",
    "mathFlash"
  ],
  [
    "Higher Lower",
    "higherLower"
  ],
  [
    "Number Sequence",
    "numberSequence"
  ],
  [
    "Even Odd",
    "evenOdd"
  ],
  [
    "Color Sort",
    "colorSort"
  ],
  [
    "Shape Match",
    "shapeMatch"
  ],
  [
    "Robot Mission",
    "robotMission"
  ]
];

export const gameDefinitions = names.map(([name, nameKey], index) => ({ id: index + 1, name, nameKey }));

export function gameName(id) {
  return gameDefinitions[id - 1]?.name;
}

export function gameLabels(translate) {
  return gameDefinitions.map(game => {
    const label = translate(game.nameKey);
    return label && label !== game.nameKey ? label : game.name;
  });
}

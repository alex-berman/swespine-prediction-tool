export const dataModel = [
  {
    "name": "Diagnosis",
    "type": "categorical",
    "num_categories": 1
  },
  {
    "name": "OperatedLevels",
    "type": "categorical",
    "num_categories": 5
  },
  {
    "name": "kliniktyp",
    "type": "categorical",
    "num_categories": 3
  },
  {
    "name": "AgeAtSurgery",
    "type": "numerical",
    "range": { "min": 10, "max": 110, "step": 1 }
  },
  {
    "name": "Female",
    "type": "binary"
  },
  {
    "name": "IsUnemployed",
    "type": "binary"
  },
  {
    "name": "HasSickPension",
    "type": "binary"
  },
  {
    "name": "HasAgePension",
    "type": "binary"
  },
  {
    "name": "IsSmoker",
    "type": "binary"
  },
  {
    "name": "IsPreviouslyOperated",
    "type": "binary"
  },
  {
    "name": "HasOtherIllness",
    "type": "binary"
  },
  {
    "name": "EQ5DIndex",
    "type": "numerical",
    "range": { "min": -0.59, "max": 1, "step": 0.01 }
  },
  {
    "name": "AbilityWalking",
    "type": "categorical",
    "num_categories": 4
  },
  {
    "name": "DurationLegPain",
    "type": "categorical",
    "num_categories": 5
  },
  {
    "name": "DurationBackPain",
    "type": "categorical",
    "num_categories": 5
  },
  {
    "name": "NRSLegPain",
    "type": "numerical",
    "range": { "min": 0, "max": 10, "step": 1 }
  },
  {
    "name": "NRSBackPain",
    "type": "numerical",
    "range": { "min": 0, "max": 10, "step": 1 }
  },
  {
    "name": "ODI",
    "type": "numerical",
    "range": { "min": 0, "max": 100, "step": 1 }
  }
];

export function getDataDefinition(name) {
  for(const dataDefinition of dataModel) {
    if(dataDefinition.name == name) {
      return dataDefinition;
    }
  }
  throw new Error('Failed to get data definition for ' + name);
}
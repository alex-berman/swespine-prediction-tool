export const dataModel = [
  {
    "name": "diagnosis",
    "type": "categorical",
    "categories": ["disc_herniation"]
  },
  {
    "name": "nivaer",
    "type": "ordinal",
    "categories": [1, 2, 3, 4, 5]
  },
  {
    "name": "kliniktyp",
    "type": "categorical",
    "categories": ["Offentlig", "Privat", "Universitetssjukhus"]
  },
  {
    "name": "AgeAtSurgery",
    "type": "numerical",
    "range": { "min": 10, "max": 110 }
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
    "range": { "min": -0.59, "max": 1 }
  },
  {
    "name": "AbilityWalking",
    "type": "categorical",
    "categories": [1, 2, 3, 4]
  },
  {
    "name": "DurationLegPain",
    "type": "categorical",
    "categories": [0, 1, 2, 3, 4]
  },
  {
    "name": "DurationBackPain",
    "type": "categorical",
    "categories": [0, 1, 2, 3, 4]
  },
  {
    "name": "NRSLegPain",
    "type": "numerical",
    "range": { "min": 0, "max": 10 }
  },
  {
    "name": "NRSBackPain",
    "type": "numerical",
    "range": { "min": 0, "max": 10 }
  },
  {
    "name": "ODI",
    "type": "numerical",
    "range": { "min": 0, "max": 100 }
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
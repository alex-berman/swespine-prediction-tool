export const tabs = [
  {
    "name": "base_information",
    "label": "Basinformation",
    "groups": [
      {
        "header": "Undergrupp",
        "fields": [
          {
            "name": "diagnosis",
            "type": "select",
            "labels": ["Diskbråck"]
          },
          {
            "name": "nivaer",
            "type": "radio",
            "labels": [1, 2, 3, 4, 5]
          },
          {
            "name": "kliniktyp",
            "type": "select",
            "labels": ["Offentlig", "Privat", "Universitetssjukhus"]
          },
        ]
      },
      {
        "header": "Sociodemografi",
        "fields": [
          {
            "name": "AgeAtSurgery",
            "type": "number"
          },
          {
            "name": "Female",
            "type": "toggle",
            "labels": ["Kvinna", "Man"]
          },
          {
            "name": "IsUnemployed",
            "type": "toggle",
            "labels": ["Ja", "Nej"]
          },
          {
            "name": "HasSickPension",
            "type": "toggle",
            "labels": ["Ja, heltid / deltid", "Nej"]
          },
          {
            "name": "HasAgePension",
            "type": "toggle",
            "labels": ["Ja, heltid / deltid", "Nej"]
          },
        ]
      },
      {
        "header": "Hälsoprofil",
        "fields": [
          {
            "name": "IsSmoker",
            "type": "toggle",
            "labels": ["Ja", "Nej"]
          },
          {
            "name": "IsPreviouslyOperated",
            "type": "toggle",
            "labels": ["Ja", "Nej"]
          },
          {
            "name": "HasOtherIllness",
            "type": "toggle",
            "labels": ["Ja", "Nej"]
          },
          {
            "name": "EQ5DIndex",
            "type": "number"
          },
        ]
      }
    ]
  },
  {
    "name": "diagnosis_specific_information",
    "label": "Ryggspecifik information",
    "groups": [
      {
        "header": "Sociodemografi",
        "fields": [
          {
            "name": "AbilityWalking",
            "type": "select",
            "labels": ["0-100 meter", "100-500 meter", "0,5-1 kilometer", "Mer än 1 kilometer"]
          },
          {
            "name": "DurationLegPain",
            "type": "select",
            "labels": ["Ingen smärta", "Mindre än 3 månader", "3 till 12 månader", "1 till 2 år", "Mer än 2 år"]
          },
          {
            "name": "DurationBackPain",
            "type": "select",
            "labels": ["Ingen smärta", "Mindre än 3 månader", "3 till 12 månader", "1 till 2 år", "Mer än 2 år"]
          },
        ]
      },
      {
        "header": "Hälsoprofil",
        "fields": [
          {
            "name": "NRSLegPain",
            "type": "number"
          },
          {
            "name": "NRSBackPain",
            "type": "number"
          },
        ]
      },
      {
        "header": "Funktionsnedsättning",
        "fields": [
          {
            "name": "ODI",
            "type": "number"
          }
        ]
      }
    ]
  }
];

export function getLayoutField(name) {
  for(const tab of tabs) {
    for(const group of tab.groups) {
      for(const field of group.fields) {
        if(field.name == name) {
          return field;
        }
      }
    }
  }
  throw new Error('Failed to get layout field for ' + name);
}
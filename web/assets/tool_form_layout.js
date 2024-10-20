export const tabs = [
  {
    "name": "base_information",
    "label": "Basinformation",
    "groups": [
      {
        "header": "Undergrupp",
        "fields": [
          {
            "name": "Diagnosis",
            "label": "Diagnosgrupp",
            "type": "select",
            "labels": ["Diskbråck"]
          },
          {
            "name": "OperatedLevels",
            "label": "Opererade nivåer",
            "type": "radio",
            "labels": ["1", "2", "3", "4", "5+"]
          },
          {
            "name": "kliniktyp",
            "label": "Kliniktyp",
            "type": "select",
            "labels": ["Offentlig", "Privat", "Universitetssjukhus"]
          }
        ]
      },
      {
        "header": "Sociodemografi",
        "fields": [
          {
            "name": "AgeAtSurgery",
            "label": "Ålder",
            "type": "number"
          },
          {
            "name": "Female",
            "label": "Kön",
            "type": "toggle",
            "labels": ["Man", "Kvinna"]
          },
          {
            "name": "IsUnemployed",
            "label": "Arbetslös",
            "type": "toggle",
            "labels": ["Nej", "Ja"]
          },
          {
            "name": "HasSickPension",
            "label": "Sjukpension",
            "type": "toggle",
            "labels": ["Nej", "Ja, heltid / deltid"]
          },
          {
            "name": "HasAgePension",
            "label": "Ålderspension",
            "type": "toggle",
            "labels": ["Nej", "Ja, heltid / deltid"]
          },
        ]
      },
      {
        "header": "Hälsoprofil",
        "fields": [
          {
            "name": "IsSmoker",
            "label": "Rökare",
            "type": "toggle",
            "labels": ["Nej", "Ja"]
          },
          {
            "name": "IsPreviouslyOperated",
            "label": "Tidigare ryggopererad",
            "type": "toggle",
            "labels": ["Nej", "Ja"]
          },
          {
            "name": "HasOtherIllness",
            "label": "Samsjuklighet",
            "type": "toggle",
            "labels": ["Nej", "Ja"]
          },
          {
            "name": "EQ5DIndex",
            "label": "EQ5D",
            "type": "number"
          }
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
            "label": "Promenadsträcka",
            "type": "select",
            "labels": ["0-100 meter", "100-500 meter", "0,5-1 kilometer", "Mer än 1 kilometer"]
          },
          {
            "name": "DurationLegPain",
            "label": "Smärtduration i ben",
            "type": "select",
            "labels": ["Ingen smärta", "Mindre än 3 månader", "3 till 12 månader", "1 till 2 år", "Mer än 2 år"]
          },
          {
            "name": "DurationBackPain",
            "label": "Smärtduration i rygg",
            "type": "select",
            "labels": ["Ingen smärta", "Mindre än 3 månader", "3 till 12 månader", "1 till 2 år", "Mer än 2 år"]
          }
        ]
      },
      {
        "header": "Hälsoprofil",
        "fields": [
          {
            "name": "NRSLegPain",
            "label": "Smärta i ben",
            "type": "number"
          },
          {
            "name": "NRSBackPain",
            "label": "Smärta i rygg",
            "type": "number"
          }
        ]
      },
      {
        "header": "Funktionsnedsättning",
        "fields": [
          {
            "name": "ODI",
            "label": "Funktionsnedsättning",
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
COVARIATES = {
    'AgeAtSurgery': {
        'label': 'Age',
        'type': 'continuous',
        'description': 'Age at surgery',
    },
    'ClinicType': {
        'label': 'Clinical department type',
        'type': 'categorical',
        'description': 'Clinical department type',
        'values': [1,2,3]
    },
    'HasOtherIllness': {
        'label': 'Comorbidity',
        'type': 'binary',
        'description': 'Comorbidity',
        'values': [0,1],
    },
    'HasSickPension': {
        'label': 'Disability pension',
        'type': 'binary',
        'description': 'Disability pension',
        'values': [0, 1],
    },
    'DurationBackPain': {
        'label': 'Duration of pain in back',
        'type': 'continuous',
        'description': 'Duration of pain in back',
        'values': [0, 1, 2, 3, 4],
    },
    'DurationLegPain': {
        'label': 'Duration of pain in legs',
        'type': 'continuous',
        'description': 'Duration of pain in legs',
        'values': [0, 1, 2, 3, 4, 5],
    },
    'Diagnosis': {
        'label': 'Diagnosis',
        'type': 'categorical',
        'description': 'Diagnosis',
    },
    'ODI': {
        'label': 'Functional impairment ODI',
        'type': 'continuous',
        'description': 'Functional impairment ODI',
    },
    'Female': {
        'label': 'Female',
        'type': 'binary',
        'description': 'Female',
        'values': [0, 1],
    },
    'OpLevel': {
        'label': 'Operated levels',
        'type': 'continuous',
        'description': 'Operated levels',
        'values': [1, 2, 3, 4, 5],
    },
    'NRSBackPain': {
        'label': 'Preoperative pain (NRS) - back',
        'type': 'continuous',
        'description': 'Preoperative pain (NRS) - back',
        'values': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    'NRSLegPain': {
        'label': 'Preoperative pain (NRS) - legs',
        'type': 'continuous',
        'description': 'Preoperative pain (NRS) - legs',
        'values': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    'IsPreviouslyOperated': {
        'label': 'Previous spine surgery',
        'type': 'binary',
        'description': 'Previous spine surgery',
        'values': [0, 1],
    },
    'EQ5DIndex': {
        'label': 'Quality of life (EQ-5D)',
        'type': 'continuous',
        'description': 'Quality of life (EQ-5D)',
    },
    'HasAgePension': {
        'label': 'Retirement pension',
        'type': 'binary',
        'description': 'Retirement pension',
        'values': [0, 1],
    },
    'IsSmoker': {
        'label': 'Smoker',
        'type': 'binary',
        'description': 'Smoker',
        'values': [0, 1],
    },
    'IsUnemployed': {
        'label': 'Unemployed',
        'type': 'binary',
        'description': 'Unemployed',
        'values': [0, 1],
    },
    'AbilityWalking': {
        'label': 'Walking distance',
        'type': 'categorical',
        'description': 'Walking distance',
        'values': [1, 2, 3, 4],
    },
    'ODI_1y': {
        'label': 'Functional impairment ODI (1 year)',
        'type': 'continuous',
        'description': 'Functional impairment ODI',
    },
    'GALegPain_1y': {
        'label': 'Global Assessment Leg Pain (1 year)',
        'type': 'continuous',
        'description': 'Global Assessment Leg Pain',
        'values': [0, 1, 2, 3, 4, 5],
    },
    'GABackPain_1y': {
        'label': 'Global Assessment Back Pain (1 year)',
        'type': 'continuous',
        'description': 'Global Assessment Back Pain (1 year)',
        'values': [0, 1, 2, 3, 4, 5],
    },
    'IsSatisfied_1y': {
        'label': 'Is Satisfied with Surgery results (1 year)',
        'type': 'binary',
        'description': 'Is Satisfied with Surgery results (1 year)',
        'values': [0, 1],
    },
    'InpatientStay': {
        'label': 'InpatientStay (days)',
        'type': 'continuous',
        'description': 'InpatientStay (days)',
        'values': [0, 1, 2, 3, 4, 5],
    }
}


FEATURE_SETS = {
    'disc_herniation': {
        'satisfaction': [
            'IsUnemployed',
            'Female',
            'EQ5DIndex',
            'NRSLegPain',
            'NRSBackPain',
            'AbilityWalking',
            'IsSmoker',
            'HasOtherIllness',
            'HasSickPension',
            'DurationBackPain',
            'IsPreviouslyOperated',
            'HasAgePension',
        ],
    },
}


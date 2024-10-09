export const outcome_disc_herniation_coefs = {
    /*"Intercept": [4.32725],*/
    "Thresholds": [ /* NOTE: Mock values! (for ordered probit) */
      1,
      2,
      4.32725,
      4.35
    ],
    "AgeAtSurgery": -0.01126,
    "HasOtherIllness": [
        -0.41546
    ],
    "HasSickPension": [
        -0.19164
    ],
    "DurationBackPain": [
        0.4661,
        0.42352,
        0.21287,
        0.20795
    ],
    "DurationLegPain": [
        -1.2153,
        -1.39618,
        -1.92908,
        -2.04056
    ],
    "ODI": -0.00463,
    "NRSBackPain": -0.13298,
    "EQ5DIndex": -0.09878,
    "HasAgePension": [
        0.07075
    ],
    "IsSmoker": [
        -0.29212
    ],
    "IsUnemployed": [
        -0.5682
    ],
    "AbilityWalking": [
        -0.24478,
        -0.17931,
        -0.1227
    ],
    "IsPreviouslyOperated": [
        -0.41282
    ]
};
from sklearn.linear_model import LogisticRegression


TASKS = {
    'disc_herniation': {
        'satisfaction': {
            'target': 'IsSatisfied_1y',
            'estimator': LogisticRegression,
        },
        # 'ga': {
        #     'target': 'GALegPain_1y',
        #     'estimator': OrderedModel,
        # },
    },
}


SELECTION = {
  'type': 'uniform', # grid/uniform
  'iter': 20,
  'folds': 5
}


ESTIMATOR_PARAMS = {
    LogisticRegression: {
        'C': [0.1, 1, 2, 5, 10, 20, 50, 100],
        'solver': ['liblinear'],
    },
}

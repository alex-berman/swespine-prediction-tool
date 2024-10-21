from sklearn.linear_model import LogisticRegression


TASKS = {
    'satisfaction': {
        'target': 'IsSatisfied_1y',
        'estimator': LogisticRegression,
        'params': {
            'C': [ 0.1, 1, 2, 5, 10, 20, 50, 100],
            'solver': ['liblinear'],
        }
    }
}


SELECTION = {
  'type': 'uniform', # grid/uniform
  'iter': 20,
  'folds': 5
}

import pickle as pkl

def get_model_paths(diagnosis, task):
    model_dir = 'models'
    cv_file = f'{model_dir}/{diagnosis}_{task}.cv.pkl'
    model_file = f'{model_dir}/{diagnosis}_{task}.refit.pkl'
    results_file = f'{model_dir}/{diagnosis}_{task}.results.pkl'
    return model_dir, cv_file, model_file, results_file

def load_model(path):
    with open(path, 'rb') as f:
        clf = pkl.load(f)
    return clf

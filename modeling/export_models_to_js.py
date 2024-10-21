import pickle as pkl
import json

from tasks import TASKS
from util import get_model_paths, load_model
from preprocess import name_combiner # noqa
from sklearn.linear_model import LogisticRegression

DATA_FOLDER = 'data'
TARGET_FOLDER = '../web/assets/models'


def coef_name(x):
    """ Convert potential floating-point based suffix to integer-based suffix """
    if x.endswith('.0'):
        return x[0:-2]
    return x


def export_batch():
    result = {}
    for diagnosis, tasks in TASKS.items():
        result[diagnosis] = {}
        for task, task_config in tasks.items():
            target = task_config['target']
            preprocessing_asset = pkl.load(open(f'{DATA_FOLDER}/{diagnosis}_{task}.pkl', 'rb'))
            preprocessed_data = preprocessing_asset['preprocessed_data']
            cols = preprocessed_data.columns
            y_cols = [c for c in cols if c==target or c.startswith(target+'__')]
            x_cols = [c for c in cols if not c in y_cols]

            model_dir, model_file, cv_file, results_file = get_model_paths(diagnosis, task)
            estimator = load_model(model_file)

            result[diagnosis][task] = {}
            r = result[diagnosis][task]
            if task_config['estimator'] == LogisticRegression:
                r['Intercept'] = estimator.intercept_.tolist()
                assert len(x_cols) == len(estimator.coef_[0])
                for x_col, coef in zip(x_cols, estimator.coef_[0]):
                    r[coef_name(x_col)] = coef
    print(json.dumps(result, indent=2))

if __name__ == '__main__':
    export_batch()

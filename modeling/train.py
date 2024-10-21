import os
import pickle as pkl

from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.metrics import roc_auc_score, accuracy_score

from tasks import TASKS, SELECTION, ESTIMATOR_PARAMS
from util import get_model_paths, load_model
from preprocess import name_combiner # noqa

DATA_FOLDER = 'data'


def fit_model(diagnosis, task, model, params, data, selection_config, output_dir='', scoring='roc_auc'):
    sel_type = selection_config['type']
    sel_iter = selection_config['iter']

    print('Fitting estimator \'%s\' with parameters: %s' % (model, str(params)))

    shared_params = {'refit': True}
    if sel_type == 'grid':
        clf_cv = GridSearchCV(model(), params, scoring=scoring, **shared_params).fit(data[0], data[1])
    elif sel_type == 'uniform':
        iter = sel_iter
        clf_cv = RandomizedSearchCV(model(), params, n_iter=iter, scoring=scoring, **shared_params).fit(data[0],
                                                                                                        data[1])
    else:
        raise Exception('Unsuported selection type: %s' % sel_type)

    model_dir, model_file, cv_file, results_file = get_model_paths(diagnosis, task)
    os.makedirs(model_dir, exist_ok=True)
    pkl.dump(clf_cv, open(cv_file, 'wb'))

    print('Best parameters found: ', clf_cv.best_params_)
    print('Best CV score: ', clf_cv.best_score_)
    pkl.dump(clf_cv.best_estimator_, open(model_file, 'wb'))


def train_batch():
    for diagnosis, tasks in TASKS.items():
        for task, task_config in tasks.items():
            target = task_config['target']
            estimator = task_config['estimator']
            params = ESTIMATOR_PARAMS[estimator]
            preprocessing_asset = pkl.load(open(f'{DATA_FOLDER}/{diagnosis}_{task}.pkl', 'rb'))
            preprocessed_data = preprocessing_asset['preprocessed_data']
            cols = preprocessed_data.columns
            y_cols = [c for c in cols if c==target or c.startswith(target+'__')]
            x_cols = [c for c in cols if not c in y_cols]
            y_col = target + '__1.0'
            x = preprocessed_data[x_cols]
            y = preprocessed_data[y_col]
            fit_model(diagnosis, task, estimator, params, (x, y), SELECTION)

            model_dir, model_file, cv_file, results_file = get_model_paths(diagnosis, task)
            clf = load_model(model_file)
            auc = roc_auc_score(y, clf.predict_proba(x)[:,1])
            acc = accuracy_score(y, clf.predict(x))
            print(f'AUC: {auc}')
            print(f'Accuracy: {acc}')


if __name__ == '__main__':
    train_batch()

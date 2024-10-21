import os
import pickle

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler
import sklearn

from features import COVARIATES, FEATURE_SETS
from tasks import TASKS

sklearn.set_config(transform_output='pandas')

DATA_FOLDER = 'data'

FILES = [
    ('SWESPINE SPINAL STENOSIS ML VS REG.xlsx', 'spinal_stenosis.pkl'),
    ('SWESPINE RHIZOPATHY ML VS REG.xlsx', 'rhizopathy.pkl'),
    ('SWESPINE SEGMENT-RELATED BACK PAIN ML VS REG.xlsx', 'srbp.pkl'),
    ('SWESPINE DISC HERNIATION ML VS REG.xlsx', 'disc_herniation.pkl')
]

for fi, fo in FILES:
    fname = os.path.join(DATA_FOLDER, fo)
    if not os.path.exists(fname):
        print('Converting %s...' % fi)
        D = pd.read_excel(os.path.join(DATA_FOLDER, fi))
        D = D.replace('#NULL!', np.nan)
        D.to_pickle(fname)
        print('Saved to %s' % fname)


def name_combiner(x,y):
    return str(x)+'__'+str(y)


def preprocess(df, covs, nan_category=True, drop_first_binary=True):
    numeric_features = [k for k, v in covs.items() if v['type'] == 'continuous']
    numeric_transformer = Pipeline(
        steps=[("scaler", MinMaxScaler())]
    )

    categorical_features = [k for k, v in covs.items() if v['type'] in ['binary', 'categorical']]
    categorical_transformer = Pipeline(
        steps=[
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False, drop='if_binary',
                                      feature_name_combiner=name_combiner)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ], verbose_feature_names_out=False
    )

    df_pre = preprocessor.fit_transform(df)
    if not nan_category:
        for c in categorical_features:
            if c + '__nan' in df_pre.columns:
                cs = [k for k in df_pre.columns if k.rsplit('__', maxsplit=1)[0] == c and not k.endswith('__nan')]
                nans = df_pre[c + '__nan']
                df_pre.loc[nans == 1, cs] = np.nan
                df_pre = df_pre.drop(columns=[c + '__nan'])

    if drop_first_binary:
        binary_features = [k for k, v in covs.items() if v['type'] in ['binary']]
        for c in binary_features:
            if c + '__0.0' in df_pre.columns:
                df_pre = df_pre.drop(columns=[c + '__0.0'])
            if c + '__0' in df_pre.columns:
                df_pre = df_pre.drop(columns=[c + '__0'])

    cout = df_pre.columns
    cat_map = {}
    for c in cout:
        s = c.rsplit('__', maxsplit=1)[0]
        if s in categorical_features:
            cat_map[s] = cat_map.get(s, []) + [c]

    return df_pre, preprocessor, cat_map


for diagnosis, feature_sets_for_diagnosis in FEATURE_SETS.items():
    df = pd.read_pickle(f'{DATA_FOLDER}/{diagnosis}.pkl')
    print(f'{diagnosis}: {df.shape[0]} rows')
    for task, feature_set in feature_sets_for_diagnosis.items():
        target = TASKS[task]['target']
        columns = feature_set + [target]
        df_complete_case = df[columns].dropna()
        print(f'  {task}: {df_complete_case.shape[0]} complete cases')
        covariates = dict([(k,v) for k,v in COVARIATES.items() if k in columns])
        df_pre, clf_pre, cat_map = preprocess(df_complete_case, covariates, nan_category=False, drop_first_binary=True)

        print('  fitted min-max scalers:')
        fitted_min_max_scaler = clf_pre.named_transformers_['num'].named_steps['scaler']
        print(f'    min:   {fitted_min_max_scaler.min_}')
        print(f'    scale: {fitted_min_max_scaler.scale_}')

        pickle.dump(
            {'preprocessed_data': df_pre, 'preprocessor': clf_pre},
            open(f'{DATA_FOLDER}/{diagnosis}_{task}.pkl', 'wb'))

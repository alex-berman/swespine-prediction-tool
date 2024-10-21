import os
import numpy as np
import pandas as pd

DATA_FOLDER = 'data'

FILES = [
    ('SWESPINE SPINAL STENOSIS ML VS REG.xlsx', 'swespine_spinal_stenosis.pkl'),
    ('SWESPINE RHIZOPATHY ML VS REG.xlsx', 'swespine_rhizopathy.pkl'),
    ('SWESPINE SEGMENT-RELATED BACK PAIN ML VS REG.xlsx', 'swespine_srbp.pkl'),
    ('SWESPINE DISC HERNIATION ML VS REG.xlsx', 'swespine_disc_herniation.pkl')
]

for fi, fo in FILES:
    fname = os.path.join(DATA_FOLDER, fo)
    if not os.path.exists(fname):
        print('Converting %s...' % fi)
        D = pd.read_excel(os.path.join(DATA_FOLDER, fi))
        D = D.replace('#NULL!', np.nan)
        D.to_pickle(fname)
        print('Saved to %s' % fname)

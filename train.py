#!/usr/bin/env python
from keras.models import Sequential
from keras.layers.core import Dense
import os.path
import pandas as pd
import numpy as np

MODEL_FILE = './data/model.json'
WEIGHT_FILE = './data/weight.hdfs'

INPUT_DIM = 53
EPOCH_COUNT = 1000

#
# Preparing data
#
x = []
y = []

for rec in pd.read_csv('./data/csv/0.csv').values:
    x.append(rec)
    y.append(0)

for rec in pd.read_csv('./data/csv/1.csv').values:
    x.append(rec)
    y.append(1)

x = np.array(x, dtype='float')
y = np.array(y, dtype='float')


#
# Model construction
#
model = Sequential([
    Dense(32, input_dim=INPUT_DIM, activation='relu'),
    Dense(16, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(loss='binary_crossentropy',
              optimizer='rmsprop',
              metrics=['accuracy'])

#
# Training
#
if(os.path.exists(WEIGHT_FILE)):
    model.load_weights(WEIGHT_FILE)
model.fit(x, y, nb_epoch=EPOCH_COUNT, verbose=1)

score = model.evaluate(x, y, verbose=1)
print('Test score:', score[0])
print('Test accuracy:', score[1])

#
# Save model and weights
#
with open(MODEL_FILE, mode='w') as f:
    f.write(model.to_json())

model.save_weights(WEIGHT_FILE, overwrite=True)

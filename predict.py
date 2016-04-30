#!/usr/bin/env python
import sys
import numpy as np
from keras.models import model_from_json

MODEL_FILE = './data/model.json'
WEIGHT_FILE = './data/weight.hdfs'

#
# Preparing data
#
x = np.array([sys.argv[1].split(',')], dtype=np.float32)


#
# Load model
#
model = model_from_json(open(MODEL_FILE).read())
model.load_weights(WEIGHT_FILE)
model.compile(loss='binary_crossentropy',
              optimizer='rmsprop',
              metrics=['accuracy'])

#
# Prediction
#
print model.predict_classes(x, batch_size=32, verbose=0)

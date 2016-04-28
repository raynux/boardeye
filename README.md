# BoardEye
line of sight detector using deep learning technology

## Motivation
Just wanted to use Keras and Vision API :)

## What does it does?
- Capture your face by a webcam (tested only on Mac), and classify it by Google Vision API
- Train a neural network based on results from Vision API
- Predict input from a webcam

## Setup
Assuming that you already have NodeJS and Keras working.

```sh
npm install
export GOOGLE_API_KEY=XXXXXX
```

## Generating Training Data
You're gonna need two kinds of pictures - looking at your display or not.

So, to collect **looking**(=1) data, run
```sh
node capture.js -d data/1
```

To collect **not looking**(=0) data, also run
```sh
node capture.js -d data/0
```

Repeat these as much as you can. More data, better always. So, I've done like
```sh
for i in {1..20}; do
  echo progress $i
  say "$i"
  ./capture.js -d data/1
done
```

Then let's convert them to CSV files
```sh
node csvgen.js -d data/1 > data/csv/1.csv
node csvgen.js -d data/0 > data/csv/0.csv
```

## Training
After generating a bunch of data, it's time to train a brain
```sh
python train.py
```

It defaults to 5000 epoch. Generated model and weights are automatically saved. If you need to train more, just run it again.

## Prediction
All set. Let's test it out!
```sh
node capture.js
```

Then copy the output, then
```sh
python predict COPIED_TEXT
```

Now you should see 0 or 1. Did it work? :)

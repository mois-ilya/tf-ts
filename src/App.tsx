import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import Typewriter from 'typewriter-effect';

interface Prediction {
  className: string;
  probability: number;
}

type Predictions = Prediction[];

function App() {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [numberOfPredictions, setNumberOfPredictions] = useState<number>(0); // [1, 2, 3]
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadModel() {
      await tf.setBackend('webgl');
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
      setLoading(false);
    }
    loadModel();
  }, []);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const imgInput = event.target
    if (!imgInput.files || !imgInput.files[0]) {
      return
    }

    const newImage = new Image();
    newImage.src = URL.createObjectURL(imgInput.files[0]);
    newImage.onload = () => onLoadImage(newImage);
  }

  function onLoadImage(newImage: HTMLImageElement) {
    setSelectedImage(newImage);
    setDescription(null);
    setPredictions(null);
    setPrediction(null);
    setNumberOfPredictions(0);

    if (!model) {
      return
    }

    model.classify(newImage).then((_predictions: Predictions) => {
      setPredictions(_predictions);
      setPrediction(_predictions[0]);
      setDescription("");


      // const predictionPromises:Promise<string>[] = _predictions.map((prediction) => {
      //   return axios.post('https://tf-ex.mois.pro/gpt', {
      //     prompt: prediction
      //   })
      //   .then(function (response) {
      //     return response.data;
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });
      // });

      const prediction = _predictions[numberOfPredictions];
      axios.post('https://tf-ex.mois.pro/gpt', {
          prompt: prediction
        })
        .then(function (response) {
          setDescription(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });

      // Promise.all(predictionPromises).then((values) => {
      //   setDescriptions(values);
      //   // setPrediction(_predictions[numberOfPredictions]);
      // }).catch(() => {
      //   const values = ["Test long description for the first prediction", "Test long description for the second prediction", "Test long description for the third prediction"];
      //   setDescriptions(values);
      // })
    });
  };

  return (
    <div className="app">
        <div className="title">
          <h1>TensorFlow.js Image Classifier</h1>
          <input type="file" onChange={handleImageChange} disabled={loading}/>
          {loading && <p>Loading model...</p>}
        </div>
        <div className="image">
          {selectedImage && <img src={selectedImage.src} alt="Selected" />}
        </div>
        <div className="predictions">
          {
            prediction && <div>
              className - {prediction.className} <br/>
              probability - {prediction.probability}
              <br/>
              <br/>
              {description && <Typewriter
                  options={{delay: 20}}
                  onInit={(typewriter) => {
                    typewriter.typeString(description)
                      .callFunction(() => {
                        console.log('String typed out!');
                      })
                      .start();
                  }}
                />
              }
            </div>
          }
        </div>
    </div>
  );
}

export default App;

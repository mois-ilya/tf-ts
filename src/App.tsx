import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

interface Prediction {
  className: string;
  probability: number;
}

type Predictions = Prediction[];

function App() {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [descriptions, setDescriptions] = useState<Array<string> | null>(null);

  useEffect(() => {
    async function loadModel() {
      await tf.setBackend('webgl');
      const loadedModel = await mobilenet.load();
      setModel(loadedModel);
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

    if (!model) {
      return
    }

    model.classify(newImage).then((_predictions: Predictions) => {
      setPredictions(_predictions);

      axios.post('https://tf-ex.mois.pro/gpt', {
        prompt: _predictions
      })
      .then(function (response) {
        setDescriptions(response.data)
      })
      .catch(function (error) {
        console.log(error);
      });
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" onChange={handleImageChange}/>
        {selectedImage && <img src={selectedImage.src} alt="Selected" />}
        {
          predictions && descriptions && predictions.map((object, i) => {
            return <div key={i}>{object.className} {object.probability} {descriptions[i]}</div>;
          })
        }
      </header>
    </div>
  );
}

export default App;

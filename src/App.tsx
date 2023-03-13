import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

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

  };

  return (
    <div className="App">
      <header className="App-header">
        <input type="file" onChange={handleImageChange}/>
        {selectedImage && <img src={selectedImage.src} alt="Selected" />}
      </header>
    </div>
  );
}

export default App;

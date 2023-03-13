import React from 'react';

interface ImageProps {
  src: string;
}

function image(props: ImageProps) {
  return (
    <div className="App">
      <img src={props.src} />
    </div>
  );
}

export default image;

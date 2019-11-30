import React from 'react';
import './App.scss';
import VideoPlayer from './components/VideoPlayer';

const App: React.FC = () => {
  return (
    <div className="App">
      <main>
        <VideoPlayer />
      </main>
    </div>
  );
}

export default App;

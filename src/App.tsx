import React from 'react';
import Hero from './components/Hero';
import Greeting from './components/Greeting';
import Gallery from './components/Gallery';
import Location from './components/Location';
import Money from './components/Money';
import Share from './components/Share';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <Hero />
      <Greeting />
      <Gallery />
      <Location />
      <Money />
      <Share />
    </div>
  );
};

export default App;

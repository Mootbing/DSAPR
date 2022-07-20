import React from 'react';
import { useState } from 'react';
import Home from './pages/Home';
import Results from './pages/Results';

function App() {
  
  const [blasting, setBlasting] = useState(false);

  return (
    <>
      {blasting && <Results blasting={blasting} setBlasting={setBlasting}/>}
      <Home blasting={blasting} setBlasting={setBlasting}/>
    </>
  );
}

export default App;

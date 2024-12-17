import React, { useState } from 'react';
import {FrontendCollector} from 'api-capture';

// Initialize FrontendCollector
const collector = new FrontendCollector({
  collectorURL: 'http://localhost:7071',
  batchSize: 10,
  flushInterval: 10000, // 10 seconds
  debug: true
});

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleButtonClick = () => {
    // Simulate API calls
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched Posts:', data);
        setIsLoaded(true); // Set loaded state to true after fetching posts
      });

    // fetch('https://jsonplaceholder.typicode.com/users', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
    // })
    //   .then((res) => res.json())
    //   .then((data) => console.log('Created User:', data));
  };

  return (
    <div>
      <h1>API Traffic Capture Test</h1>
      <button onClick={handleButtonClick}>Make API Calls</button>
      {isLoaded && <p>API calls have been made. Check console for captured events and responses.</p>}
    </div>
  );
}

export default App;

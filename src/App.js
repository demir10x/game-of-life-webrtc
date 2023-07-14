// import Peer from 'simple-peer';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Record, Live } from './pages';
import { createContext } from 'react';

export const EventsContext = createContext(null);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/game-of-life' element={<Record />} /> */}
        <Route path='/screenshare' element={<Live />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

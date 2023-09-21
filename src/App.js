import { BrowserRouter, Route, Routes } from 'react-router-dom';
import NavBar from './Components/NavBar'; 
import logo from './logo.svg';
import Home from './Pages/Home';
import AnimeBingo from './Pages/AnimeBingo';
import WheelSpin from './Pages/WheelSpin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <div className="App">
      <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/animebingo" element={<AnimeBingo />} />
          <Route path="/wheelspin" element={<WheelSpin />} />
        </Routes>
    </div>
    </BrowserRouter>
  );
}

export default App;

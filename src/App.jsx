import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home/Home';
import SignIn from './pages/SignIn/SignIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

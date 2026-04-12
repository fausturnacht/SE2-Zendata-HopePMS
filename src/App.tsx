import { Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;

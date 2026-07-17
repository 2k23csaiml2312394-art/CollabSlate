import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WhiteboardPage from './pages/WhiteboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WhiteboardPage />} />
        <Route path="/room/:roomId" element={<WhiteboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

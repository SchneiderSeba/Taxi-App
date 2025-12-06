import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider} from './Context/UserContext';
import { TripProvider } from './Context/TripContext';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <UserProvider>
      <TripProvider>
        <App />
      </TripProvider>
    </UserProvider>
  </BrowserRouter>
);

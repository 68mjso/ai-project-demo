import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Layout from './components/Layout';
import Welcome from './components/Welcome';
import Form from './components/Form';
import Chat from './components/Chat';

import { AppContextProvider } from './AppContext';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AppContextProvider>
      <div className="w-screen h-screen p-2">
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Welcome />} />
              <Route path="form" element={<Form />} />
              <Route path="chat" element={<Chat />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </AppContextProvider>
  );
}

export default App;

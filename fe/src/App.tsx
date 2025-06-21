import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./containers/Layout";
import Form from "./containers/Form";
import Chat from "./containers/Chat";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <div className="w-screen h-screen p-2">
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="form" element={<Form />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

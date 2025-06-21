import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ROLE_1 = "user";

type Promt = {
  role: string;
  content: string;
};

const initMessages = (data) => {
  return [
    {
      role: "user",

      content: `I have these information, please let me know what information I should provide to build a complete and detailed professional profile:

    ${JSON.stringify(data, null, 2)}`,
    },
  ];
};

export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
  const [messages, setMessages] = useState<Promt[]>([]);
  const [input, setInput] = useState<string>("");
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    // // Send data to backend API here
    axios
      .post("http://localhost:8000/api", {
        messages: initMessages(data),
      })
      .then((res) => {
        const { data } = res.data;
        setMessages((prev) => [...prev, ...data]);
      });
    toast("Success", {
      position: "bottom-center",
      autoClose: 2000,
      type: "success",
    });
  };
  const submitChat = () => {
    const list = [...messages];
    list.push({
      role: ROLE_1,
      content: input,
    });
    setMessages(list);
    axios
      .post("http://localhost:8000/api", {
        messages: list,
      })
      .then((res) => {
        const { data } = res.data;
        setMessages(data);
      });
    setInput("");
  };
  useEffect(() => {}, []);
  return (
    <AppContext.Provider
      value={{
        input,
        setInput,
        messages,
        setMessages,
        handleSubmit,
        submitChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

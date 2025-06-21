import { useContext } from "react";
import { AppContext } from "../../AppContext";
import ReactMarkdown from "react-markdown";
type Promt = {
  role: string;
  content: string;
};
const ROLE_1 = "user";
// const ROLE_2 = "assistant";

const Chat = () => {
  const { messages, submitChat, input, setInput } = useContext(AppContext);
  return (
    <div className="flex-1 h-full flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-box">
        {messages.map((e: Promt, i: number) => {
          if (e.role === "system" || i === 0) {
            return <></>;
          }
          if (e.role === ROLE_1) {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-xl shadow p-4 max-w-3xl overflow-auto">
                  <ReactMarkdown>{e.content}</ReactMarkdown>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex">
              <div className="bg-white rounded-xl shadow p-4 max-w-3xl text-gray-800 overflow-auto">
                <ReactMarkdown>{e.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            placeholder="Type your message..."
            className=" flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => submitChat()}
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

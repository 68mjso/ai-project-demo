import { useContext } from 'react';
import { AppContext } from '../AppContext';
import ReactMarkdown from 'react-markdown';

type Message = {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
};

const Chat = () => {
  const context = useContext(AppContext);

  if (!context) {
    return <div>Loading...</div>;
  }

  const { messages, submitChat, input, setInput, currentConversationId } = context;

  if (!currentConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-4">No Conversation Selected</h2>
          <p className="text-gray-500">
            Please select a conversation from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b">
        <h1 className="text-xl font-semibold text-gray-800">AI Career Assistant</h1>
        <p className="text-sm text-gray-600">
          Ask questions about your career development and professional growth
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-box">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.946-1.524A11.05 11.05 0 000 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium mb-2">Start Your Conversation</p>
            <p className="text-sm">
              Type a message below to begin your AI-powered career consultation
            </p>
          </div>
        )}

        {messages.map((message: Message, i: number) => {
          if (message.role === 'user') {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-xl shadow p-4 max-w-3xl overflow-auto">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex">
              <div className="bg-white rounded-xl shadow p-4 max-w-3xl text-gray-800 overflow-auto border">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && submitChat()}
            type="text"
            placeholder="Ask about career advice, skill development, job opportunities..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => submitChat()}
            disabled={!input.trim()}
            className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

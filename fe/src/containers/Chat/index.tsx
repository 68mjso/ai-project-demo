const Chat = () => {
  return (
    <div className="flex-1 h-full flex flex-col justify-between">
      <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-box">
        <div className="flex">
          <div className="bg-white rounded-xl shadow p-4 max-w-3xl">
            <p className="text-gray-800">Hello! How can I help you today?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-blue-500 text-white rounded-xl shadow p-4 max-w-3xl">
            <p>I need help with a project.</p>
          </div>
        </div>

        <div className="flex">
          <div className="bg-white rounded-xl shadow p-4 max-w-3xl">
            <p>Sure! Tell me more about the project.</p>
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <form className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="text-white flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

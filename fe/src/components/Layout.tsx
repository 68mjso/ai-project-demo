import { Outlet, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../AppContext";

const Layout = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    return <div>Loading...</div>;
  }

  const {
    conversations,
    currentConversationId,
    createNewConversation,
    selectConversation,
    deleteConversation
  } = context;

  const handleNewConversation = async () => {
    const conversationId = await createNewConversation();
    if (conversationId) {
      navigate("/form");
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    await selectConversation(conversationId);
    navigate("/chat");
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-col w-[300px] border-r px-4 py-4">
        <div className="mb-4">
          <button
            onClick={handleNewConversation}
            className="w-full py-2 px-5 bg-blue-500 text-slate-50 shadow rounded text-center hover:bg-blue-600"
          >
            + New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="font-semibold mb-2">Conversations</h3>
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No conversations yet. Create your first conversation!
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded border cursor-pointer transition-colors ${currentConversationId === conversation.id
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <div className="text-sm font-medium">
                    Conversation
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="text-red-500 hover:text-red-700 text-xs mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Layout;

function Welcome() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Welcome to AI Chat</h2>
        <p className="text-gray-500 mb-6">Create a new conversation to get started</p>
        <div className="text-sm text-gray-400">
          Click "New Conversation" in the sidebar to begin
        </div>
      </div>
    </div>
  )
}

export default Welcome;
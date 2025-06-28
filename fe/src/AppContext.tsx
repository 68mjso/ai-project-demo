import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type Message = {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
};

type Conversation = {
  id: string;
  created_at: string;
};

type AppContextType = {
  input: string;
  setInput: (input: string) => void;
  messages: Message[];
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<string | null>;
  submitChat: () => void;
  createConversation: () => Promise<string | null>;
  selectConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => void;
  deleteConversation: (conversationId: string) => void;
};

const API_BASE_URL = 'http://localhost:3000';

const initMessages = (data) => {
  return `I have these information, please let me know what information I should provide to build a complete and detailed professional profile:

\`\`\`${JSON.stringify(data)}\`\`\``;
};

export const AppContext = createContext<AppContextType | null>(null);

export const AppContextProvider = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [input, setInput] = useState<string>('');

  const createConversation = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`);
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      return newConversation.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create new conversation');
      return null;
    }
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`);
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const selectConversation = async (conversationId: string) => {
    try {
      setCurrentConversationId(conversationId);
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      // Create new conversation if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) return;
      }

      // Send initial message
      const initialMessage = initMessages(data);
      const response = await axios.post(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        {
          message: initialMessage,
        }
      );

      // Add user message and AI response to messages
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: initialMessage },
        {
          role: 'assistant',
          content: response.data,
          created_at: Date.now().toString(),
        },
      ]);

      toast.success('Profile analysis started! Check the Chat tab to see the response.');

      // Return the conversation ID so the form can navigate to chat
      return conversationId;
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
      return null;
    }
  };

  const submitChat = async () => {
    if (!input.trim()) return;

    try {
      // Create new conversation if none exists
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createConversation();
        if (!conversationId) return;
      }

      // Add user message immediately
      const userMessage = { role: 'user', content: input };
      setMessages((prev) => [...prev, userMessage]);

      const response = await axios.post(
        `${API_BASE_URL}/conversations/${conversationId}/messages`,
        { message: input }
      );

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: response.data.role,
          content: response.data.content,
          created_at: response.data.created_at,
        },
      ]);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <AppContext.Provider
      value={{
        input,
        setInput,
        messages,
        setMessages,
        conversations,
        currentConversationId,
        handleSubmit,
        submitChat,
        createConversation,
        selectConversation,
        loadConversations,
        deleteConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

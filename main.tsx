import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  User, 
  LogOut, 
  Send, 
  Bot, 
  Upload,
  Menu,
  X,
  Crown,
  Sparkles,
  Brain,
  Zap,
  Star,
  Copy,
  RefreshCw,
  Trash2
} from 'lucide-react';
  

// Mock Supabase client (in real app, use actual Supabase)
const createClient = (url, key) => ({
  auth: {
    signUp: async (data) => ({ user: { id: '1', email: data.email }, error: null }),
    signIn: async (data) => ({ user: { id: '1', email: data.email }, error: null }),
    signOut: async () => ({ error: null }),
    getUser: async () => ({ data: { user: { id: '1', email: 'user@example.com' } }, error: null }),
    onAuthStateChange: (callback) => {
      callback('SIGNED_IN', { id: '1', email: 'user@example.com' });
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table) => ({
    select: () => ({
      eq: () => ({
        order: () => ({ data: [], error: null })
      })
    }),
    insert: (data) => ({ data: [{ id: Date.now(), ...data }], error: null }),
    update: (data) => ({
      eq: () => ({ data: [data], error: null })
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null })
    })
  })
});

const supabase = createClient(
  'your supabase',
  'your supabase key'
);

const AI_MODELS = {
  'chatgpt': { name: 'ChatGPT', icon: '🤖', color: 'bg-green-500', enabled: false },
  'claude': { name: 'Claude', icon: '🧠', color: 'bg-orange-500', enabled: false },
  'gemini': { name: 'Gemini', icon: '💎', color: 'bg-blue-500', enabled: false },
  'deepseek': { name: 'DeepSeek', icon: '🔍', color: 'bg-purple-500', enabled: false },
  'grok': { name: 'Grok', icon: '⚡', color: 'bg-red-500', enabled: false }
};

const MultiAIChatPlatform = () => {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({});
  const [enabledModels, setEnabledModels] = useState({});
  const [chatMode, setChatMode] = useState('multi'); // 'multi' or 'single'
  const [selectedModel, setSelectedModel] = useState('chatgpt');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      loadChats();
      loadSettings();
    }
  };

  const loadChats = async () => {
    // Mock chat data
    setChats([
      {
        id: '1',
        title: 'New Chat',
        created_at: new Date().toISOString(),
        messages: []
      }
    ]);
  };

  const loadSettings = () => {
    const savedKeys = localStorage.getItem('apiKeys');
    const savedModels = localStorage.getItem('enabledModels');
    
    if (savedKeys) setApiKeys(JSON.parse(savedKeys));
    if (savedModels) setEnabledModels(JSON.parse(savedModels));
  };

  const saveSettings = () => {
    localStorage.setItem('apiKeys', JSON.stringify(apiKeys));
    localStorage.setItem('enabledModels', JSON.stringify(enabledModels));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAuth = async (email, password) => {
    const authMethod = isLogin ? supabase.auth.signIn : supabase.auth.signUp;
    const { user, error } = await authMethod({ email, password });
    
    if (!error) {
      setUser(user);
      setShowAuth(false);
      loadChats();
      loadSettings();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setChats([]);
    setCurrentChat(null);
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      created_at: new Date().toISOString(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId) => {
    const updatedChats = chats.filter(chat => chat.id !== chatId);
    setChats(updatedChats);
    if (currentChat?.id === chatId) {
      setCurrentChat(updatedChats[0] || null);
    }
  };

  const mockAIResponse = async (model, userMessage) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      chatgpt: `ChatGPT: I understand you said "${userMessage}". This is a simulated response from ChatGPT model. In a real implementation, this would connect to OpenAI's API.`,
      claude: `Claude: Thank you for your message "${userMessage}". This is a mock response from Claude. The actual implementation would use Anthropic's API.`,
      gemini: `Gemini: I received "${userMessage}". This is a simulated Gemini response. Real integration would use Google's Gemini API.`,
      deepseek: `DeepSeek: Processing "${userMessage}". This is a mock DeepSeek response. Actual implementation would connect to DeepSeek's API.`,
      grok: `Grok: Got it! "${userMessage}" - This is a simulated Grok response. Real version would use X.AI's Grok API.`
    };
    
    return responses[model] || `${model}: Mock response for "${userMessage}"`;
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);

    let chat = currentChat;
    if (!chat) {
      chat = {
        id: Date.now().toString(),
        title: userMessage.slice(0, 30) + '...',
        created_at: new Date().toISOString(),
        messages: []
      };
      setChats([chat, ...chats]);
      setCurrentChat(chat);
    }

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      content: userMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    chat.messages = [...chat.messages, newUserMessage];
    setCurrentChat({ ...chat });

    try {
      if (chatMode === 'multi') {
        // Get responses from all enabled models
        const enabledModelKeys = Object.keys(enabledModels).filter(key => enabledModels[key] && apiKeys[key]);
        
        if (enabledModelKeys.length === 0) {
          // If no models enabled, show all with mock responses
          const allModels = Object.keys(AI_MODELS);
          const responses = await Promise.allSettled(
            allModels.map(model => mockAIResponse(model, userMessage))
          );
          
          responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const aiMessage = {
                id: Date.now() + index + 1,
                content: result.value,
                role: 'assistant',
                model: allModels[index],
                timestamp: new Date().toISOString()
              };
              chat.messages = [...chat.messages, aiMessage];
            }
          });
        } else {
          const responses = await Promise.allSettled(
            enabledModelKeys.map(model => mockAIResponse(model, userMessage))
          );
          
          responses.forEach((result, index) => {
            if (result.status === 'fulfilled') {
              const aiMessage = {
                id: Date.now() + index + 1,
                content: result.value,
                role: 'assistant',
                model: enabledModelKeys[index],
                timestamp: new Date().toISOString()
              };
              chat.messages = [...chat.messages, aiMessage];
            }
          });
        }
      } else {
        // Single model response
        const response = await mockAIResponse(selectedModel, userMessage);
        const aiMessage = {
          id: Date.now() + 1,
          content: response,
          role: 'assistant',
          model: selectedModel,
          timestamp: new Date().toISOString()
        };
        chat.messages = [...chat.messages, aiMessage];
      }
      
      setCurrentChat({ ...chat });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const startSeparateChat = (model) => {
    const newChat = {
      id: Date.now().toString(),
      title: `${AI_MODELS[model].name} Chat`,
      created_at: new Date().toISOString(),
      messages: []
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
    setChatMode('single');
    setSelectedModel(model);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Multi-AI Platform</h1>
              <p className="text-gray-400">Chat with multiple AI models simultaneously</p>
            </div>
            
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAuth('demo@example.com', 'password')}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-lg font-bold">Multi-AI Platform</h1>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={createNewChat}
              className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chat Mode Toggle */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Chat Mode</span>
            </div>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setChatMode('multi')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  chatMode === 'multi' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Multi-AI
              </button>
              <button
                onClick={() => setChatMode('single')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  chatMode === 'single' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Single AI
              </button>
            </div>
            
            {chatMode === 'single' && (
              <div className="mt-3">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(AI_MODELS).map(([key, model]) => (
                    <option key={key} value={key}>{model.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentChat?.id === chat.id 
                      ? 'bg-gray-700' 
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm truncate">{chat.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-700 space-y-2">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {currentChat ? currentChat.title : 'Select a chat'}
            </h2>
          </div>
          
          {chatMode === 'multi' && (
            <div className="flex items-center space-x-2">
              {Object.entries(AI_MODELS).map(([key, model]) => (
                <div
                  key={key}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    enabledModels[key] && apiKeys[key]
                      ? `${model.color} text-white`
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {model.icon} {model.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentChat?.messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.role === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-3xl bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-tr-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    AI_MODELS[msg.model]?.color || 'bg-gray-600'
                  }`}>
                    {AI_MODELS[msg.model]?.icon || '🤖'}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-300">
                        {AI_MODELS[msg.model]?.name || msg.model}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <p className="text-gray-100">{msg.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {chatMode === 'multi' && (
                          <button
                            onClick={() => startSeparateChat(msg.model)}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                          >
                            Chat Separately
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-600 rounded">
                <Upload className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">API Settings</h2>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    saveSettings();
                  }}
                  className="p-2 hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 mt-2">Configure your AI model API keys</p>
            </div>
            
            <div className="p-6 space-y-6">
              {Object.entries(AI_MODELS).map(([key, model]) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${model.color}`}>
                        {model.icon}
                      </div>
                      <span className="font-medium">{model.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {enabledModels[key] ? 'Enabled' : 'Disabled'}
                      </span>
                      <div
                        className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                          enabledModels[key] ? 'bg-blue-600' : 'bg-gray-600'
                        }`}
                        onClick={() => setEnabledModels({...enabledModels, [key]: !enabledModels[key]})}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          enabledModels[key] ? 'translate-x-6' : 'translate-x-0.5'
                        } mt-0.5`} />
                      </div>
                    </div>
                  </div>
                  <input
                    type="password"
                    placeholder={`Enter ${model.name} API Key`}
                    value={apiKeys[key] || ''}
                    onChange={(e) => setApiKeys({...apiKeys, [key]: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MultiAIChatPlatform;

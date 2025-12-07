'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [instructions, setInstructions] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to extract response content if message contains JSON with response field
  const getDisplayContent = (content: string) => {
    try {
      // Check if content looks like JSON
      if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && 'response' in parsed) {
          return parsed.response;
        }
      }
      // If content contains "response": try to extract it
      const responseMatch = content.match(/"response"\s*:\s*"([^"]*)"/);
      if (responseMatch) {
        return responseMatch[1];
      }
    } catch (error) {
      // If parsing fails, return original content
    }
    return content;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from model');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'No response received',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendInstructions = async () => {
    if (!instructions.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch('/api/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructions: instructions.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send instructions');
      }

      const data = await response.json();

      const successMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || 'Instructions updated successfully',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, successMessage]);
      setInstructions('');
      setShowInstructions(false);
    } catch (error) {
      console.error('Instructions error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to update instructions. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[70vw] h-[90vh] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex-shrink-0">
          <h1 className="text-xl font-semibold">Scenariusz jutra</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-2">👋 Welcome to the AI Chatbot!</p>
              <p>Start a conversation by typing a message below.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="text-base prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-strong:text-inherit prose-code:text-inherit prose-pre:bg-gray-100 prose-pre:border prose-pre:border-gray-200 prose-ul:text-inherit prose-ol:text-inherit prose-li:text-inherit">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {getDisplayContent(message.content)}
                    </ReactMarkdown>
                  </div>
                  <p className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 flex-shrink-0">
          {showInstructions && (
            <div className="mb-4">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter instructions for the agent..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                rows={4}
                disabled={loading}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={sendInstructions}
                  disabled={loading || !instructions.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Instructions'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="px-4 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              disabled={loading}
            >
              Instructions
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

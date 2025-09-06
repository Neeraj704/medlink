import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import axios from 'axios'; // Import axios directly, not the custom api instance

const DoctorChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // FIXED: Using the direct URL to the Python ML service
            const response = await axios.post('https://20.244.28.96/doctor_chat', {
                query: input,
            });

            const aiMessage = { sender: 'ai', text: response.data.answer };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (err) {
            console.error("Chatbot API Error:", err);
            const errorMessage = { sender: 'ai', text: 'Error: Could not get a response from the AI assistant.' };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Assistant</h1>
            <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">

                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500">
                            Ask a question about medical terminologies to get started.
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                            )}
                            <div className={`px-4 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                             <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                                 <div className="flex items-center justify-center gap-1">
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about NAMASTE or ICD-11 codes..."
                            className="w-full bg-gray-100 rounded-lg px-4 py-2 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorChat;
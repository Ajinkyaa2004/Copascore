'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, Sparkles, TrendingUp, Users, Target, Zap, MessageSquare } from 'lucide-react';

interface AIAnalystProps {
    homeTeam: string;
    awayTeam: string;
    prediction: any;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function AIAnalyst({ homeTeam, awayTeam, prediction }: AIAnalystProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickPrompts = [
        { icon: TrendingUp, text: "What's the key factor?", prompt: `What's the key factor that could influence the outcome of ${homeTeam} vs ${awayTeam}?` },
        { icon: Users, text: "Player matchups", prompt: `Analyze the key player matchups in ${homeTeam} vs ${awayTeam}` },
        { icon: Target, text: "Best bet", prompt: `What's the best betting strategy for ${homeTeam} vs ${awayTeam}?` },
        { icon: Zap, text: "Tactical analysis", prompt: `Provide a tactical analysis of ${homeTeam} vs ${awayTeam}` }
    ];

    const generateInitialAnalysis = async () => {
        setAnalyzing(true);
        try {
            const prompt = `Analyze the match between ${homeTeam} and ${awayTeam}. 
      Prediction probabilities: Home Win ${(prediction.probabilities.H * 100).toFixed(1)}%, Draw ${(prediction.probabilities.D * 100).toFixed(1)}%, Away Win ${(prediction.probabilities.A * 100).toFixed(1)}%.
      Provide a comprehensive tactical analysis covering:
      1. Key factors influencing the match
      2. Expected tactical approach from both teams
      3. Key player matchups to watch
      4. Betting insights and recommendations`;

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, { message: prompt });
            setMessages([{ role: 'ai', content: res.data.response, timestamp: new Date() }]);
        } catch (err) {
            console.error(err);
            setMessages([{
                role: 'ai',
                content: "⚠️ I'm having trouble connecting to the analysis engine. The backend may be offline. Please ensure the FastAPI server is running on port 8000.",
                timestamp: new Date()
            }]);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSendMessage = async (messageText?: string) => {
        const textToSend = messageText || input;
        if (!textToSend.trim()) return;

        const userMessage: Message = {
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setInput('');
        setMessages(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, { message: textToSend });
            setMessages(prev => [...prev, {
                role: 'ai',
                content: res.data.response,
                timestamp: new Date()
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "❌ Connection error. Please check if the backend server is running and try again.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (prompt: string) => {
        handleSendMessage(prompt);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage();
    };

    return (
        <div className="mt-8 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-3xl border border-zinc-800/50 shadow-2xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="relative p-6 border-b border-zinc-800/50 bg-gradient-to-r from-red-600/10 via-white/5 to-red-600/10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center text-white shadow-lg shadow-red-500/25 animate-pulse">
                                <Bot size={28} strokeWidth={2.5} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900 animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-white flex items-center gap-2">
                                AI Match Analyst
                                <Sparkles size={18} className="text-yellow-400" />
                            </h3>
                            <p className="text-sm text-zinc-400 font-medium">Advanced tactical analysis & insights</p>
                        </div>
                    </div>

                    {messages.length === 0 && (
                        <button
                            onClick={generateInitialAnalysis}
                            disabled={analyzing}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold hover:from-red-500 hover:to-white hover:text-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            <Sparkles size={18} className={analyzing ? "animate-spin" : "group-hover:animate-pulse"} />
                            {analyzing ? 'Analyzing...' : 'Generate Analysis'}
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="h-[500px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-8">
                            <div className="relative mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/20 to-white/10 flex items-center justify-center">
                                    <MessageSquare size={40} className="text-red-400" />
                                </div>
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-white blur-xl opacity-20 animate-pulse"></div>
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">Ready to analyze this match!</h4>
                            <p className="text-zinc-400 max-w-md mb-6">
                                I can provide tactical insights, player matchups analysis, betting strategies, and much more based on advanced prediction data.
                            </p>

                            {/* Quick Prompts */}
                            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickPrompt(prompt.prompt)}
                                        className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-800/60 hover:border-red-500/50 transition-all group text-left"
                                    >
                                        <prompt.icon size={20} className="text-red-400 group-hover:text-red-300 transition-colors" />
                                        <span className="text-sm text-zinc-300 group-hover:text-white font-medium transition-colors">{prompt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
                                >
                                    <div
                                        className={`max-w-[85%] ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-red-600 to-red-700 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-red-600/25'
                                            : 'bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 text-zinc-100 rounded-2xl rounded-tl-sm shadow-lg'
                                            } p-5`}
                                    >
                                        {msg.role === 'ai' && (
                                            <div className="flex items-center gap-2 mb-2 text-red-400 text-xs font-semibold">
                                                <Bot size={14} />
                                                AI Analyst
                                            </div>
                                        )}
                                        <div
                                            className="text-sm leading-relaxed whitespace-pre-wrap"
                                            dangerouslySetInnerHTML={{
                                                __html: msg.content
                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                                                    .replace(/\n/g, '<br/>')
                                            }}
                                        />
                                        <div className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-red-200' : 'text-zinc-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/50 p-5 rounded-2xl rounded-tl-sm flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs text-zinc-400 font-medium">Analyzing...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Ask about tactics, players, betting strategy..."
                            className="flex-1 px-5 py-3.5 rounded-xl border border-zinc-700/50 bg-zinc-800/40 backdrop-blur-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-white hover:text-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transform hover:scale-105 active:scale-95"
                        >
                            <Send size={18} />
                            Send
                        </button>
                    </form>

                    {/* Quick Actions */}
                    {messages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {quickPrompts.slice(0, 2).map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPrompt(prompt.prompt)}
                                    disabled={loading}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800/40 border border-zinc-700/50 hover:bg-zinc-700/40 hover:border-red-500/50 transition-all text-xs text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <prompt.icon size={12} />
                                    {prompt.text}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

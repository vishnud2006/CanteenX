import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Zap,
  ShoppingBag,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PRESET_AI_PROMPTS } from '../../services/aiRecommender';
import { playClickSound } from '../../utils/sound';

export const AIChatScreen: React.FC = () => {
  const {
    aiMessages,
    isAITyping,
    sendAIMessage,
    clearAIChat,
    currentCollege,
    addComboToCart,
    addToCart,
    breakMinutesLeft,
    queueMetrics
  } = useApp();

  const [inputQuery, setInputQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isAITyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAITyping) return;
    sendAIMessage(inputQuery);
    setInputQuery('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-3xl mx-auto px-4 sm:px-6 pt-2 pb-24">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white">AI Queue Assistant</h1>
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                {currentCollege.shortName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Aware of {breakMinutesLeft}m break • Canteen queue delay: +{queueMetrics.queueDelayMinutes}m
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClickSound();
            clearAIChat();
          }}
          className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
        {aiMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-xs sm:text-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm'
                }`}
              >
                {/* Message text */}
                <div className="whitespace-pre-line leading-relaxed">
                  {msg.text}
                </div>

                {/* Rush Warning Banner if any */}
                {msg.rushWarning && (
                  <div className="mt-3 p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-2 text-xs text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-rose-200">High Rush Warning</p>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{msg.rushWarning}</p>
                    </div>
                  </div>
                )}

                {/* Fast Alternatives CTA */}
                {msg.fastAlternatives && msg.fastAlternatives.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      ⚡ Faster Recommended Options:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {msg.fastAlternatives.map(alt => (
                        <div
                          key={alt.id}
                          className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2"
                        >
                          <div>
                            <p className="text-xs font-bold text-white truncate">{alt.name}</p>
                            <p className="text-[11px] font-mono text-orange-400 font-extrabold">₹{alt.price} • ~{alt.preparationTime + queueMetrics.queueDelayMinutes}m</p>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(alt, 1);
                            }}
                            className="w-full py-1.5 bg-slate-800 hover:bg-orange-500 hover:text-white text-xs font-bold text-slate-200 rounded-xl transition-all"
                          >
                            Order {alt.name.split(' ')[0]}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Generated Recommendation Combos */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-orange-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>BEST MATCH FOR YOUR BREAK:</span>
                    </div>

                    <div className="space-y-3">
                      {msg.recommendations.map(combo => (
                        <div
                          key={combo.id}
                          className="bg-slate-950 border border-orange-500/30 rounded-2xl p-4 space-y-2.5 shadow-md"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                                  {combo.title}
                                </h4>
                                {combo.badge && (
                                  <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                    {combo.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                {combo.reason}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-sm sm:text-base font-black text-orange-400 font-mono">
                                ₹{combo.totalPrice}
                              </span>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                ~{combo.estimatedReadyTime} min ready
                              </p>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              addComboToCart(combo.items);
                            }}
                            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Order This Recommendation (₹{combo.totalPrice})</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 px-3 py-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isAITyping && (
          <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-2xl w-24">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce delay-200" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestion Chips */}
      <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
        {PRESET_AI_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              playClickSound();
              sendAIMessage(prompt);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Query Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 flex-shrink-0 pt-1">
        <input
          type="text"
          placeholder="e.g. 'I have ₹60 and 10 minutes' or 'What is ready fast?'"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isAITyping}
          className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 disabled:opacity-40 text-white rounded-2xl font-extrabold text-xs shadow-lg transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MessageSquare, Send, BrainCircuit, Loader2 } from 'lucide-react';
import { geminiService, CoachMessage } from '../services/geminiService';

interface AiCoachProps {
  tasks: any[];
  activeTask?: string;
  timerMode: string;
}

export default function AiCoach({ tasks, activeTask, timerMode }: AiCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quickTip, setQuickTip] = useState<string>('');

  // Charger un conseil rapide au montage ou changement de mode
  useEffect(() => {
    const fetchTip = async () => {
      const tip = await geminiService.getQuickFocusTip(
        tasks.map(t => t.text),
        timerMode
      );
      setQuickTip(tip);
    };

    fetchTip();
    // Refresh tip every 10 minutes or on mode change
    const interval = setInterval(fetchTip, 600000);
    return () => clearInterval(interval);
  }, [timerMode, tasks.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: CoachMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const fullHistory = [...messages, userMsg];
    const response = await geminiService.chatWithCoach(fullHistory, tasks);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      {/* Fenêtre de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[350px] max-h-[500px] bg-notion-sidebar/80 backdrop-blur-2xl rounded-3xl border border-notion-border shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-notion-border flex items-center justify-between bg-notion-sidebar/40">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-icon-bg rounded-lg">
                  <Sparkles size={16} className="text-icon-text" />
                </div>
                <span className="font-semibold text-sm">ZenCoach IA</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-notion-border rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px] scrollbar-hide">
              {messages.length === 0 && (
                <div className="text-center py-6 opacity-60">
                  <BrainCircuit size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs px-6">
                    Posez-moi une question sur vos tâches ou demandez un conseil pour rester concentré.
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-icon-bg text-icon-text rounded-tr-none' 
                      : 'bg-white/40 dark:bg-black/20 border border-notion-border rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/40 dark:bg-black/20 border border-notion-border p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-notion-border bg-notion-sidebar/20">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="w-full bg-white/50 dark:bg-black/30 border border-notion-border rounded-2xl py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-notion-border transition-all"
                />
                <button 
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-nav-text hover:text-nav-active disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button / Bubble */}
      <div className="flex items-center space-x-3">
        {/* Quick Tip Popover */}
        {!isOpen && quickTip && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 bg-white/60 dark:bg-black/40 backdrop-blur-md border border-notion-border py-2 px-4 rounded-full shadow-lg max-w-[200px]"
          >
            <Sparkles size={12} className="text-orange-400 shrink-0" />
            <p className="text-[10px] font-medium leading-tight line-clamp-2 italic">
              {quickTip}
            </p>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`p-4 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-white dark:bg-neutral-800 text-notion-text' 
              : 'bg-icon-bg text-icon-text'
          }`}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Language, AssistantMessage } from '../types';
import { t } from '../translations';
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Zap,
  Flame,
  Coffee,
  Footprints,
  SkipForward,
} from 'lucide-react';

interface TripAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AssistantMessage[];
  onCommand: (commandKeyOrPrompt: string) => void;
  lang: Language;
}

export const TripAssistantDrawer: React.FC<TripAssistantDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onCommand,
  lang,
}) => {
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const quickCommands = [
    { key: 'cmd_tired', icon: Zap, label: t(lang, 'cmd_tired') },
    { key: 'cmd_heat', icon: Flame, label: t(lang, 'cmd_heat') },
    { key: 'cmd_coffee', icon: Coffee, label: t(lang, 'cmd_coffee') },
    { key: 'cmd_reduce_walk', icon: Footprints, label: t(lang, 'cmd_reduce_walk') },
    { key: 'cmd_skip', icon: SkipForward, label: t(lang, 'cmd_skip') },
  ];

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onCommand(customText.trim());
    setCustomText('');
  };

  return (
    <div className="fixed inset-y-0 end-0 z-50 w-full max-w-md bg-slate-900 border-s border-slate-800 shadow-2xl flex flex-col text-slate-100">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{t(lang, 'assistantTitle')}</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                {lang === 'ar' ? 'مساعد ميداني' : 'Live Field Agent'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">{t(lang, 'assistantSubtitle')}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action Chips Bar */}
      <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 block px-1">
          {t(lang, 'quickCommandsTitle')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickCommands.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => onCommand(key)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-amber-400 group-hover:text-slate-950" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                msg.sender === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-te-none shadow-md'
                  : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-ts-none'
              }`}
            >
              <p>{lang === 'ar' ? msg.textAr : msg.textEn}</p>

              {/* Action Taken Badge if present */}
              {msg.actionTakenAr && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{lang === 'ar' ? msg.actionTakenAr : msg.actionTakenEn}</span>
                </div>
              )}

              <span className="block text-[10px] text-slate-400 text-end pt-0.5 opacity-70">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSendCustom} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative flex items-center">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t(lang, 'customPromptPlaceholder')}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl ps-3.5 pe-11 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="absolute end-1.5 p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
};

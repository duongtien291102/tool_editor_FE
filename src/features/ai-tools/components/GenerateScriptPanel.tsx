import React from 'react';
import {
  Sparkles,
  WandSparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Video,
  Globe,
  Clock,
  MessageSquareText,
  Radio,
  XCircle,
  Clapperboard,
  Film,
  Music2,
  Layers3,
} from 'lucide-react';
import type { ScriptLanguage, ScriptPlatform, ScriptTone } from '@/lib/ai/types';
import type { StylePreset } from '@/lib/ai/director';
import { useGenerateScript } from '../hooks/useGenerateScript';

export const GenerateScriptPanel: React.FC = () => {
  const {
    prompt,
    setPrompt,
    language,
    setLanguage,
    tone,
    setTone,
    duration,
    setDuration,
    platform,
    setPlatform,
    stylePreset,
    setStylePreset,
    loading,
    error,
    result,
    generateScript,
    cancelGeneration,
  } = useGenerateScript();

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const tones: { label: string; value: ScriptTone }[] = [
    { label: 'Educational (Giáo dục)', value: 'Educational' },
    { label: 'Professional (Chuyên nghiệp)', value: 'Professional' },
    { label: 'Storytelling (Kể chuyện)', value: 'Storytelling' },
    { label: 'Marketing (Bán hàng)', value: 'Marketing' },
    { label: 'Funny (Hài hước)', value: 'Funny' },
    { label: 'Emotional (Cảm xúc)', value: 'Emotional' },
    { label: 'Documentary (Tài liệu)', value: 'Documentary' },
  ];

  const durations = [
    { label: '15 giây', value: 15 },
    { label: '30 giây', value: 30 },
    { label: '60 giây', value: 60 },
    { label: '3 phút', value: 180 },
    { label: '5 phút', value: 300 },
    { label: '10 phút', value: 600 },
  ];

  const platforms: { label: string; value: ScriptPlatform }[] = [
    { label: 'YouTube', value: 'youtube' },
    { label: 'TikTok', value: 'tiktok' },
    { label: 'YouTube Shorts', value: 'shorts' },
    { label: 'Instagram Reels', value: 'instagram' },
    { label: 'Facebook', value: 'facebook' },
  ];

  const stylePresets: { label: string; value: StylePreset; icon: string }[] = [
    { label: 'YouTube', value: 'YouTube', icon: '🎬' },
    { label: 'TikTok', value: 'TikTok', icon: '📱' },
    { label: 'Documentary', value: 'Documentary', icon: '🎥' },
    { label: 'News', value: 'News', icon: '📰' },
    { label: 'Podcast', value: 'Podcast', icon: '🎙️' },
    { label: 'Commercial', value: 'Commercial', icon: '💼' },
    { label: 'Travel', value: 'Travel', icon: '✈️' },
    { label: 'Education', value: 'Education', icon: '📚' },
    { label: 'Luxury', value: 'Luxury', icon: '💎' },
    { label: 'Gaming', value: 'Gaming', icon: '🎮' },
  ];

  return (
    <div className="h-full w-full bg-background flex flex-col overflow-y-auto p-4 border-r border-border text-foreground">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <WandSparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-wide">AI Director Studio</h2>
          <p className="text-xs text-muted-foreground">Gemini AI · Storyboard · 6-Layer Timeline</p>
        </div>
      </div>

      {/* Form Controls */}
      <div className="space-y-4 flex-1">
        {/* Prompt Input */}
        <div>
          <label
            htmlFor="ai-prompt-input"
            className="block text-xs font-medium mb-1.5 flex items-center justify-between"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquareText className="w-3.5 h-3.5 text-primary" />
              Prompt / Ý tưởng video <span className="text-destructive">*</span>
            </span>
            <span className="text-[10px] text-muted-foreground">{prompt.length} kí tự</span>
          </label>
          <textarea
            id="ai-prompt-input"
            value={prompt}
            onChange={handlePromptChange}
            placeholder="Ví dụ: Làm video về 10 địa điểm du lịch đẹp nhất Đà Lạt kèm lời dẫn hấp dẫn..."
            rows={4}
            disabled={loading}
            className="w-full text-xs p-3 rounded-lg bg-card border border-input focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Style Preset */}
        <div>
          <label className="block text-xs font-medium mb-2 flex items-center gap-1.5">
            <Clapperboard className="w-3.5 h-3.5 text-violet-500" /> AI Director Style
          </label>
          <div className="grid grid-cols-5 gap-1">
            {stylePresets.map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={loading}
                onClick={() => setStylePreset(s.value)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-md border text-[10px] font-medium gap-0.5 transition-all ${
                  stylePreset === s.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
                }`}
              >
                <span className="text-base leading-none">{s.icon}</span>
                <span className="leading-tight text-center">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform & Language */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ai-platform-select"
              className="block text-xs font-medium mb-1.5 flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-blue-500" /> Nền tảng
            </label>
            <select
              id="ai-platform-select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value as ScriptPlatform)}
              disabled={loading}
              className="w-full text-xs p-2 rounded-md bg-card border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {platforms.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-language-select"
              className="block text-xs font-medium mb-1.5 flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" /> Ngôn ngữ
            </label>
            <select
              id="ai-language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as ScriptLanguage)}
              disabled={loading}
              className="w-full text-xs p-2 rounded-md bg-card border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Tone & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="ai-tone-select"
              className="block text-xs font-medium mb-1.5 flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-purple-500" /> Phong cách
            </label>
            <select
              id="ai-tone-select"
              value={tone}
              onChange={(e) => setTone(e.target.value as ScriptTone)}
              disabled={loading}
              className="w-full text-xs p-2 rounded-md bg-card border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-duration-select"
              className="block text-xs font-medium mb-1.5 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Thời lượng
            </label>
            <select
              id="ai-duration-select"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={loading}
              className="w-full text-xs p-2 rounded-md bg-card border border-input focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {durations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6 Layer Timeline Badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground border border-border/50 rounded-md px-2.5 py-1.5 bg-card">
          <Layers3 className="w-3 h-3 text-primary shrink-0" />
          <span>
            AI Director sẽ tự động tạo{' '}
            <span className="font-semibold text-foreground">6 lớp Timeline</span>: Video · Narration
            · Subtitle · Music · SFX · Transitions
          </span>
        </div>

        {/* Generate / Cancel Button */}
        <div className="pt-1 flex gap-2">
          {!loading ? (
            <button
              type="button"
              onClick={() => {
                void generateScript();
              }}
              disabled={!prompt.trim()}
              className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Tạo Kịch Bản + Director Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={cancelGeneration}
              className="flex-1 py-2.5 px-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 font-medium text-xs flex items-center justify-center gap-2 transition-all"
            >
              <XCircle className="w-4 h-4" />
              Hủy Quá Trình AI
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-primary">Gemini AI đang biên kịch...</div>
              <div className="text-[11px] text-muted-foreground">
                Đang tạo Storyboard, Shot List, Media Strategy và 6 lớp Timeline.
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Lỗi tạo kịch bản</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Generated Result Summary Card */}
        {result && !loading && (
          <div className="mt-2 p-3 rounded-lg bg-card border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 font-medium border-b border-border/60 pb-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Director Plan synced · {result.scenes.length} phân cảnh · 6 Timeline Layers
              </span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Tiêu đề: </span>
              <span className="text-muted-foreground">{result.title}</span>
            </div>
            <div className="text-muted-foreground line-clamp-2">{result.description}</div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Film className="w-3 h-3" /> {result.scenes.length} Scenes
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {result.duration}s
              </span>
              <span className="flex items-center gap-1">
                <Clapperboard className="w-3 h-3" /> {stylePreset}
              </span>
              <span className="flex items-center gap-1">
                <Music2 className="w-3 h-3" /> BGM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

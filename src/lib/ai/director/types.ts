/**
 * AI Director Agent Type Definitions (Phase 2)
 * Strict TypeScript models for Storyboarding, Shot List, Media Strategy,
 * Multi-layer Timeline Planning, Presets, and AI Scoring.
 */

export type StylePreset =
  | 'TikTok'
  | 'YouTube'
  | 'Documentary'
  | 'News'
  | 'Podcast'
  | 'Commercial'
  | 'Travel'
  | 'Education'
  | 'Luxury'
  | 'Gaming';

export type CameraShot =
  'Close-up' | 'Medium' | 'Wide' | 'Drone' | 'Macro' | 'Extreme Close-up' | 'Over-the-shoulder';

export type CameraMovement =
  'Pan Right' | 'Tilt Up' | 'Zoom In' | 'Dolly Track' | 'Static' | 'Orbit' | 'Handheld';

export type LightingStyle =
  | 'Cinematic Golden Hour'
  | 'Soft Studio'
  | 'Dramatic Contrast'
  | 'Neon Cyberpunk'
  | 'Natural Daylight';

export type CompositionRule = 'Rule of Thirds' | 'Center Frame' | 'Symmetrical' | 'Leading Lines';

export type SceneEmotion = 'Excited' | 'Awe' | 'Calm' | 'Mysterious' | 'Urgent' | 'Inspiring';

export type ShotType =
  'Opening Shot' | 'B-roll' | 'Close-up' | 'Wide' | 'Drone' | 'Macro' | 'Reaction' | 'Cutaway';

export type TransitionType = 'fade' | 'slide' | 'zoom' | 'blur' | 'whip' | 'cut' | 'dipToBlack';

export type MediaType = 'pexels' | 'image_generation' | 'user_media';

export type SFXType =
  'whoosh' | 'click' | 'wind' | 'rain' | 'crowd' | 'birds' | 'typing' | 'impact';

export interface Storyboard {
  cameraShot: CameraShot;
  cameraMovement: CameraMovement;
  lighting: LightingStyle;
  composition: CompositionRule;
  emotion: SceneEmotion;
  zoom: string;
  motion: string;
  background: string;
  foreground: string;
}

export interface ShotItem {
  type: ShotType;
  description: string;
}

export interface MediaStrategy {
  type: MediaType;
  reason: string;
  pexelsSearchQuery: string;
  imagePrompt: string;
}

export interface TransitionPlan {
  type: TransitionType;
  durationSeconds: number;
}

export interface SFXCue {
  type: SFXType;
  timestampSeconds: number;
  volume: number;
}

export interface DirectorAIScores {
  visualScore: number;
  emotionScore: number;
  engagementScore: number;
  confidence: number;
}

export interface DirectorScenePlan {
  sceneId: number;
  title: string;
  start: number;
  duration: number;
  storyboard: Storyboard;
  shotList: ShotItem[];
  mediaStrategy: MediaStrategy;
  transition: TransitionPlan;
  sfx: SFXCue[];
  scores: DirectorAIScores;
}

export interface VoiceRecommendation {
  language: string;
  gender: 'male' | 'female' | 'neutral';
  speed: number;
  pitch: number;
  emotion: string;
}

export interface MusicRecommendation {
  mood: string;
  genre: string;
  energy: 'low' | 'medium' | 'high';
  tempo: number;
  volume: number;
  fadeInSeconds: number;
  fadeOutSeconds: number;
}

export interface SubtitleStyleRecommendation {
  fontFamily: string;
  fontWeight: string;
  position: 'bottom' | 'center' | 'top';
  animation: 'popIn' | 'fadeIn' | 'karaoke' | 'none';
  highlightStyle: string;
}

/**
 * Complete Serializable AI Director Production Plan (Phase 2)
 */
export interface DirectorPlan {
  version: number;
  createdAt: number;
  stylePreset: StylePreset;
  videoStyle: string;
  aspectRatio: '16:9' | '9:16' | '1:1';
  recommendedVoice: VoiceRecommendation;
  recommendedMusic: MusicRecommendation;
  subtitleStyle: SubtitleStyleRecommendation;
  scenes: DirectorScenePlan[];
}

// Public API for @/features/editor — explicit named exports (no barrel `export *`)
export { PreviewCanvas } from './components/PreviewCanvas';
export { TimelineShell } from './components/TimelineShell';
export { EditorAssets } from './components/EditorAssets';
export { EditorJobs } from './components/EditorJobs';
export { Inspector } from './components/Inspector';
export { queueProjectVideoExport } from './services/videoExportService';
export {
  addMediaAssetToProjectTimeline,
  buildTimelineFromScenes,
  formatTime,
  findTargetSceneIndex,
  isImageUrl,
  relativeTime,
  EMPTY_PRODUCTION_SCENES,
  DEFAULT_SCENE_DURATION_SECONDS,
  getMinimumSceneDuration,
  getSceneDuration,
  roundSceneDuration,
} from './utils/editorUtils';
export type { ProjectTimelineClip } from './utils/editorUtils';
export { prepareProjectVoicePlayback } from './services/voicePlaybackService';
export type {
  VoicePreparationProgress,
  VoicePreparationResult,
} from './services/voicePlaybackService';

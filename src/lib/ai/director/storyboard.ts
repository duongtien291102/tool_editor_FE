import type { AIScriptScene } from '../types';
import type {
  CameraMovement,
  CameraShot,
  CompositionRule,
  LightingStyle,
  MediaStrategy,
  SceneEmotion,
  ShotItem,
  Storyboard,
  StylePreset,
} from './types';

/**
 * Resolves storyboard parameters from StylePreset and scene index.
 */
function resolvePresetParams(
  preset: StylePreset,
  isOpening: boolean,
): {
  cameraShot: CameraShot;
  cameraMovement: CameraMovement;
  lighting: LightingStyle;
  composition: CompositionRule;
  emotion: SceneEmotion;
  zoom: string;
  motion: string;
} {
  switch (preset) {
    case 'TikTok':
    case 'Gaming':
      return {
        cameraShot: isOpening ? 'Close-up' : 'Medium',
        cameraMovement: isOpening ? 'Zoom In' : 'Handheld',
        lighting: 'Neon Cyberpunk',
        composition: 'Center Frame',
        emotion: 'Excited',
        zoom: 'Fast Zoom In 1.3x',
        motion: 'Normal',
      };

    case 'Documentary':
    case 'Travel':
      return {
        cameraShot: isOpening ? 'Drone' : 'Wide',
        cameraMovement: 'Pan Right',
        lighting: 'Cinematic Golden Hour',
        composition: 'Leading Lines',
        emotion: 'Awe',
        zoom: 'Smooth In 1.05x',
        motion: 'Slow Motion 60fps',
      };

    case 'Commercial':
    case 'Luxury':
      return {
        cameraShot: isOpening ? 'Macro' : 'Close-up',
        cameraMovement: 'Dolly Track',
        lighting: 'Soft Studio',
        composition: 'Symmetrical',
        emotion: 'Awe',
        zoom: 'Smooth In 1.15x',
        motion: 'Slow Motion 120fps',
      };

    default:
      return {
        cameraShot: isOpening ? 'Wide' : 'Medium',
        cameraMovement: 'Static',
        lighting: 'Natural Daylight',
        composition: 'Rule of Thirds',
        emotion: 'Calm',
        zoom: 'None',
        motion: 'Normal',
      };
  }
}

/**
 * Storyboard Engine: Computes camera, lighting, composition, emotion, and motion for a scene.
 */
export function generateSceneStoryboard(scene: AIScriptScene, preset: StylePreset): Storyboard {
  const isOpening = scene.id === 1;
  const base = resolvePresetParams(preset, isOpening);

  const promptLower = (scene.visualPrompt || '').toLowerCase();

  const lighting: LightingStyle =
    promptLower.includes('dramatic') || promptLower.includes('dark')
      ? 'Dramatic Contrast'
      : base.lighting;

  const emotion: SceneEmotion =
    promptLower.includes('dramatic') || promptLower.includes('dark')
      ? 'Mysterious'
      : promptLower.includes('fast') || promptLower.includes('urgent')
        ? 'Urgent'
        : base.emotion;

  return {
    cameraShot: base.cameraShot,
    cameraMovement: base.cameraMovement,
    lighting,
    composition: base.composition,
    emotion,
    zoom: base.zoom,
    motion: base.motion,
    background: `${lighting} background with ${base.composition.toLowerCase()} balance`,
    foreground: `${base.cameraShot} framing focusing on ${scene.title}`,
  };
}

/**
 * Shot List Engine: Generates detailed shot breakdown per scene.
 */
export function generateShotList(scene: AIScriptScene, preset: StylePreset): ShotItem[] {
  const storyboard = generateSceneStoryboard(scene, preset);
  const title = scene.title || `Phân cảnh ${scene.id}`;

  return [
    {
      type: scene.id === 1 ? 'Opening Shot' : 'Cutaway',
      description: `${storyboard.cameraShot} - ${storyboard.cameraMovement}: ${title}`,
    },
    {
      type: 'B-roll',
      description: `B-roll bối cảnh: ${scene.visualPrompt}`,
    },
    {
      type: 'Close-up',
      description: `Cận cảnh cảm xúc (${storyboard.emotion}): ${scene.subtitle.slice(0, 30)}...`,
    },
  ];
}

/**
 * Media Strategy Engine: Intelligently decides between Pexels stock vs AI Image Generation.
 * If scene calls for abstract, fantasy, 3D render, or highly specific concept -> AI Image Gen.
 * Otherwise -> Pexels Stock Media.
 */
export function evaluateMediaStrategy(scene: AIScriptScene): MediaStrategy {
  const visualText = (scene.visualPrompt || '').toLowerCase();
  const titleText = (scene.title || '').toLowerCase();
  const combined = `${visualText} ${titleText}`;

  // Fantasy, sci-fi, abstract, 3D render, digital illustration triggers AI Image Generation
  const aiGenTriggers = [
    'abstract',
    'surreal',
    'fantasy',
    'sci-fi',
    'futuristic',
    '3d render',
    'cyberpunk',
    'hologram',
    'vector art',
    'digital painting',
    'mythical',
  ];

  const requiresImageGen = aiGenTriggers.some((trigger) => combined.includes(trigger));

  if (requiresImageGen) {
    return {
      type: 'image_generation',
      reason: 'Cảnh chứa yếu tố tưởng tượng/3D/Digital Art độc đáo không có sẵn trên Pexels stock.',
      pexelsSearchQuery: scene.pexelsQuery || 'abstract digital background',
      imagePrompt: `Masterpiece, cinematic ultra-detailed 8k render of ${scene.visualPrompt}, ${scene.title}, volumetric lighting, photorealistic.`,
    };
  }

  return {
    type: 'pexels',
    reason: 'Cảnh thực tế phù hợp với thư viện Pexels HD Stock Photos & Videos.',
    pexelsSearchQuery: scene.pexelsQuery || scene.visualPrompt.split(' ').slice(0, 4).join(' '),
    imagePrompt: `Cinematic photo of ${scene.visualPrompt}`,
  };
}

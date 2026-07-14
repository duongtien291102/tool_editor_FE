import { type Script, ElementType } from '../types';

export const mockScript: Script = {
  id: 'script_1',
  projectId: 'proj_1',
  title: 'AI Gen Video Promo Script',
  updatedAt: Date.now(),
  scenes: [
    {
      id: 'scene_1',
      title: 'Opening - Catchy Hook',
      notes: 'Make it dynamic and fast-paced.',
      elements: [
        { id: 'el_1', type: ElementType.Prompt, content: 'A futuristic glowing AI core, cyberpunk style.' },
        { id: 'el_2', type: ElementType.Voice, content: 'Welcome to the future of video creation.' }
      ]
    },
    {
      id: 'scene_2',
      title: 'Product Demo',
      notes: 'Show UI briefly.',
      elements: [
        { id: 'el_3', type: ElementType.Prompt, content: 'A person typing on a glowing keyboard, holographic screens.' }
      ]
    }
  ]
};

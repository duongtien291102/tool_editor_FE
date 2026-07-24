import { GenerationSession, GenerationStepArtifact } from '../types';

class GenerationService {
  private sessionsMock: GenerationSession[] = [
    {
      id: 'gen-sess-demo-completed',
      projectId: 'proj-demo-1',
      userId: 'usr-saas-demo',
      prompt: 'Create a high-energy cinematic commercial for AI Studio SaaS platform.',
      workflowType: 'Commercial Promo',
      state: 'Completed',
      totalCreditsConsumed: 45,
      totalDurationMs: 6000,
      renderJobId: 'job-render-demo-101',
      finalVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      steps: [
        {
          stepName: 'AI Concept Analysis',
          inputPayload: 'User Prompt',
          outputPayload: 'Concept brief generated',
          status: 'Completed',
          durationMs: 450,
          creditsConsumed: 2,
          providerId: 'openai',
          modelId: 'gpt-4o',
          timestamp: new Date(Date.now() - 600000).toISOString()
        },
        {
          stepName: 'Storyboard Generation',
          inputPayload: 'Idea.md',
          outputPayload: '3 scenes storyboard generated',
          status: 'Completed',
          durationMs: 850,
          creditsConsumed: 5,
          providerId: 'openai',
          modelId: 'gpt-4o',
          timestamp: new Date(Date.now() - 540000).toISOString()
        },
        {
          stepName: 'Prompt Pack Generation',
          inputPayload: 'Storyboard.json',
          outputPayload: 'Prompt pack assembled',
          status: 'Completed',
          durationMs: 900,
          creditsConsumed: 5,
          providerId: 'openai',
          modelId: 'gpt-4o',
          timestamp: new Date(Date.now() - 480000).toISOString()
        },
        {
          stepName: 'Timeline Draft Assembly',
          inputPayload: 'PromptPack.json',
          outputPayload: 'Main timeline draft assembled',
          status: 'Completed',
          durationMs: 600,
          creditsConsumed: 3,
          providerId: 'mock',
          modelId: 'timeline-engine',
          timestamp: new Date(Date.now() - 420000).toISOString()
        },
        {
          stepName: 'Video Rendering Execution',
          inputPayload: 'Timeline.json',
          outputPayload: 'Video render finished',
          status: 'Completed',
          durationMs: 3200,
          creditsConsumed: 30,
          providerId: 'openai',
          modelId: 'dall-e-3',
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ],
      artifacts: [
        {
          id: 'art-demo-1',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'AI Concept Analysis',
          fileName: 'Idea.md',
          contentType: 'text/markdown',
          fileSizeBytes: 520,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/Idea.md',
          rawContent: '# Production Brief\n**Prompt:** Create a high-energy cinematic commercial for AI Studio SaaS platform.\n**Creative Direction:** Dynamic 4k camera movements, modern electronic soundtrack.',
          createdAt: new Date(Date.now() - 600000).toISOString()
        },
        {
          id: 'art-demo-2',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Storyboard Generation',
          fileName: 'Storyboard.json',
          contentType: 'application/json',
          fileSizeBytes: 1200,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/Storyboard.json',
          rawContent: JSON.stringify({
            title: 'AI Studio Promo Storyboard',
            scenes: [
              { scene: 1, angle: 'Wide Shot', duration: '4s', prompt: 'Sunrise over futuristic tech hub' },
              { scene: 2, angle: 'Close Up', duration: '5s', prompt: 'Creator editing video on holographic UI' },
              { scene: 3, angle: 'Pan', duration: '3s', prompt: 'AI Studio logo animation' }
            ]
          }, null, 2),
          createdAt: new Date(Date.now() - 540000).toISOString()
        },
        {
          id: 'art-demo-3',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Prompt Pack Generation',
          fileName: 'PromptPack.json',
          contentType: 'application/json',
          fileSizeBytes: 850,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/PromptPack.json',
          rawContent: JSON.stringify({
            systemPrompt: '8k photorealistic cinematic render, octane render style',
            scenePrompts: [
              'Futuristic tech city skyline at sunrise',
              'Female creator editing timeline on transparent glass display',
              'AI Studio glowing blue logo intro'
            ]
          }, null, 2),
          createdAt: new Date(Date.now() - 480000).toISOString()
        },
        {
          id: 'art-demo-4',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Timeline Draft',
          fileName: 'Timeline.json',
          contentType: 'application/json',
          fileSizeBytes: 940,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/Timeline.json',
          rawContent: JSON.stringify({
            tracks: [
              { track: 'V1', clips: 3 },
              { track: 'A1', clips: 1 }
            ]
          }, null, 2),
          createdAt: new Date(Date.now() - 420000).toISOString()
        },
        {
          id: 'art-demo-5',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Render Final Output',
          fileName: 'FinalVideo.mp4',
          contentType: 'video/mp4',
          fileSizeBytes: 18450000,
          contentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          rawContent: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          createdAt: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'art-demo-6',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Subtitle Export',
          fileName: 'Subtitle.srt',
          contentType: 'text/plain',
          fileSizeBytes: 1250,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/Subtitle.srt',
          rawContent: "1\n00:00:00,000 --> 00:00:04,000\nWelcome to AI Studio.\n\n2\n00:00:04,000 --> 00:00:09,000\nCreate amazing video content instantly.",
          createdAt: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'art-demo-7',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Thumbnail Generation',
          fileName: 'Thumbnail.png',
          contentType: 'image/png',
          fileSizeBytes: 450000,
          contentUrl: 'https://picsum.photos/1280/720',
          rawContent: 'https://picsum.photos/1280/720',
          createdAt: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'art-demo-8',
          sessionId: 'gen-sess-demo-completed',
          stepName: 'Project Export Bundle',
          fileName: 'ProjectZip.zip',
          contentType: 'application/zip',
          fileSizeBytes: 19500000,
          contentUrl: 'https://ai-studio.local/artifacts/gen-sess-demo-completed/ProjectZip.zip',
          rawContent: 'ZIP Archive',
          createdAt: new Date(Date.now() - 300000).toISOString()
        }
      ]
    }
  ];

  async createSession(prompt: string, workflowType = 'Commercial Promo', projectId = 'proj-default'): Promise<GenerationSession> {
    const newSession: GenerationSession = {
      id: `gen-sess-${Math.random().toString(36).substring(2, 9)}`,
      projectId,
      userId: 'usr-saas-demo',
      prompt,
      workflowType,
      state: 'Draft',
      steps: [],
      artifacts: [],
      totalCreditsConsumed: 0,
      totalDurationMs: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.sessionsMock.unshift(newSession);
    return { ...newSession };
  }

  async getSession(id: string): Promise<GenerationSession | null> {
    const session = this.sessionsMock.find(s => s.id === id);
    return session ? { ...session } : null;
  }

  async listSessions(): Promise<GenerationSession[]> {
    return [...this.sessionsMock];
  }

  async startGeneration(id: string, onProgress?: (session: GenerationSession) => void): Promise<GenerationSession> {
    const sessionIndex = this.sessionsMock.findIndex(s => s.id === id);
    if (sessionIndex === -1) throw new Error('Session not found');

    const session = this.sessionsMock[sessionIndex];

    // Simulate Step 1
    session.state = 'Analyzing';
    onProgress?.({ ...session });
    await new Promise(r => setTimeout(r, 400));

    const ideaContent = `# Production Brief\n**Prompt:** ${session.prompt}\n**Workflow:** ${session.workflowType}\n**Creative Angle:** Cinematic promo video featuring dynamic lighting, high-contrast grading, and upbeat acoustic score.\n`;
    session.artifacts.push({
      id: `art-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: session.id,
      stepName: 'AI Concept Analysis',
      fileName: 'Idea.md',
      contentType: 'text/markdown',
      fileSizeBytes: ideaContent.Length || 400,
      contentUrl: `https://ai-studio.local/artifacts/${session.id}/Idea.md`,
      rawContent: ideaContent,
      createdAt: new Date().toISOString()
    });
    session.steps.push({
      stepName: 'AI Concept Analysis',
      inputPayload: session.prompt,
      outputPayload: ideaContent,
      status: 'Completed',
      durationMs: 450,
      creditsConsumed: 2,
      providerId: 'openai',
      modelId: 'gpt-4o',
      timestamp: new Date().toISOString()
    });
    session.totalCreditsConsumed += 2;
    session.totalDurationMs += 450;

    // Simulate Step 2
    session.state = 'StoryboardGenerated';
    onProgress?.({ ...session });
    await new Promise(r => setTimeout(r, 400));

    const sbJson = JSON.stringify({
      title: 'Generated Storyboard',
      prompt: session.prompt,
      shots: [
        { shot: 1, angle: 'Wide Shot', desc: 'Futuristic skyline sunrise' },
        { shot: 2, angle: 'Close Up', desc: 'Creator tweaking settings' },
        { shot: 3, angle: 'Pan', desc: 'Final render output' }
      ]
    }, null, 2);

    session.artifacts.push({
      id: `art-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: session.id,
      stepName: 'Storyboard Generation',
      fileName: 'Storyboard.json',
      contentType: 'application/json',
      fileSizeBytes: sbJson.length,
      contentUrl: `https://ai-studio.local/artifacts/${session.id}/Storyboard.json`,
      rawContent: sbJson,
      createdAt: new Date().toISOString()
    });
    session.steps.push({
      stepName: 'Storyboard Generation',
      inputPayload: 'Idea.md',
      outputPayload: sbJson,
      status: 'Completed',
      durationMs: 850,
      creditsConsumed: 5,
      providerId: 'openai',
      modelId: 'gpt-4o',
      timestamp: new Date().toISOString()
    });
    session.totalCreditsConsumed += 5;
    session.totalDurationMs += 850;

    // Simulate Step 3
    session.state = 'PromptPackGenerated';
    onProgress?.({ ...session });
    await new Promise(r => setTimeout(r, 400));

    const ppJson = JSON.stringify({
      prompts: [
        'A dramatic golden hour sunrise illuminating high-rise glass skyscrapers, ultra HD 8k',
        'Macro extreme close-up of sleek metallic product surface with soft ambient reflections'
      ]
    }, null, 2);

    session.artifacts.push({
      id: `art-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: session.id,
      stepName: 'Prompt Pack Generation',
      fileName: 'PromptPack.json',
      contentType: 'application/json',
      fileSizeBytes: ppJson.length,
      contentUrl: `https://ai-studio.local/artifacts/${session.id}/PromptPack.json`,
      rawContent: ppJson,
      createdAt: new Date().toISOString()
    });
    session.steps.push({
      stepName: 'Prompt Pack Generation',
      inputPayload: 'Storyboard.json',
      outputPayload: ppJson,
      status: 'Completed',
      durationMs: 900,
      creditsConsumed: 5,
      providerId: 'openai',
      modelId: 'gpt-4o',
      timestamp: new Date().toISOString()
    });
    session.totalCreditsConsumed += 5;
    session.totalDurationMs += 900;

    // Simulate Step 4
    session.state = 'TimelineDrafted';
    onProgress?.({ ...session });
    await new Promise(r => setTimeout(r, 400));

    const tlJson = JSON.stringify({ tracks: [{ id: 'V1', clips: 3 }, { id: 'A1', clips: 1 }] }, null, 2);
    session.artifacts.push({
      id: `art-${Math.random().toString(36).substring(2, 9)}`,
      sessionId: session.id,
      stepName: 'Timeline Draft',
      fileName: 'Timeline.json',
      contentType: 'application/json',
      fileSizeBytes: tlJson.length,
      contentUrl: `https://ai-studio.local/artifacts/${session.id}/Timeline.json`,
      rawContent: tlJson,
      createdAt: new Date().toISOString()
    });
    session.steps.push({
      stepName: 'Timeline Draft Assembly',
      inputPayload: 'PromptPack.json',
      outputPayload: tlJson,
      status: 'Completed',
      durationMs: 600,
      creditsConsumed: 3,
      providerId: 'mock',
      modelId: 'timeline-engine',
      timestamp: new Date().toISOString()
    });
    session.totalCreditsConsumed += 3;
    session.totalDurationMs += 600;

    // Simulate Step 5 Render
    session.state = 'Rendering';
    onProgress?.({ ...session });
    await new Promise(r => setTimeout(r, 600));

    const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    session.renderJobId = `job-render-${Math.random().toString(36).substring(2, 9)}`;
    session.finalVideoUrl = videoUrl;

    session.artifacts.push(
      { id: `art-v-${session.id}`, sessionId: session.id, stepName: 'Render Final Output', fileName: 'FinalVideo.mp4', contentType: 'video/mp4', fileSizeBytes: 18450000, contentUrl: videoUrl, rawContent: videoUrl, createdAt: new Date().toISOString() },
      { id: `art-s-${session.id}`, sessionId: session.id, stepName: 'Subtitle Export', fileName: 'Subtitle.srt', contentType: 'text/plain', fileSizeBytes: 1250, contentUrl: `https://ai-studio.local/artifacts/${session.id}/Subtitle.srt`, rawContent: "1\n00:00:00,000 --> 00:00:04,000\nWelcome to AI Studio.", createdAt: new Date().toISOString() },
      { id: `art-t-${session.id}`, sessionId: session.id, stepName: 'Thumbnail Generation', fileName: 'Thumbnail.png', contentType: 'image/png', fileSizeBytes: 450000, contentUrl: 'https://picsum.photos/1280/720', rawContent: 'https://picsum.photos/1280/720', createdAt: new Date().toISOString() },
      { id: `art-z-${session.id}`, sessionId: session.id, stepName: 'Project Export Bundle', fileName: 'ProjectZip.zip', contentType: 'application/zip', fileSizeBytes: 19500000, contentUrl: `https://ai-studio.local/artifacts/${session.id}/ProjectZip.zip`, rawContent: 'ZIP Archive', createdAt: new Date().toISOString() }
    );

    session.steps.push({
      stepName: 'Video Rendering Execution',
      inputPayload: 'Timeline.json',
      outputPayload: JSON.stringify({ RenderJobId: session.renderJobId, Status: 'Completed', VideoUrl: videoUrl }),
      status: 'Completed',
      durationMs: 3200,
      creditsConsumed: 30,
      providerId: 'openai',
      modelId: 'dall-e-3',
      timestamp: new Date().toISOString()
    });

    session.totalCreditsConsumed += 30;
    session.totalDurationMs += 3200;
    session.state = 'Completed';
    session.updatedAt = new Date().toISOString();

    onProgress?.({ ...session });
    return { ...session };
  }

  async mockDownloadArtifact(artifact: GenerationStepArtifact): Promise<void> {
    const blob = new Blob([artifact.rawContent], { type: artifact.contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = artifact.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const generationService = new GenerationService();

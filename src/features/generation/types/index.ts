export type GenerationSessionState =
  | 'Draft'
  | 'Analyzing'
  | 'StoryboardGenerated'
  | 'SceneListGenerated'
  | 'PromptPackGenerated'
  | 'TimelineDrafted'
  | 'Rendering'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export interface GenerationStepArtifact {
  id: string;
  sessionId: string;
  stepName: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  contentUrl: string;
  rawContent: string;
  createdAt: string;
}

export interface GenerationStepResult {
  stepName: string;
  inputPayload: string;
  outputPayload: string;
  status: string;
  durationMs: number;
  creditsConsumed: number;
  providerId: string;
  modelId: string;
  timestamp: string;
}

export interface GenerationSession {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  workflowType: string;
  state: GenerationSessionState;
  steps: GenerationStepResult[];
  artifacts: GenerationStepArtifact[];
  totalCreditsConsumed: number;
  totalDurationMs: number;
  renderJobId?: string;
  finalVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

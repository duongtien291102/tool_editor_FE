export type WorkflowStatus = 'pending' | 'current' | 'completed' | 'blocked';

export interface WorkflowStateSnapshot {
  id: string;
  name: string;
  status: WorkflowStatus;
  data: Readonly<Record<string, string>>;
}

export interface WorkflowContext {
  artifacts: ReadonlyMap<string, unknown>;
}

export interface WorkflowValidation {
  valid: boolean;
  errors: readonly string[];
}

export class WorkflowTopology {
  readonly stateIds: readonly string[];
  private readonly nextById: ReadonlyMap<string, string>;
  private readonly previousById: ReadonlyMap<string, string>;

  constructor(stateIds: readonly string[]) {
    this.stateIds = [...stateIds];
    this.nextById = new Map(
      stateIds.slice(0, -1).map((stateId, index) => [stateId, stateIds[index + 1]]),
    );
    this.previousById = new Map(
      stateIds.slice(1).map((stateId, index) => [stateId, stateIds[index]]),
    );
  }

  next(stateId: string): string | undefined {
    return this.nextById.get(stateId);
  }

  previous(stateId: string): string | undefined {
    return this.previousById.get(stateId);
  }
}

export abstract class WorkflowState {
  readonly id: string;
  readonly name: string;
  status: WorkflowStatus;
  data: Readonly<Record<string, string>>;

  protected constructor(
    id: string,
    name: string,
    status: WorkflowStatus = 'pending',
    data: Readonly<Record<string, string>> = {},
  ) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.data = data;
  }

  abstract validate(context: WorkflowContext): WorkflowValidation;

  next(topology: WorkflowTopology): string | undefined {
    return topology.next(this.id);
  }

  previous(topology: WorkflowTopology): string | undefined {
    return topology.previous(this.id);
  }

  serialize(): WorkflowStateSnapshot {
    return { id: this.id, name: this.name, status: this.status, data: this.data };
  }

  deserialize(snapshot: WorkflowStateSnapshot): WorkflowState {
    if (snapshot.id !== this.id) {
      throw new Error(`Cannot deserialize ${snapshot.id} into ${this.id}.`);
    }
    return this.rehydrate(snapshot.status, snapshot.data);
  }

  withStatus(status: WorkflowStatus): WorkflowState {
    return this.rehydrate(status, this.data);
  }

  withData(data: Readonly<Record<string, string>>): WorkflowState {
    return this.rehydrate(this.status, data);
  }

  protected abstract rehydrate(
    status: WorkflowStatus,
    data: Readonly<Record<string, string>>,
  ): WorkflowState;
}

export class ArtifactWorkflowState extends WorkflowState {
  readonly requiredArtifactId: string;

  constructor(
    id: string,
    name: string,
    requiredArtifactId = id,
    status: WorkflowStatus = 'pending',
    data: Readonly<Record<string, string>> = {},
  ) {
    super(id, name, status, data);
    this.requiredArtifactId = requiredArtifactId;
  }

  validate(context: WorkflowContext): WorkflowValidation {
    return context.artifacts.has(this.requiredArtifactId)
      ? { valid: true, errors: [] }
      : { valid: false, errors: [`${this.name} data is required.`] };
  }

  protected rehydrate(
    status: WorkflowStatus,
    data: Readonly<Record<string, string>>,
  ): WorkflowState {
    return new ArtifactWorkflowState(
      this.id,
      this.name,
      this.requiredArtifactId,
      status,
      data,
    );
  }
}

export interface WorkflowTransformResult {
  outputId: string;
  output: unknown;
  stateData: Readonly<Record<string, string>>;
}

export interface WorkflowTransform {
  inputStateId: string;
  transform(context: WorkflowContext): WorkflowTransformResult;
}

export class ProductWorkflow {
  readonly artifacts = new Map<string, unknown>();
  private readonly statesById: Map<string, WorkflowState>;
  currentStateId: string;

  constructor(states: readonly WorkflowState[], currentStateId: string) {
    this.statesById = new Map(states.map((state) => [state.id, state]));
    this.currentStateId = currentStateId;
  }

  get states(): readonly WorkflowState[] {
    return [...this.statesById.values()];
  }

  get currentState(): WorkflowState {
    const state = this.statesById.get(this.currentStateId);
    if (!state) throw new Error(`State ${this.currentStateId} is not registered.`);
    return state;
  }

  getState(stateId: string): WorkflowState {
    const state = this.statesById.get(stateId);
    if (!state) throw new Error(`State ${stateId} is not registered.`);
    return state;
  }

  replaceState(state: WorkflowState): void {
    this.statesById.set(state.id, state);
  }
}

export class ProductWorkflowEngine {
  private readonly topology: WorkflowTopology;
  private readonly transforms: ReadonlyMap<string, WorkflowTransform>;
  readonly workflow: ProductWorkflow;

  constructor(
    workflow: ProductWorkflow,
    topology: WorkflowTopology,
    transforms: readonly WorkflowTransform[],
  ) {
    this.workflow = workflow;
    this.topology = topology;
    this.transforms = new Map(
      transforms.map((transform) => [transform.inputStateId, transform]),
    );
  }

  next(): WorkflowState {
    const current = this.workflow.currentState;
    const context = { artifacts: this.workflow.artifacts };
    const validation = current.validate(context);
    if (!validation.valid) throw new Error(validation.errors.join(' '));

    const nextStateId = current.next(this.topology);
    this.workflow.replaceState(current.withStatus('completed'));
    if (!nextStateId) return this.workflow.getState(current.id);

    const transform = this.transforms.get(current.id);
    if (!transform) throw new Error(`No transform registered for ${current.id}.`);
    const result = transform.transform(context);
    this.workflow.artifacts.set(result.outputId, result.output);
    const nextState = this.workflow
      .getState(nextStateId)
      .withData(result.stateData)
      .withStatus('current');
    this.workflow.replaceState(nextState);
    this.workflow.currentStateId = nextStateId;
    return nextState;
  }

  previous(): WorkflowState {
    const current = this.workflow.currentState;
    const previousStateId = current.previous(this.topology);
    if (!previousStateId) return current;

    this.workflow.replaceState(current.withStatus('pending'));
    const previousState = this.workflow
      .getState(previousStateId)
      .withStatus('current');
    this.workflow.replaceState(previousState);
    this.workflow.currentStateId = previousStateId;
    return previousState;
  }

  select(stateId: string): WorkflowState {
    return this.workflow.getState(stateId);
  }
}

export const defaultWorkflowStateIds = [
  'idea',
  'storyboard',
  'scene',
  'prompt-pack',
  'timeline-draft',
  'ready-for-render',
] as const;

export function createMockWorkflowEngine(projectName: string): ProductWorkflowEngine {
  const topology = new WorkflowTopology(defaultWorkflowStateIds);
  const states = [
    new ArtifactWorkflowState('idea', 'Idea', 'idea', 'current', {
      title: projectName,
      summary: 'A concise visual story built from a single creative direction.',
      audience: 'Design-conscious product customers',
    }),
    new ArtifactWorkflowState('storyboard', 'Storyboard'),
    new ArtifactWorkflowState('scene', 'Scene'),
    new ArtifactWorkflowState('prompt-pack', 'Prompt Pack'),
    new ArtifactWorkflowState('timeline-draft', 'Timeline Draft'),
    new ArtifactWorkflowState(
      'ready-for-render',
      'Ready For Render',
      'timeline-draft',
    ),
  ];
  const workflow = new ProductWorkflow(states, 'idea');
  workflow.artifacts.set('idea', {
    title: projectName,
    audience: 'Design-conscious product customers',
  });

  const transforms: WorkflowTransform[] = [
    {
      inputStateId: 'idea',
      transform: () => ({
        outputId: 'storyboard',
        output: { scenes: 4, duration: 24 },
        stateData: { structure: 'Opening · Detail · Motion · End frame', scenes: '4', duration: '24s' },
      }),
    },
    {
      inputStateId: 'storyboard',
      transform: () => ({
        outputId: 'scene',
        output: ['Scene 01', 'Scene 02', 'Scene 03', 'Scene 04'],
        stateData: { count: '4 scenes', ordering: 'Locked', duration: '24s' },
      }),
    },
    {
      inputStateId: 'scene',
      transform: () => ({
        outputId: 'prompt-pack',
        output: { version: 1, prompts: 4 },
        stateData: { name: 'Default Prompt Pack', version: 'v1', prompts: '4' },
      }),
    },
    {
      inputStateId: 'prompt-pack',
      transform: () => ({
        outputId: 'timeline-draft',
        output: { tracks: 4, clips: 7, duration: 24 },
        stateData: { tracks: '4', clips: '7', duration: '24s' },
      }),
    },
    {
      inputStateId: 'timeline-draft',
      transform: () => ({
        outputId: 'ready-for-render',
        output: { ready: true },
        stateData: { status: 'Ready', checks: '3/3', renderStarted: 'No' },
      }),
    },
  ];
  const engine = new ProductWorkflowEngine(workflow, topology, transforms);
  for (let index = 0; index < defaultWorkflowStateIds.length - 1; index += 1) {
    engine.next();
  }
  return engine;
}

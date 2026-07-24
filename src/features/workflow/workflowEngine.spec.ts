import { describe, expect, it } from 'vitest';
import {
  ArtifactWorkflowState,
  WorkflowTopology,
  createMockWorkflowEngine,
  defaultWorkflowStateIds,
} from './workflowEngine';

describe('ProductWorkflowEngine', () => {
  it('creates every mock output before reaching render readiness', () => {
    const engine = createMockWorkflowEngine('Motion Study');

    expect(engine.workflow.currentStateId).toBe('ready-for-render');
    expect([...engine.workflow.artifacts.keys()]).toEqual(defaultWorkflowStateIds);
    expect(engine.workflow.states.slice(0, -1).every((state) => state.status === 'completed')).toBe(true);
    expect(engine.workflow.currentState.status).toBe('current');
  });

  it('serializes and deserializes a state contract', () => {
    const state = new ArtifactWorkflowState(
      'quality-review',
      'Quality Review',
      'timeline-draft',
      'current',
      { score: '92' },
    );

    const restored = state.deserialize(state.serialize());

    expect(restored.serialize()).toEqual(state.serialize());
  });

  it('adds a future state through topology without changing existing states', () => {
    const topology = new WorkflowTopology([
      'timeline-draft',
      'quality-review',
      'ready-for-render',
    ]);
    const timeline = new ArtifactWorkflowState('timeline-draft', 'Timeline Draft');
    const review = new ArtifactWorkflowState('quality-review', 'Quality Review');

    expect(timeline.next(topology)).toBe('quality-review');
    expect(review.previous(topology)).toBe('timeline-draft');
    expect(review.next(topology)).toBe('ready-for-render');
  });
});

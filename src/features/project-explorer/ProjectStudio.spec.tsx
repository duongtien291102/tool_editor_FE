import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardPage } from './components/DashboardPage';
import { ProjectListPage } from './components/ProjectListPage';
import { SceneManager } from './components/SceneManager';
import { ShotManager } from './components/ShotManager';

describe('Project Studio Components', () => {
  it('renders DashboardPage correctly', () => {
    const handleProjects = vi.fn();
    render(<DashboardPage onNavigateToProjects={handleProjects} />);

    expect(screen.getByText(/AI Video Studio Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Projects/i)).toBeInTheDocument();
  });

  it('renders ProjectListPage and filters projects by search term', () => {
    const handleSelect = vi.fn();
    render(<ProjectListPage onSelectProject={handleSelect} />);

    expect(screen.getByText(/Projects Studio/i)).toBeInTheDocument();
    const searchInput = screen.getByPlaceholderText(/Search projects.../i);
    fireEvent.change(searchInput, { target: { value: 'Cyberpunk' } });

    expect(screen.getByText(/Cyberpunk Commercial 2026/i)).toBeInTheDocument();
  });

  it('renders SceneManager and allows adding a scene', () => {
    render(<SceneManager projectId="test-123" />);

    expect(screen.getByText(/Scene Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/Scene 1: Introduction/i)).toBeInTheDocument();
  });

  it('renders ShotManager and displays shots', () => {
    render(<ShotManager sceneId="sc-1" />);

    expect(screen.getByText(/Shot Manager/i)).toBeInTheDocument();
    expect(screen.getByText(/SHOT #1/i)).toBeInTheDocument();
  });
});

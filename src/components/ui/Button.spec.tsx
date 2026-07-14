import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render the children successfully', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should trigger onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should not trigger onClick when disabled', () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render a loading spinner when loading is true', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByTestId('button-loading-icon')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render an icon when provided', () => {
    render(<Button icon={<span>Icon</span>}>Submit</Button>);
    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });
});

# React Conventions

1. **Functional Components**: All components must be written as Functional Components (`React.FC`).
2. **Dumb Components**: Components must contain zero business logic. They are strictly view layers that receive data (ViewModels or state slices) and emit events.
3. **Event Emitters**: User interactions should be dispatched to Controllers/Input Managers, not handled directly in the component body.
4. **Shallow Selectors**: When consuming Zustand stores, use shallow equality selectors to subscribe only to the specific slices of state the component needs to render.
5. **No Inline Functions**: Avoid inline functions in JSX props to prevent unnecessary re-renders.

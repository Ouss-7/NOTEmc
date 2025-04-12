# NOTEmcp Styling Guidelines

This document outlines the styling guidelines for the NOTEmcp application to ensure consistent design across all components.

## Core Principles

- **Modern and Clean**: Use glassmorphism effects and subtle transparency
- **Responsive**: Ensure all components work well on all device sizes
- **Consistent**: Maintain consistent spacing, colors, and interactions
- **Accessible**: Ensure sufficient contrast and readability

## Tailwind CSS Guidelines

### Glassmorphism Effects
```jsx
<div className="backdrop-blur-xl bg-white/10 rounded-lg">
  {/* Content */}
</div>
```

### Semi-transparent Borders
```jsx
<div className="border border-white/20 rounded-lg">
  {/* Content */}
</div>
```

### Hover Effects
```jsx
<button className="transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20">
  Click Me
</button>
```

### Responsive Grid Layout
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Consistent Spacing and Padding
- Use `p-4` for card padding
- Use `gap-4` for grid gaps
- Use `space-y-4` for vertical spacing between elements
- Use `m-4` for margins around containers

### Text Hierarchy with Opacity
- Primary text: `text-white`
- Secondary text: `text-white/80`
- Tertiary text: `text-white/60`
- Disabled text: `text-white/40`

## Component Examples

### Card Component
```jsx
<div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 transition-all duration-300 hover:translate-y-[-2px] hover:bg-white/20">
  <h3 className="text-white text-lg font-medium mb-2">Card Title</h3>
  <p className="text-white/80 mb-4">Card description with slightly lower opacity for visual hierarchy.</p>
  <div className="text-white/60 text-sm">Additional information with even lower opacity.</div>
</div>
```

### Button Styles
```jsx
<button className="bg-primary/80 text-white px-4 py-2 rounded-md backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-primary hover:translate-y-[-2px]">
  Primary Button
</button>
```

### Dark Mode Considerations
- Use the `.dark` class selector in combination with Tailwind's dark mode variants
- Example: `dark:bg-gray-800 dark:text-white`

## Implementation Notes

- All new components should follow these guidelines
- Existing components should be gradually updated to match these styles
- Use the custom color variables defined in the Tailwind config for consistency

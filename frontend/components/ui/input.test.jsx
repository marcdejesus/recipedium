import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';

describe('Input Component', () => {
  it('renders an input element with default type', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('text'); // Default type is 'text'
  });

  it('applies provided type attribute', () => {
    render(<Input type="email" placeholder="Enter email" />);
    
    const input = screen.getByPlaceholderText('Enter email');
    expect(input.type).toBe('email');
  });

  it('applies additional className', () => {
    render(<Input className="test-class" placeholder="Test className" />);
    
    const input = screen.getByPlaceholderText('Test className');
    expect(input).toHaveClass('test-class');
    // Should also have the default classes
    expect(input).toHaveClass('flex');
    expect(input).toHaveClass('h-9');
    expect(input).toHaveClass('w-full');
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input placeholder="Test input" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText('Test input');
    fireEvent.change(input, { target: { value: 'New value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies disabled state correctly', () => {
    render(<Input disabled placeholder="Disabled input" />);
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('forwards ref to the input element', () => {
    const ref = React.createRef();
    render(<Input ref={ref} placeholder="Ref test" />);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('INPUT');
  });

  it('passes additional props to the input element', () => {
    render(
      <Input 
        placeholder="Additional props" 
        maxLength={10} 
        required 
        aria-label="test-input"
      />
    );
    
    const input = screen.getByPlaceholderText('Additional props');
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-label', 'test-input');
  });

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Input 
        placeholder="Focus and blur test" 
        onFocus={handleFocus} 
        onBlur={handleBlur}
      />
    );
    
    const input = screen.getByPlaceholderText('Focus and blur test');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('can have an initial value', () => {
    render(<Input placeholder="Value test" defaultValue="Initial value" />);
    
    const input = screen.getByPlaceholderText('Value test');
    expect(input).toHaveValue('Initial value');
  });
}); 
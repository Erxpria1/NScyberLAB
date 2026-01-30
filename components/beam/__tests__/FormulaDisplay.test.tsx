import React from 'react';
import { render } from '@testing-library/react-native';
import { FormulaDisplay } from '../FormulaDisplay';
import { View } from 'react-native';

// Mock WebView since it requires native module
jest.mock('react-native-webview', () => ({
  WebView: (props: any) => React.createElement('View', { testID: 'webview', ...props }),
}));

describe('FormulaDisplay', () => {
  it('renders WebView component', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="E = mc^2" />
    );

    expect(getByTestId('webview')).toBeTruthy();
  });

  it('uses default fontSize when not provided', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="x^2" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('font-size: 18px');
  });

  it('applies custom fontSize', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="x^2" fontSize={24} />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('font-size: 24px');
  });

  it('escapes special characters in formula', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula={`a\\b'c\\"d`} />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('\\\\');
    expect(source.html).toContain("\\'");
    expect(source.html).toContain('\\"');
  });

  it('handles empty formula safely', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="" />
    );

    expect(getByTestId('webview')).toBeTruthy();
  });

  it('handles newlines in formula', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="line1\nline2" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('\\n');
  });

  it('includes KaTeX CSS and JS', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="\\int_0^1 x dx" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('katex.min.css');
    expect(source.html).toContain('katex.min.js');
  });

  it('sets displayMode to true for block formulas', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="\\sum_{i=1}^n i" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('displayMode: true');
  });

  it('disables JavaScript errors', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="invalid" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('throwOnError: false');
  });

  it('uses amber color for formula', () => {
    const { getByTestId } = render(
      <FormulaDisplay formula="x" />
    );

    const webView = getByTestId('webview');
    const source = webView.props.source;
    expect(source.html).toContain('#FFD700');
  });
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { StepIndicator } from '../StepIndicator';

describe('StepIndicator', () => {
  it('renders with correct phase tag', () => {
    const { getByText } = render(
      <StepIndicator currentStep={1} totalSteps={5} stepTitle="Initialization" />
    );

    expect(getByText('PHASE: 01')).toBeTruthy();
    expect(getByText('INITIALIZATION')).toBeTruthy();
  });

  it('calculates progress percentage correctly', () => {
    const { getByText } = render(
      <StepIndicator currentStep={2} totalSteps={4} stepTitle="Loading" />
    );

    expect(getByText('BUFF_TRANSFER: 50%')).toBeTruthy();
  });

  it('handles zero total steps safely', () => {
    const { getByText } = render(
      <StepIndicator currentStep={0} totalSteps={0} stepTitle="Test" />
    );

    expect(getByText('BUFF_TRANSFER: 0%')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const { getByText } = render(
      <StepIndicator currentStep={2} totalSteps={3} stepTitle="Test" />
    );

    expect(getByText('PHASE: 02')).toBeTruthy();
  });

  it('displays step title in uppercase', () => {
    const { getByText } = render(
      <StepIndicator currentStep={1} totalSteps={5} stepTitle="beam analysis" />
    );

    expect(getByText('BEAM ANALYSIS')).toBeTruthy();
  });

  it('handles missing step title gracefully', () => {
    const { getByText } = render(
      <StepIndicator currentStep={1} totalSteps={5} stepTitle="" />
    );

    expect(getByText('PHASE: 01')).toBeTruthy();
  });

  it('pads step number with zeros', () => {
    const { getByText } = render(
      <StepIndicator currentStep={5} totalSteps={10} stepTitle="Test" />
    );

    expect(getByText('PHASE: 05')).toBeTruthy();
  });

  it('shows 100% progress on last step', () => {
    const { getByText } = render(
      <StepIndicator currentStep={5} totalSteps={5} stepTitle="Complete" />
    );

    expect(getByText('BUFF_TRANSFER: 100%')).toBeTruthy();
  });
});

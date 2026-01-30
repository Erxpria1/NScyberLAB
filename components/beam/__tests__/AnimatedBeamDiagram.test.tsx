import React from 'react';
import { render } from '@testing-library/react-native';
import { AnimatedBeamDiagram } from '../AnimatedBeamDiagram';
import type { BeamVisualConfig } from '@/types/education';
import { View } from 'react-native';

// Mock Skia components
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: (props: any) => React.createElement('View', { testID: 'canvas', ...props }),
  Path: 'Path',
  Circle: 'Circle',
  Line: 'Line',
  vec: (x: number, y: number) => ({ x, y }),
  Skia: {
    Path: {
      Make: () => ({
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        close: jest.fn(),
        addArc: jest.fn(),
      }),
    },
  },
}));

const mockConfig: BeamVisualConfig = {
  length: 6,
  supports: [
    { type: 'pin', position: 0, label: 'A' },
    { type: 'roller', position: 6, label: 'B' },
  ],
  loads: [
    { type: 'point', position: 3, magnitude: 10, label: 'P' },
  ],
};

describe('AnimatedBeamDiagram', () => {
  it('renders Canvas component', () => {
    const { getByTestId } = render(
      <AnimatedBeamDiagram config={mockConfig} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('displays beam length dimension', () => {
    const { getByText } = render(
      <AnimatedBeamDiagram config={mockConfig} />
    );

    expect(getByText('L = 6 m')).toBeTruthy();
  });

  it('displays support labels', () => {
    const { getByText } = render(
      <AnimatedBeamDiagram config={mockConfig} />
    );

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
  });

  it('displays load label', () => {
    const { getByText } = render(
      <AnimatedBeamDiagram config={mockConfig} />
    );

    expect(getByText('P')).toBeTruthy();
  });

  it('renders custom load magnitude when no label provided', () => {
    const configWithoutLabel: BeamVisualConfig = {
      ...mockConfig,
      loads: [{ type: 'point', position: 3, magnitude: 15 }],
    };

    const { getByText } = render(
      <AnimatedBeamDiagram config={configWithoutLabel} />
    );

    expect(getByText('15 kN')).toBeTruthy();
  });

  it('handles pin support type', () => {
    const configWithPin: BeamVisualConfig = {
      length: 6,
      supports: [{ type: 'pin', position: 0 }],
      loads: [],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithPin} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles roller support type', () => {
    const configWithRoller: BeamVisualConfig = {
      length: 6,
      supports: [{ type: 'roller', position: 6 }],
      loads: [],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithRoller} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles fixed support type', () => {
    const configWithFixed: BeamVisualConfig = {
      length: 4,
      supports: [{ type: 'fixed', position: 0 }],
      loads: [],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithFixed} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles point load type', () => {
    const { getByTestId } = render(
      <AnimatedBeamDiagram config={mockConfig} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles distributed load type', () => {
    const configWithUDL: BeamVisualConfig = {
      length: 8,
      supports: [
        { type: 'pin', position: 0 },
        { type: 'roller', position: 8 },
      ],
      loads: [{ type: 'distributed', position: 0, endPosition: 8, magnitude: 5 }],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithUDL} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles moment load type', () => {
    const configWithMoment: BeamVisualConfig = {
      length: 6,
      supports: [
        { type: 'pin', position: 0 },
        { type: 'roller', position: 6 },
      ],
      loads: [{ type: 'moment', position: 3, magnitude: 10 }],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithMoment} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles empty loads array', () => {
    const configWithoutLoads: BeamVisualConfig = {
      ...mockConfig,
      loads: [],
    };

    const { getByTestId } = render(
      <AnimatedBeamDiagram config={configWithoutLoads} />
    );

    expect(getByTestId('canvas')).toBeTruthy();
  });

  it('handles multiple supports', () => {
    const configWithMultipleSupports: BeamVisualConfig = {
      length: 10,
      supports: [
        { type: 'pin', position: 0, label: 'A' },
        { type: 'roller', position: 5, label: 'B' },
        { type: 'roller', position: 10, label: 'C' },
      ],
      loads: [],
    };

    const { getByText } = render(
      <AnimatedBeamDiagram config={configWithMultipleSupports} />
    );

    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(getByText('C')).toBeTruthy();
  });

  it('handles multiple loads', () => {
    const configWithMultipleLoads: BeamVisualConfig = {
      ...mockConfig,
      loads: [
        { type: 'point', position: 2, magnitude: 5, label: 'P1' },
        { type: 'point', position: 4, magnitude: 10, label: 'P2' },
      ],
    };

    const { getByText } = render(
      <AnimatedBeamDiagram config={configWithMultipleLoads} />
    );

    expect(getByText('P1')).toBeTruthy();
    expect(getByText('P2')).toBeTruthy();
  });
});

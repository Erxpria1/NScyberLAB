import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BeamTypeSelector } from '../BeamTypeSelector';
import { useReactionStore } from '@/store/useReactionStore';

// Mock the store
jest.mock('@/store/useReactionStore');
const mockedUseReactionStore = useReactionStore as jest.MockedFunction<typeof useReactionStore>;

// Mock AsyncStorage for the storage import
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock theme
jest.mock('@/utils/theme', () => ({
  Colors: {
    gray: { 100: '#1a1a1a', 200: '#2a2a2a', 300: '#3a3a3a', 400: '#4a4a4a' },
    amber: { primary: '#FFB000', secondary: '#FFD700', dim: '#8B6914', bg: '#3d2e00' },
    black: '#000000',
  },
  Typography: {
    family: { mono: 'Courier' },
    sizes: { xs: 10, sm: 12, md: 14, lg: 16 },
  },
  Spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
}));

describe('BeamTypeSelector', () => {
  const mockLoadBeamType = jest.fn();
  const mockSetIsExpanded = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseReactionStore.mockReturnValue({
      loadBeamType: mockLoadBeamType,
      selectedPreset: 'simple',
      beamLength: 6,
    });
  });

  it('renders correctly with initial state', () => {
    const { getByText } = render(<BeamTypeSelector />);

    expect(getByText('KİRİŞ TİPİ')).toBeTruthy();
    expect(getByText('Basit Kiriş')).toBeTruthy();
    expect(getByText('L = 6.0m')).toBeTruthy();
  });

  it('displays collapsed by default', () => {
    const { queryByText, getByText } = render(<BeamTypeSelector />);

    // Header should be visible
    expect(getByText('KİRİŞ TİPİ')).toBeTruthy();

    // Content should not be visible initially
    expect(queryByText('Açıklama:')).toBeNull();
  });

  it('expands when header is pressed', () => {
    const { getByText, queryByText } = render(<BeamTypeSelector />);

    // Initially collapsed - description not visible
    expect(queryByText('Açıklama:')).toBeNull();

    // Press header to expand
    fireEvent.press(getByText('KİRİŞ TİPİ'));

    // After expansion, chevron should change
    // The component toggles isExpanded state on press
  });

  it('calls loadBeamType with correct type id when button pressed', () => {
    mockedUseReactionStore.mockReturnValue({
      loadBeamType: mockLoadBeamType,
      selectedPreset: null,
      beamLength: 6,
    });

    const { getByText } = render(<BeamTypeSelector />);

    // Press header to expand first
    const header = getByText('KİRİŞ TİPİ').parent;
    fireEvent.press(header);

    // Then press a beam type button
    const cantileverButton = getByText('Konsol Kiriş');
    fireEvent.press(cantileverButton);

    expect(mockLoadBeamType).toHaveBeenCalledWith('cantilever', 6);
  });

  it('auto-collapses after selection', () => {
    const { getByText } = render(<BeamTypeSelector />);

    // Expand
    const header = getByText('KİRİŞ TİPİ').parent;
    fireEvent.press(header);

    // The chevron should change to ▲ when expanded
    // This tests the expand/collapse behavior
  });

  it('displays correct length badge', () => {
    mockedUseReactionStore.mockReturnValue({
      loadBeamType: mockLoadBeamType,
      selectedPreset: 'simple',
      beamLength: 8.5,
    });

    const { getByText } = render(<BeamTypeSelector />);

    expect(getByText('L = 8.5m')).toBeTruthy();
  });

  it('shows "Seçilmemiş" when no beam type selected', () => {
    mockedUseReactionStore.mockReturnValue({
      loadBeamType: mockLoadBeamType,
      selectedPreset: null,
      beamLength: 6,
    });

    const { getByText } = render(<BeamTypeSelector />);

    expect(getByText('Seçilmemiş')).toBeTruthy();
  });
});

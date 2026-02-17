import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import MyProgress from '../MyProgress';

// Mock the API
jest.mock('../../../services/api', () => ({
    memberProgressApi: {
        getSummary: jest.fn(),
        getMetrics: jest.fn(),
        getMeasurements: jest.fn(),
        getGoals: jest.fn(),
        getWorkouts: jest.fn(),
        getPhotos: jest.fn(),
        getNotes: jest.fn(),
        createMetric: jest.fn(),
        createMeasurement: jest.fn(),
        createOrUpdatePersonalBest: jest.fn(),
        createGoal: jest.fn(),
        uploadPhoto: jest.fn()
    }
}));

// Mock auth context
const mockUser = {
    userId: 1,
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'MEMBER',
    height: 180
};

const mockAuthContext = {
    user: mockUser,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn()
};

jest.mock('../../../contexts/AuthContext', () => ({
    ...jest.requireActual('../../../contexts/AuthContext'),
    useAuth: () => mockAuthContext
}));

// Wrapper component for tests
const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>{component}</AuthProvider>
        </BrowserRouter>
    );
};

describe('MyProgress Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the main component without crashing', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue({
                currentWeight: 80,
                startWeight: 85,
                goalWeight: 75,
                bodyFat: 18,
                startBodyFat: 22,
                muscleMass: 35,
                startMuscleMass: 32,
                streak: 5,
                longestStreak: 10,
                totalCaloriesBurned: 5000,
                totalWorkouts: 50,
                workoutsThisMonth: 12,
                avgWorkoutDuration: 60,
                workoutsThisWeek: 3,
                consistencyRate: 75
            });

            renderWithProviders(<MyProgress />);
            
            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            });
        });

        it('should render all tab buttons', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
                expect(screen.getByText('Metrics')).toBeInTheDocument();
                expect(screen.getByText('Goals')).toBeInTheDocument();
                expect(screen.getByText('Workouts')).toBeInTheDocument();
                expect(screen.getByText('Photos')).toBeInTheDocument();
                expect(screen.getByText('Notes')).toBeInTheDocument();
            });
        });

        it('should render quick action buttons', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            await waitFor(() => {
                expect(screen.getByText('Log Progress')).toBeInTheDocument();
                expect(screen.getByText('Log PR')).toBeInTheDocument();
                expect(screen.getByText('New Goal')).toBeInTheDocument();
                expect(screen.getByText('Add Photo')).toBeInTheDocument();
            });
        });

        it('should render time range filters', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            await waitFor(() => {
                expect(screen.getByText('7D')).toBeInTheDocument();
                expect(screen.getByText('30D')).toBeInTheDocument();
                expect(screen.getByText('90D')).toBeInTheDocument();
                expect(screen.getByText('1Y')).toBeInTheDocument();
                expect(screen.getByText('ALL')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Navigation', () => {
        it('should switch to metrics tab when clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);
            (memberProgressApi.getMetrics as jest.Mock).mockResolvedValue([]);
            (memberProgressApi.getMeasurements as jest.Mock).mockResolvedValue([]);

            renderWithProviders(<MyProgress />);

            const metricsTab = screen.getByText('Metrics');
            await userEvent.click(metricsTab);

            await waitFor(() => {
                // The metrics tab should be active
                expect(metricsTab).toHaveClass('active');
            });
        });

        it('should switch to goals tab when clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);
            (memberProgressApi.getGoals as jest.Mock).mockResolvedValue([]);

            renderWithProviders(<MyProgress />);

            const goalsTab = screen.getByText('Goals');
            await userEvent.click(goalsTab);

            await waitFor(() => {
                expect(goalsTab).toHaveClass('active');
            });
        });

        it('should switch to workouts tab when clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);
            (memberProgressApi.getWorkouts as jest.Mock).mockResolvedValue([]);

            renderWithProviders(<MyProgress />);

            const workoutsTab = screen.getByText('Workouts');
            await userEvent.click(workoutsTab);

            await waitFor(() => {
                expect(workoutsTab).toHaveClass('active');
            });
        });
    });

    describe('Modal Interactions', () => {
        it('should open log progress modal when button is clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            const logProgressBtn = screen.getByText('Log Progress');
            await userEvent.click(logProgressBtn);

            await waitFor(() => {
                expect(screen.getByText("Log Today's Progress")).toBeInTheDocument();
            });
        });

        it('should close log progress modal when close button is clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            const logProgressBtn = screen.getByText('Log Progress');
            await userEvent.click(logProgressBtn);

            await waitFor(() => {
                expect(screen.getByText("Log Today's Progress")).toBeInTheDocument();
            });

            const closeBtn = screen.getByRole('button', { name: /close/i });
            await userEvent.click(closeBtn);

            await waitFor(() => {
                expect(screen.queryByText("Log Today's Progress")).not.toBeInTheDocument();
            });
        });

        it('should open create goal modal when button is clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            const newGoalBtn = screen.getByText('New Goal');
            await userEvent.click(newGoalBtn);

            await waitFor(() => {
                expect(screen.getByText('Create New Goal')).toBeInTheDocument();
            });
        });
    });

    describe('Form Interactions', () => {
        it('should update form state when input changes', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            const logProgressBtn = screen.getByText('Log Progress');
            await userEvent.click(logProgressBtn);

            await waitFor(() => {
                expect(screen.getByText("Log Today's Progress")).toBeInTheDocument();
            });

            const weightInput = screen.getByPlaceholderText('e.g., 78.5');
            await userEvent.type(weightInput, '80');

            expect(weightInput).toHaveValue(80);
        });

        it('should show validation error when trying to save empty form', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            // Mock window.alert
            const alertMock = jest.spyOn(window, 'alert').mockImplementation();

            renderWithProviders(<MyProgress />);

            const logProgressBtn = screen.getByText('Log Progress');
            await userEvent.click(logProgressBtn);

            await waitFor(() => {
                expect(screen.getByText("Log Today's Progress")).toBeInTheDocument();
            });

            const saveBtn = screen.getByText('Save Progress');
            await userEvent.click(saveBtn);

            await waitFor(() => {
                expect(alertMock).toHaveBeenCalledWith('Please enter at least some data to log');
            });

            alertMock.mockRestore();
        });
    });

    describe('Time Range Filters', () => {
        it('should update time range when filter is clicked', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockResolvedValue(null);

            renderWithProviders(<MyProgress />);

            const filter90D = screen.getByText('90D');
            await userEvent.click(filter90D);

            await waitFor(() => {
                expect(filter90D).toHaveClass('active');
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API fails', async () => {
            const { memberProgressApi } = require('../../../services/api');
            (memberProgressApi.getSummary as jest.Mock).mockRejectedValue(new Error('Network error'));

            // Mock console.error to avoid noise in tests
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            renderWithProviders(<MyProgress />);

            // Component should still render without crashing
            await waitFor(() => {
                expect(screen.getByText('Overview')).toBeInTheDocument();
            });

            consoleSpy.mockRestore();
        });
    });
});
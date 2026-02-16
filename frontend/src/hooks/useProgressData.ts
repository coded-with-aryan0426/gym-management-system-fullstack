import { useState, useEffect, useCallback } from 'react';
import { memberProgressApi } from '../services/api';

interface UseProgressDataOptions<T> {
    fetchFn: () => Promise<T>;
    dependencies?: any[];
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
}

interface UseProgressDataReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

export function useProgressData<T>({
    fetchFn,
    dependencies = [],
    onError,
    onSuccess
}: UseProgressDataOptions<T>): UseProgressDataReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetchFn();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An unknown error occurred');
            setError(error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, onError, onSuccess]);

    useEffect(() => {
        fetchData();
    }, [fetchData, ...dependencies]);

    return { data, loading, error, refetch: fetchData };
}

// Specialized hooks for different data types
export function useMemberSummary(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getSummary(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching summary:', error)
    });
}

export function useMemberMetrics(memberId: number, timeRange: string) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getMetrics(memberId),
        dependencies: [memberId, timeRange],
        onError: (error) => console.error('Error fetching metrics:', error)
    });
}

export function useMemberMeasurements(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getMeasurements(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching measurements:', error)
    });
}

export function useMemberGoals(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getGoals(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching goals:', error)
    });
}

export function useMemberWorkouts(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getWorkouts(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching workouts:', error)
    });
}

export function useMemberPhotos(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getPhotos(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching photos:', error)
    });
}

export function useMemberNotes(memberId: number) {
    return useProgressData({
        fetchFn: () => memberProgressApi.getNotes(memberId),
        dependencies: [memberId],
        onError: (error) => console.error('Error fetching notes:', error)
    });
}
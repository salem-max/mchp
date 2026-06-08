'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  customerId: string;
  technicianId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    status?: string;
    priority?: string;
    technicianId?: string;
  };

  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  setSelectedJob: (job: Job | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilter: (filter: Partial<JobsState['filter']>) => void;
  getFilteredJobs: () => Job[];
}

export const useJobsStore = create<JobsState>()(
  devtools((set, get) => ({
    jobs: [],
    selectedJob: null,
    isLoading: false,
    error: null,
    filter: {},

    setJobs: (jobs) => set({ jobs, error: null }),

    addJob: (job) =>
      set((state) => ({
        jobs: [job, ...state.jobs],
        error: null,
      })),

    updateJob: (id, updates) =>
      set((state) => ({
        jobs: state.jobs.map((job) =>
          job.id === id ? { ...job, ...updates } : job
        ),
        selectedJob:
          state.selectedJob?.id === id
            ? { ...state.selectedJob, ...updates }
            : state.selectedJob,
      })),

    deleteJob: (id) =>
      set((state) => ({
        jobs: state.jobs.filter((job) => job.id !== id),
        selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
      })),

    setSelectedJob: (job) => set({ selectedJob: job }),

    setIsLoading: (loading) => set({ isLoading: loading }),

    setError: (error) => set({ error }),

    setFilter: (filter) =>
      set((state) => ({
        filter: { ...state.filter, ...filter },
      })),

    getFilteredJobs: () => {
      const { jobs, filter } = get();
      return jobs.filter((job) => {
        if (filter.status && job.status !== filter.status) return false;
        if (filter.priority && job.priority !== filter.priority) return false;
        if (filter.technicianId && job.technicianId !== filter.technicianId)
          return false;
        return true;
      });
    },
  }))
);

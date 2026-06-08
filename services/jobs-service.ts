/**
 * Jobs Service
 * Handles all job/work order related API calls
 */

import { apiClient } from './api-client';
import type { Job } from '@/store/useJobsStore';

export interface CreateJobRequest {
  title: string;
  description: string;
  customerId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  location?: string;
  estimatedHours?: number;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  technicianId?: string;
  dueDate?: string;
  location?: string;
  estimatedHours?: number;
  actualHours?: number;
}

class JobsService {
  async getJobs(filters?: Record<string, any>) {
    const response = await apiClient.get<Job[]>('/jobs', filters);
    return response;
  }

  async getJobById(id: string) {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response;
  }

  async createJob(data: CreateJobRequest) {
    const response = await apiClient.post<Job>('/jobs', data);
    return response;
  }

  async updateJob(id: string, data: UpdateJobRequest) {
    const response = await apiClient.put<Job>(`/jobs/${id}`, data);
    return response;
  }

  async deleteJob(id: string) {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response;
  }

  async assignTechnician(jobId: string, technicianId: string) {
    const response = await apiClient.patch<Job>(
      `/jobs/${jobId}`,
      { technicianId }
    );
    return response;
  }

  async updateJobStatus(jobId: string, status: string) {
    const response = await apiClient.patch<Job>(
      `/jobs/${jobId}`,
      { status }
    );
    return response;
  }

  async getJobsByStatus(status: string) {
    const response = await apiClient.get<Job[]>('/jobs', { status });
    return response;
  }

  async getJobsByTechnician(technicianId: string) {
    const response = await apiClient.get<Job[]>('/jobs', {
      technicianId,
    });
    return response;
  }

  async getJobsByCustomer(customerId: string) {
    const response = await apiClient.get<Job[]>('/jobs', {
      customerId,
    });
    return response;
  }
}

export const jobsService = new JobsService();
export default JobsService;

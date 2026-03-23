import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';

// Backend uses flat response: { success, message, ...data } — no nested `data` key
export const useStats = () =>
  useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/api/admin/stats').then((r) => r.data.stats),
  });

export const useVideos = (params) =>
  useQuery({
    queryKey: ['videos', params],
    queryFn: () =>
      api
        .get('/api/videos', { params })
        .then((r) => r.data),
  });

export const useUsers = (params) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: () =>
      api.get('/api/users/admin/list', { params }).then((r) => r.data),
  });

export const useBookings = (params) =>
  useQuery({
    queryKey: ['bookings', params],
    queryFn: () =>
      api.get('/api/bookings/agent/all', { params }).then((r) => r.data),
  });

export const useDeleteVideo = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/api/videos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['videos'] }),
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }) => api.patch(`/api/users/${id}`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
};

import { API_ENDPOINTS, apiRequest } from '@/utils/api';

export const uploadFile = async (file: File, endpoint: string, token: string):
Promise<{ success: boolean; error?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiRequest({
      endpoint: API_ENDPOINTS.FILE_UPLOAD(endpoint),
      token: token,
      body: formData
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        const errorMessage = errorData.file?.[0] || errorData.detail || 'Upload failed';
        return { success: false, error: errorMessage };
      } catch {
        return { success: false, error: 'Upload failed' };
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Network error' };
  }
};
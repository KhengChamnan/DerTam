import type { User } from './auth';

export interface UpdateProfileData {
  name: string;
  username: string;
  phone_number: string;
  age: number;
  gender: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<User> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  // Ensure all required fields are present and valid
  const payload = {
    name: data.name.trim(),
    username: data.username.trim(),
    phone_number: data.phone_number.trim(),
    age: Number(data.age) || 0,
    gender: data.gender || 'prefer-not-to-say',
  };

  // Validate required fields
  if (!payload.name) {
    throw new Error('Name is required');
  }

  const response = await fetch('https://g9-capstone-project-ll.onrender.com/api/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  
  if (!response.ok) {
    // Handle validation errors
    if (result.errors || result.data) {
      const errors = result.errors || result.data;
      const errorMessages = Object.entries(errors)
        .map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`;
          }
          return `${field}: ${messages}`;
        })
        .join('; ');
      throw new Error(errorMessages || result.message || 'Validation failed');
    }
    throw new Error(result.message || 'Failed to update profile');
  }
  
  // Update localStorage with new user data
  const updatedUser = result.data?.user || result.user || result;
  localStorage.setItem('user', JSON.stringify(updatedUser));
  
  return updatedUser;
}

export async function updateProfileWithFormData(formData: FormData): Promise<User> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No authentication token found');

  const response = await fetch('https://g9-capstone-project-ll.onrender.com/api/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      // Do NOT set Content-Type; browser will set it for FormData
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    const errors = result.errors || result.data;
    const errorMessages = errors
      ? Object.entries(errors)
          .map(([field, messages]) =>
            Array.isArray(messages) ? `${field}: ${messages.join(', ')}` : `${field}: ${messages}`
          )
          .join('; ')
      : result.message || 'Validation failed';
    throw new Error(errorMessages);
  }

  // After successful upload
  const updatedUser = result.data?.user || result.user || result;
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
}

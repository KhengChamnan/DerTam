export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation?: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  user?: User;
  token?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  pin: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyPinData {
  email: string;
  pin: string;
}

const API_BASE_URL = 'https://g9-capstone-project-ll.onrender.com';

// Login
export async function login(data: LoginData): Promise<{ user: User; token: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (result.data && typeof result.data === 'object') {
        const errorMessages = Object.entries(result.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return errors.join(', ');
            }
            return String(errors);
          })
          .join('. ');
        
        throw new Error(errorMessages || result.message || 'Login failed');
      }
      
      throw new Error(result.message || 'Login failed. Please check your credentials.');
    }

    // Handle different response structures
    let user: User;
    let token: string;

    if (result.data) {
      // Check if data contains a user object or just user properties
      if (result.data.user) {
        user = result.data.user;
        token = result.data.token;
      } else if (result.data.name || result.data.email) {
        // API returns user properties directly in data
        user = {
          id: result.data.id || 0,
          email: result.data.email || data.email,
          name: result.data.name || '',
          phone: result.data.phone,
          avatar: result.data.avatar,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
        };
        token = result.data.token;
      } else {
        throw new Error('Invalid response structure from server');
      }
    } else if (result.user && result.token) {
      user = result.user;
      token = result.token;
    } else {
      throw new Error('Invalid response structure from server');
    }

    // Validate that we have the required data
    if (!token || !user || !user.name) {
      throw new Error('Invalid authentication data received');
    }

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');

    return { user, token };
  } catch (error) {
    console.error('Login failed');
    throw error;
  }
}

// Register
export async function register(data: RegisterData): Promise<{ user: User; token: string }> {
  try {
    // The API expects 'c_password' not 'password_confirmation'
    const registerPayload = {
      name: data.name,
      email: data.email,
      password: data.password,
      c_password: data.password,
      phone: data.phone,
    };

    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(registerPayload),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server error. Please try again later.');
    }

    const result = await response.json();

    if (!response.ok) {
      // Handle validation errors
      if (result.data && typeof result.data === 'object') {
        const errorMessages = Object.entries(result.data)
          .map(([field, errors]) => {
            if (Array.isArray(errors)) {
              return errors.join(', ');
            }
            return String(errors);
          })
          .join('. ');
        
        throw new Error(errorMessages || result.message || 'Registration failed');
      }
      
      throw new Error(result.message || 'Registration failed. Please try again.');
    }

    // Handle different response structures
    let user: User;
    let token: string;

    if (result.data) {
      // Check if data contains a user object or just user properties
      if (result.data.user) {
        user = result.data.user;
        token = result.data.token;
      } else if (result.data.name || result.data.email) {
        // API returns user properties directly in data
        user = {
          id: result.data.id || 0,
          email: result.data.email || data.email,
          name: result.data.name || data.name,
          phone: result.data.phone || data.phone,
          avatar: result.data.avatar,
          created_at: result.data.created_at,
          updated_at: result.data.updated_at,
        };
        token = result.data.token;
      } else {
        throw new Error('Invalid response structure from server');
      }
    } else if (result.user && result.token) {
      user = result.user;
      token = result.token;
    } else {
      throw new Error('Invalid response structure from server');
    }

    // Validate that we have the required data
    if (!token || !user || !user.name) {
      throw new Error('Invalid authentication data received');
    }

    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');

    return { user, token };
  } catch (error) {
    console.error('Registration failed');
    throw error;
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    
    if (token) {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout failed');
  } finally {
    // Always clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
  }
}

// Forgot Password - Send PIN
export async function forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to send reset PIN');
  }

  return result;
}

// Verify PIN
export async function verifyPin(data: VerifyPinData): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/verify/pin`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'PIN verification failed');
  }

  return result;
}

// Reset Password
export async function resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/reset-password`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to reset password');
  }

  return result;
}

// Google Sign In
export async function googleSignIn(token: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Google sign in failed');
  }

  const user = result.data?.user || result.user;
  const authToken = result.data?.token || result.token;

  localStorage.setItem('token', authToken);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('isAuthenticated', 'true');

  return { user, token: authToken };
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/api/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return result.data?.user || result.user || result;
}
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
const AUTH_API_URL = `${API_BASE_URL}/api/v2/auth`;

// Token storage keys
// Use `accesshub_access_token` for compatibility with backend/frontend localStorage usage
const ACCESS_TOKEN_KEY = 'accesshub_access_token';
const REFRESH_TOKEN_KEY = 'accesshub_refresh_token';
const USER_KEY = 'accesshub_user_data';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken();
              this.setAccessToken(response.access_token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Auth API methods
  async login(username, password) {
    try {
      console.log('[AuthService] Attempting login...');
      const response = await this.api.post(`${AUTH_API_URL}/login`, {
        username,
        password,
      });

      console.log('[AuthService] Login response:', response.data);

      if (response.data.success) {
        const { access_token, refresh_token, user } = response.data.data;
        
        console.log('[AuthService] Storing tokens and user data...');
        console.log('[AuthService] User role:', user?.role);
        
        this.setAccessToken(access_token);
        this.setRefreshToken(refresh_token);
        this.setUser(user);

        // Verify storage
        console.log('[AuthService] Tokens stored. Verifying...');
        console.log('[AuthService] Access token exists:', !!this.getAccessToken());
        console.log('[AuthService] Refresh token exists:', !!this.getRefreshToken());
        console.log('[AuthService] User data exists:', !!this.getUser());
        console.log('[AuthService] User role from storage:', this.getUser()?.role);

        return response.data.data;
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }

  async logout() {
    try {
      await this.api.post(`${AUTH_API_URL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${AUTH_API_URL}/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      if (response.data.success) {
        const { access_token, refresh_token } = response.data.data;
        this.setAccessToken(access_token);
        if (refresh_token) {
          this.setRefreshToken(refresh_token);
        }
        return response.data.data;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get(`${AUTH_API_URL}/me`);
      
      if (response.data.success) {
        const user = response.data.data.user;
        this.setUser(user);
        return user;
      }

      throw new Error('Failed to get user');
    } catch (error) {
      throw error;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await this.api.post(`${AUTH_API_URL}/change-password`, {
        old_password: oldPassword,
        new_password: newPassword,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post(`${AUTH_API_URL}/forgot-password`, {
        email,
      });

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      throw new Error(message);
    }
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  getUserRole() {
    const user = this.getUser();
    return user?.role?.id || user?.role?.name || null;
  }

  hasRole(roles) {
    const user = this.getUser();
    if (!user || !user.role) return false;
    
    const userRoleId = user.role.id;
    const userRoleName = user.role.name;
    
    if (Array.isArray(roles)) {
      return roles.some(role => role === userRoleId || role === userRoleName);
    }
    return userRoleId === roles || userRoleName === roles;
  }
}

export const authService = new AuthService();
export default authService;
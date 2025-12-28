import axios from 'axios';

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Helper function to get full image URL
export function getImageUrl(imagePath) {
  if (!imagePath) return '/placeholder.jpg';
  
  // If imagePath already includes protocol (http:// or https://), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If imagePath starts with /, prepend API base URL
  if (imagePath.startsWith('/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path from API base
  return `${API_BASE_URL}/${imagePath}`;
}

export default api;


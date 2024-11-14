// src/services/routeService.js
const API_URL = process.env.REACT_APP_API_URL;

export const routeService = {
  saveRoute: async (routeData) => {
    try {
      const response = await fetch(`${API_URL}/routes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in saveRoute:', error);
      throw error;
    }
  },

  getRoutes: async () => {
    try {
      const response = await fetch(`${API_URL}/routes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching routes:', error);
      throw error;
    }
  }
};

export default routeService;
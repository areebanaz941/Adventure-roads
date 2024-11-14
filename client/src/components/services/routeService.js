const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const routeService = {
  saveRoute: async (routeData) => {
    try {
      const response = await fetch(`${API_URL}/api/routes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: routeData.properties.name,
          description: routeData.properties.description,
          fileName: routeData.properties.fileName,
          roadType: routeData.properties.roadType,
          path: routeData.geometry.coordinates,
          stats: routeData.properties.stats
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      console.error('Error in saveRoute:', error);
      throw error;
    }
  },
  getAllRoutes: async () => {
    try {
      const response = await fetch(`${API_URL}/api/routes`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching routes:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

export default routeService;
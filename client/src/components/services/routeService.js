const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const routeService = {
  saveRoute: async (routeData) => {
    try {
      // Stringify coordinates for precise comparison
      const coordinatesString = JSON.stringify(routeData.geometry.coordinates);

      // Check if a route with similar coordinates exists
      const response = await fetch(`${API_URL}/api/routes/findByCoordinates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordinatesString: coordinatesString
        })
      });
  
      const existingRouteResponse = await response.json();
  
      if (response.ok && existingRouteResponse && existingRouteResponse._id) {
        // If a route with similar coordinates exists, update it
        const updateResponse = await fetch(`${API_URL}/api/routes/${existingRouteResponse._id}`, {
          method: 'PUT',
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
  
        const updatedData = await updateResponse.json();
        if (!updateResponse.ok) throw new Error(updatedData.message);
        return updatedData;
      } else {
        // If no route with similar coordinates exists, create a new one
        const createResponse = await fetch(`${API_URL}/api/routes`, {
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
  
        const createdData = await createResponse.json();
        if (!createResponse.ok) throw new Error(createdData.message);
        return createdData;
      }
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
  },

  updateRoute: async (routeData) => {
    try {
      const response = await fetch(`${API_URL}/api/routes/${routeData._id}`, {
        method: 'PUT',
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

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating route:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }
};

export default routeService;
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const routeService = {
  saveRoute: async (routeData) => {
    try {
      const response = await fetch(`${API_URL}/api/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeData)
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Server error');
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;

    } catch (error) {
      console.error('Error in saveRoute:', error);
      throw error;
    }
  }
};

export default routeService;
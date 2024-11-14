// src/components/Map/UserMap.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import UsingTheMap from '../UsingTheMap';
import routeService from '../services/routeService';
// Assuming this is where routeService is defined
import RouteInfo from '../Map/userRouteInfo'; // Component for displaying route information

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const UserMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.satellite,
      center: [133.7751, -25.2744],
      zoom: 4,
      projection: 'globe',
      renderWorldCopies: false
    });

    map.current.on('style.load', () => {
      map.current.setFog({
        color: 'rgb(0, 0, 0)',
        'high-color': 'rgb(20, 20, 40)',
        'horizon-blend': 0.2
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }),
      'bottom-right'
    );

    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAllRoutes();
  
      // Log the full response to inspect structure if there's an error
      console.log("Full Response:", response);
      if (!response.success) {
        throw new Error(response.message);
      }
  
      if (!Array.isArray(response.data.data)) {
        console.error("Unexpected data format:", response.data);
        throw new Error("Expected an array of routes in the 'data.data' property.");
      }
  
      const routesData = response.data.data.map(transformRouteData);
      setRoutes(routesData);
  
      routesData.forEach((route, index) => addRouteToMap(route, index));
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const transformRouteData = (routeData) => ({
    ...routeData,
    properties: {
      ...routeData.properties,
      roadType: routeData.properties.roadType || 'Not Yet Defined',
      notes: routeData.properties.notes || '',
    },
    id: routeData._id, // Ensure unique identifier
  });

  const addRouteToMap = (route, index) => {
    if (!map.current || !route?.geometry?.coordinates) return;

    const sourceId = `route-${index}`;
    const layerId = `${sourceId}-layer`;

    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: route
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': selectedRoute?.id === route.id ? '#ff3b30' : '#000',
        'line-width': selectedRoute?.id === route.id ? 4 : 3,
        'line-opacity': selectedRoute?.id === route.id ? 1 : 0.8
      }
    });

    map.current.on('click', layerId, () => setSelectedRoute(route));
  };

  const changeMapStyle = (style) => {
    map.current.setStyle(MAP_STYLES[style]);
    setCurrentStyle(style);
    setIsStyleMenuOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="bg-black">
        <div className="flex">
          <div className="w-72 bg-[#d2d2d3] border-r border-gray-200">
            <div className="bg-[#4B8BF4] text-white p-2 flex justify-between items-center">
              <h3 className="font-bold">Route Info</h3>
              <button className="hover:bg-blue-600 px-2 rounded">▼</button>
            </div>
            <div className="p-4">
              {selectedRoute ? <RouteInfo route={selectedRoute} /> : <p className="text-gray-900">Select a Route to see details..</p>}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-[#4B8BF4] p-2 flex justify-between items-center">
              <div className="flex space-x-2">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">⬇ Export to GPX</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">⬇ Export to KML</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">? Help</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">× Deselect All</button>
              </div>

              <div className="relative">
                <button onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center">Base Map ▼</button>
                {isStyleMenuOpen && (
                  <div className="absolute right-0 mt-1 bg-white rounded shadow-lg z-50">
                    <button onClick={() => changeMapStyle('satellite')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Satellite</button>
                    <button onClick={() => changeMapStyle('streets')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Streets</button>
                    <button onClick={() => changeMapStyle('satelliteStreets')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">Satellite with Streets</button>
                  </div>
                )}
              </div>
            </div>

            <div ref={mapContainer} className="h-[calc(100vh-48px)]" />
          </div>
        </div>
      </div>

      <div className="bg-white">
        <UsingTheMap />
      </div>
    </div>
  );
};

export default UserMap;

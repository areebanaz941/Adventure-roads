//src/components/Map/AdminMap.js
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import LeftSidebar from '../LeftSidebar';
import { routeService } from '../services/routeService';
import SaveNotification from '../SaveNotification';
import SplitRouteDialog from '../SplitRouteDialog';
import AdminCommentsView from '../Map/AdminCommentsView';
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MAP_STYLES = {
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const AdminDashboard = () => {
  // Refs and State
  const mapContainer = useRef(null);
  const map = useRef(null);
  const fileInputRef = useRef(null);
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [hoveredRouteId, setHoveredRouteId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);



  // Helper Functions
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  
  const addRouteToMap = (route, index) => {
    if (!map.current || !route?.geometry?.coordinates) return;
  
    const sourceId = `route-${index}`;
    const layerId = `${sourceId}-layer`;
    const outlineLayerId = `${sourceId}-outline`;
  
    // Remove existing layers
    if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
  
    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: route
    });
  
    // Determine if route is from database or uploaded
    const isUploadedRoute = !route._id;
    
    // Add outline layer
    map.current.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        visibility: 'visible'
      },
      paint: {
        'line-color': '#000000',
        'line-width': selectedRoute?.id === route.id ? 6 : 5,
        'line-opacity': 1
      }
    });
  
    // Add main route layer
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
        'line-color': isUploadedRoute ? '#ff0000' : ROUTE_COLORS[route.properties.roadType] || ROUTE_COLORS['Not Yet Defined'],
        'line-width': selectedRoute?.id === route.id ? 4 : 3,
        'line-opacity': 1
      }
    });
  
    // Click handlers
    map.current.on('click', layerId, () => !isSplitting && setSelectedRoute(route));
    map.current.on('click', outlineLayerId, () => !isSplitting && setSelectedRoute(route));
  };

// Add the ROUTE_COLORS constant at the top of your file with your other constants
const ROUTE_COLORS = {
  'Sealed Road': '#808080',  // Gray for sealed roads
  'Gravel/Dirt Road': '#FFA500',      // Orange for gravel/dirt roads
  'Track/Trail': '#8B4513',       // Brown for tracks/trails
  'Sand': '#FFD700',         // Yellow for off-road
  'Not Yet Defined': '#90EE90'     // Light green for undefined
};

  // Add this right after your other helper functions and before the useEffect
const addCustomControls = (map) => {
  // Custom Controls Container
  const customControlsContainer = document.createElement('div');
  customControlsContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group custom-controls';
  
  // Add styling
  const style = document.createElement('style');
  style.textContent = `
    .custom-controls {
      position: absolute;
      top: 115px;
      right: 10px;
      background: rgb(255, 255, 255);
      box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 0px 2px;
      border-radius: 4px;
      overflow: hidden;
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .custom-control-button {
      width: 29px;
      height: 29px;
      background: rgb(255, 255, 255);
      border: none;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }
    .custom-control-button:last-child {
      border-bottom: none;
    }
    .custom-control-button:hover {
      background-color: rgb(242, 242, 242);
    }
    .custom-control-button svg {
      width: 18px;
      height: 18px;
      fill: rgb(55, 55, 55);
      display: block;
    }
    .custom-control-separator {
      height: 1px;
      background: rgba(0, 0, 0, 0.1);
      margin: 0;
    }
  `;
  document.head.appendChild(style);

  const buttons = [
    {
      icon: `<svg viewBox="0 0 24 24"><path d="M12 2L4.5 20.3l7.5-9l7.5 9z"/></svg>`,
      onClick: () => map.easeTo({ bearing: 0, pitch: 0 }),
      title: 'Reset north'
    },
    {
      icon: `<svg viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>`,
      onClick: () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              map.flyTo({
                center: [position.coords.longitude, position.coords.latitude],
                zoom: 14
              });
            },
            (error) => alert('Unable to get your location')
          );
        }
      },
      title: 'My location'
    },
    'separator',
    {
      icon: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
      onClick: () => {
        if (window.confirm('Clear all routes?')) {
          setRoutes([]);
          setSelectedRoute(null);
          routes.forEach((_, index) => {
            const sourceId = `route-${index}`;
            const layerId = `${sourceId}-layer`;
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
          });
        }
      },
      title: 'Clear all'
    }
  ];

  // Create buttons
  buttons.forEach(button => {
    if (button === 'separator') {
      const separator = document.createElement('div');
      separator.className = 'custom-control-separator';
      customControlsContainer.appendChild(separator);
    } else {
      const buttonElement = document.createElement('button');
      buttonElement.className = 'custom-control-button';
      buttonElement.innerHTML = button.icon;
      buttonElement.onclick = button.onClick;
      buttonElement.title = button.title;
      customControlsContainer.appendChild(buttonElement);
    }
  });

  // Add the custom controls container to the map
  map.getContainer().appendChild(customControlsContainer);
};

  // Map Style Change Handler
  const handleChangeMapStyle = (style) => {

    const currentRoutes = [...routes]; // Store current routes
  
  map.current.once('style.load', () => {
    // Re-add all routes after style is loaded
    setTimeout(() => {
      currentRoutes.forEach((route, index) => {
        addRouteToMap(route, index);
      });
    }, 100);
  });

  map.current.setStyle(MAP_STYLES[style]);
  setCurrentStyle(style);
  setIsStyleMenuOpen(false);
};


  // Map Initialization
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES.streets,
      center: [133.7751, -25.2744],
      zoom: 4,
      projection: 'globe',
      renderWorldCopies: false
    });

    // Add mouse events after map loads
    map.current.on('load', () => {
      map.current.setFog({
        color: 'rgb(0, 0, 0)',
        'high-color': 'rgb(20, 20, 40)',
        'horizon-blend': 0.2
      });

      // Add hover effect handlers
      map.current.on('mousemove', (e) => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: routes.map((_, index) => `route-${index}-layer`)
        });

        if (features.length > 0) {
          map.current.getCanvas().style.cursor = 'pointer';
          const hoveredRoute = routes.find((route, index) => 
            `route-${index}-layer` === features[0].layer.id
          );
          if (hoveredRoute) {
            setSelectedRoute(hoveredRoute);
          }
        } else {
          map.current.getCanvas().style.cursor = '';
          setHoveredRouteId(null);
        }
      });
      addCustomControls(map.current);
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }),
        'bottom-right'
      );
      // Add this line to fetch routes when map initializes
      fetchRoutes();

  }, []);

  // Add these new functions to handle route fetching
  const fetchRoutes = async () => {
    try {
      const response = await routeService.getAllRoutes();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch routes');
      }

      const routesData = response.data.data.map(transformRouteData);
      setRoutes(routesData);

      // Add fetched routes to map
      routesData.forEach((route, index) => addRouteToMap(route, index));
    } catch (error) {
      console.error('Error fetching routes:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to fetch routes: ' + error.message
      });
    }
  };

  const transformRouteData = (routeData) => ({
    ...routeData,
    properties: {
      ...routeData.properties,
      roadType: routeData.properties.roadType || 'Not Yet Defined',
      notes: routeData.properties.notes || '',
      stats: routeData.properties.stats || {
        totalDistance: 0,
        maxElevation: 0,
        minElevation: 0,
        elevationGain: 0,
        numberOfPoints: 0
      }
    },
  id: routeData._id // Ensure unique identifier
});



  // Route State Update Effect
// First, remove the setting of selectedRoute from the mousemove handler
useEffect(() => {
  if (!map.current) return;

  const handleMouseMove = (e) => {
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: routes.map((_, index) => `route-${index}-layer`)
    });
  
    if (features.length > 0) {
      map.current.getCanvas().style.cursor = 'pointer';
      const hoveredRoute = routes.find((route, index) => 
        `route-${index}-layer` === features[0].layer.id
      );
      
      if (hoveredRoute) {
        routes.forEach((route, index) => {
          const layerId = `route-${index}-layer`;
          const outlineLayerId = `route-${index}-outline`;
          const isUploadedRoute = !route._id;
  
          if (map.current.getLayer(layerId)) {
            if (layerId === features[0].layer.id) {
              map.current.setPaintProperty(outlineLayerId, 'line-width', 7);
              map.current.setPaintProperty(layerId, 'line-width', 5);
              map.current.setPaintProperty(layerId, 'line-opacity', 1);
            } else {
              const routeColor = isUploadedRoute ? '#ff0000' : ROUTE_COLORS[route.properties.roadType] || ROUTE_COLORS['Not Yet Defined'];
              map.current.setPaintProperty(outlineLayerId, 'line-width', 5);
              map.current.setPaintProperty(layerId, 'line-width', 3);
              map.current.setPaintProperty(layerId, 'line-opacity', 0.6);
              map.current.setPaintProperty(layerId, 'line-color', routeColor);
            }
          }
        });
      }
    } else {
      map.current.getCanvas().style.cursor = '';
      routes.forEach((route, index) => {
        const layerId = `route-${index}-layer`;
        const outlineLayerId = `route-${index}-outline`;
        const isUploadedRoute = !route._id;
  
        if (map.current.getLayer(layerId)) {
          if (route === selectedRoute) {
            map.current.setPaintProperty(outlineLayerId, 'line-width', 6);
            map.current.setPaintProperty(layerId, 'line-width', 4);
            map.current.setPaintProperty(layerId, 'line-opacity', 0.9);
          } else {
            const routeColor = isUploadedRoute ? '#ff0000' : ROUTE_COLORS[route.properties.roadType] || ROUTE_COLORS['Not Yet Defined'];
            map.current.setPaintProperty(outlineLayerId, 'line-width', 5);
            map.current.setPaintProperty(layerId, 'line-width', 3);
            map.current.setPaintProperty(layerId, 'line-opacity', 0.8);
            map.current.setPaintProperty(layerId, 'line-color', routeColor);
          }
        }
      });
    }
  };

  const handleClick = (e) => {
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: routes.map((_, index) => `route-${index}-layer`)
    });
  
    if (features.length > 0) {
      const clickedRoute = routes.find((route, index) => 
        `route-${index}-layer` === features[0].layer.id
      );
      
      if (clickedRoute) {
        // Update selectedRoute only on click
        setSelectedRoute(clickedRoute);
        routes.forEach((route, index) => {
          const layerId = `route-${index}-layer`;
          if (map.current.getLayer(layerId)) {
            if (route === clickedRoute) {
              map.current.setPaintProperty(layerId, 'line-color', '#ff3b30');
              map.current.setPaintProperty(layerId, 'line-width', 4);
              map.current.setPaintProperty(layerId, 'line-opacity', 0.9);
            } else {
              map.current.setPaintProperty(layerId, 'line-color', '#ff0000');
              map.current.setPaintProperty(layerId, 'line-width', 3);
              map.current.setPaintProperty(layerId, 'line-opacity', 0.8);
            }
          }
        });
      }
    } else {
      // Optionally clear selection when clicking empty area
      setSelectedRoute(null);
      routes.forEach((_, index) => {
        const layerId = `route-${index}-layer`;
        if (map.current.getLayer(layerId)) {
          map.current.setPaintProperty(layerId, 'line-color', '#ff0000');
          map.current.setPaintProperty(layerId, 'line-width', 3);
          map.current.setPaintProperty(layerId, 'line-opacity', 0.8);
        }
      });
    }
  };

  map.current.on('mousemove', handleMouseMove);
  map.current.on('click', handleClick);

  return () => {
    if (map.current) {
      map.current.off('mousemove', handleMouseMove);
      map.current.off('click', handleClick);
    }
  };
}, [routes, selectedRoute]);

const buttonFunctions = {
  handleUploadGPX: () => {
    fileInputRef.current?.click();
  },

  processGPXFile: async (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      try {
        const text = await file.text();
        const parser = new DOMParser();
        const gpxDoc = parser.parseFromString(text, "text/xml");
        
        if (gpxDoc.documentElement.nodeName !== "gpx") {
          throw new Error(`Invalid GPX file format: ${file.name}`);
        }

        let trackPoints = gpxDoc.getElementsByTagName("trkpt");
        if (trackPoints.length === 0) {
          trackPoints = gpxDoc.getElementsByTagName("rtept");
        }
        if (trackPoints.length === 0) {
          trackPoints = gpxDoc.getElementsByTagName("wpt");
        }
        
        if (trackPoints.length === 0) {
          throw new Error(`No valid track points found in GPX file: ${file.name}`);
        }

        const name = gpxDoc.querySelector('trk > name, rte > name, metadata > name')?.textContent || file.name;
        const description = gpxDoc.querySelector('trk > desc, rte > desc, metadata > desc')?.textContent || 'No description';
        const time = gpxDoc.querySelector('trk > time, rte > time, metadata > time')?.textContent || new Date().toISOString();

        const routeCoordinates = Array.from(trackPoints).map(trkpt => {
          const lon = parseFloat(trkpt.getAttribute("lon"));
          const lat = parseFloat(trkpt.getAttribute("lat"));
          const ele = parseFloat(trkpt.querySelector('ele')?.textContent || '0');

          if (isNaN(lon) || isNaN(lat)) {
            throw new Error(`Invalid coordinate values found in file: ${file.name}`);
          }

          return [lon, lat, ele];
        });

        if (routeCoordinates.length === 0) {
          throw new Error(`No valid coordinates found in GPX file: ${file.name}`);
        }

        let totalDistance = 0;
        for (let i = 0; i < routeCoordinates.length - 1; i++) {
          totalDistance += calculateDistance(
            routeCoordinates[i][1], routeCoordinates[i][0],
            routeCoordinates[i + 1][1], routeCoordinates[i + 1][0]
          );
        }

        const elevations = routeCoordinates.map(coord => coord[2]);
        const maxElevation = Math.max(...elevations);
        const minElevation = Math.min(...elevations);
        const elevationGain = elevations.reduce((gain, ele, i) => {
          if (i === 0) return 0;
          const diff = ele - elevations[i - 1];
          return gain + (diff > 0 ? diff : 0);
        }, 0);

        // Use async/await with setState to ensure correct indexing
        await new Promise(resolve => {
          setRoutes(prev => {
            const newIndex = prev.length;
            const newGeoJSON = {
              id: `route-${newIndex}`,
              type: "Feature",
              properties: {
                name,
                description,
                time,
                fileName: file.name,
                stats: {
                  totalDistance: totalDistance.toFixed(2),
                  maxElevation: maxElevation.toFixed(0),
                  minElevation: minElevation.toFixed(0),
                  elevationGain: elevationGain.toFixed(0),
                  numberOfPoints: routeCoordinates.length
                }
              },
              geometry: {
                type: "LineString",
                coordinates: routeCoordinates
              }
            };

            // Add route to map with correct index
            if (map.current) {
              addRouteToMap(newGeoJSON, newIndex);
            }

            // Set as selected route if it's the first one
            if (prev.length === 0) {
              setSelectedRoute(newGeoJSON);
            }

            return [...prev, newGeoJSON];
          });
          resolve();
        });

        // Calculate bounds for all coordinates
        const bounds = new mapboxgl.LngLatBounds();
        routeCoordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });

        // Fit bounds for each file
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: {top: 50, bottom: 50, left: 50, right: 50},
            duration: 1000
          });
        }

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        alert(`Error processing file ${file.name}: ${error.message}`);
      }
    }
  },

  saveInDatabase: async () => {
    if (!selectedRoute) {
      setSaveStatus({
        type: 'error',
        message: 'Please select a route to save'
      });
      return;
    }
  
    try {
      const routeToSave = {
        type: "Feature",
        properties: {
          name: selectedRoute.properties.name,
          description: selectedRoute.properties.description || "No description",
          fileName: selectedRoute.properties.fileName,
          roadType: selectedRoute.properties.roadType || "Not yet defined",
          difficulty: selectedRoute.properties.difficulty || "Unknown",
          time: selectedRoute.properties.time,
          stats: selectedRoute.properties.stats,
          lastUpdated: new Date().toISOString()
        },
        geometry: selectedRoute.geometry,
        waypoints: selectedRoute.geometry.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0],
          elevation: coord[2] !== undefined ? coord[2] : 0
        }))
      };
  
      const response = await routeService.saveRoute(routeToSave);
  
      if (response.success) {
        setSaveStatus({
          type: 'success',
          message: `Route "${routeToSave.properties.name}" saved successfully!`,
          route: response.data
        });
  
        // Update routes list with saved route
        await fetchRoutes();

        const routeIndex = routes.findIndex(r => r._id === response.data._id);
      if (routeIndex !== -1) {
        const updatedRoute = transformRouteData(response.data);
        addRouteToMap(updatedRoute, routeIndex);
      }
      } else {
        throw new Error(response.message || 'Failed to save route');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus({
        type: 'error',
        message: error.message || 'Failed to save route'
      });
    }
  },
  
  splitRouteIntoChunks: (route, chunkDistanceKm = 5) => {
    if (!route?.geometry?.coordinates || route.geometry.coordinates.length < 2) {
      throw new Error('Invalid route data');
    }

    const chunks = [];
    let currentChunk = [route.geometry.coordinates[0]];
    let chunkDistance = 0;

    for (let i = 1; i < route.geometry.coordinates.length; i++) {
      const prevPoint = route.geometry.coordinates[i - 1];
      const currentPoint = route.geometry.coordinates[i];
      
      const segmentDistance = calculateDistance(
        prevPoint[1], prevPoint[0],
        currentPoint[1], currentPoint[0]
      );
      
      chunkDistance += segmentDistance;
      currentChunk.push(currentPoint);

      if (chunkDistance >= chunkDistanceKm || i === route.geometry.coordinates.length - 1) {
        chunks.push({
          type: "Feature",
          properties: {
            ...route.properties,
            name: `${route.properties.name} - Chunk ${chunks.length + 1}`,
            chunkIndex: chunks.length,
            stats: {
              ...route.properties.stats,
              totalDistance: chunkDistance.toFixed(2),
            }
          },
          geometry: {
            type: "LineString",
            coordinates: currentChunk
          }
        });
        
        currentChunk = [currentPoint];
        chunkDistance = 0;
      }
    }

    return chunks;
  },

  splitSelectedLine: function(chunkSize = 5) {
    if (!selectedRoute) {
      alert('Please select a route to split');
      return;
    }
  
    try {
      const chunks = this.splitRouteIntoChunks(selectedRoute, chunkSize);
      
      // Remove original route
      const sourceId = `route-${routes.findIndex(r => r.id === selectedRoute.id)}`;
      if (map.current.getSource(sourceId)) {
        const layerId = `${sourceId}-layer`;
        const outlineLayerId = `${sourceId}-outline`;
        if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
      }

      // Add chunks as new routes
      setRoutes(prevRoutes => {
        const filteredRoutes = prevRoutes.filter(r => r.id !== selectedRoute.id);
        const newRoutes = [...filteredRoutes, ...chunks];
        
        // Add new chunks to map
        chunks.forEach((chunk, index) => {
          addRouteToMap(chunk, filteredRoutes.length + index);
        });
        
        return newRoutes;
      });

      setSelectedRoute(chunks[0]);
    } catch (error) {
      console.error('Error splitting route:', error);
      alert('Error splitting route: ' + error.message);
    }
  },
  // Add to buttonFunctions object
  splitRouteAtPoint: () => {
    if (!selectedRoute) {
      alert('Please select a route to split');
      return;
    }

    setIsSplitting(true);
    map.current.getCanvas().style.cursor = 'crosshair';

    const handleSplitClick = (e) => {
      const clickedPoint = map.current.unproject(e.point);
      const coordinates = selectedRoute.geometry.coordinates;
      
      // Find closest point
      let minDistance = Infinity;
      let splitIndex = 0;
      
      coordinates.forEach((coord, index) => {
        const distance = calculateDistance(
          clickedPoint.lat,
          clickedPoint.lng,
          coord[1],
          coord[0]
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          splitIndex = index;
        }
      });

      // Create two new routes
      const route1 = {
        ...selectedRoute,
        id: `split-1-${Date.now()}`,
        properties: {
          ...selectedRoute.properties,
          name: `${selectedRoute.properties.name} - Part 1`
        },
        geometry: {
          type: "LineString",
          coordinates: coordinates.slice(0, splitIndex + 1)
        }
      };

      const route2 = {
        ...selectedRoute,
        id: `split-2-${Date.now()}`,
        properties: {
          ...selectedRoute.properties,
          name: `${selectedRoute.properties.name} - Part 2`
        },
        geometry: {
          type: "LineString",
          coordinates: coordinates.slice(splitIndex)
        }
      };

      // Remove old route and add new routes
      setRoutes(prevRoutes => {
        const newRoutes = prevRoutes.filter(r => r.id !== selectedRoute.id);
        return [...newRoutes, route1, route2];
      });

      // Clean up the map
      const routeIndex = routes.findIndex(r => r.id === selectedRoute.id);
      const sourceId = `route-${routeIndex}`;
      
      if (map.current.getSource(sourceId)) {
        const layerId = `${sourceId}-layer`;
        const outlineLayerId = `${sourceId}-outline`;
        if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        map.current.removeSource(sourceId);
      }

      // Add new routes to map
      addRouteToMap(route1, routes.length);
      addRouteToMap(route2, routes.length + 1);

      // Reset splitting state
      setIsSplitting(false);
      map.current.getCanvas().style.cursor = '';
      map.current.off('click', handleSplitClick);
      setSelectedRoute(route1);
    };

    // Add click handler
    map.current.on('click', handleSplitClick);

    // Add ESC key handler
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        setIsSplitting(false);
        map.current.off('click', handleSplitClick);
        map.current.getCanvas().style.cursor = '';
        document.removeEventListener('keydown', escHandler);
      }
    };

    document.addEventListener('keydown', escHandler);
  }
};

const handleClearNotification = () => {
  setSaveStatus(null);
};

  return (
    <div className="min-h-screen flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".gpx"
        multiple
        onChange={(e) => {
          if (e.target.files?.length > 0) {
            buttonFunctions.processGPXFile(e.target.files);
          }
        }}
      />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl text-[#436485]">ADVENTUROADS</span>
          </div>
          <nav className="flex space-x-6">
            <a href="/" className="text-[#436485]">HOME</a>
            <a href="/contact" className="text-[#436485]">CONTACT</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        <LeftSidebar 
          routes={routes}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
          setRoutes={setRoutes}
        />

        {/* Main Map Area */}
        <div className="flex-1 flex flex-col">
          {/* Control Panel */}
          <div className="bg-[#4B8BF4] text-white p-2 flex justify-between items-center">
            <div className="flex space-x-2">
            <button 
              onClick={buttonFunctions.handleUploadGPX}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center"
            >
              ⬆️ Upload GPX
            </button>
            <button 
              onClick={buttonFunctions.saveInDatabase}
              disabled={!selectedRoute}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center ${
              !selectedRoute ? 'opacity-50 cursor-not-allowed' : ''
             }`}
            >
              SAVE IN DATABASE
            </button>
              
            <button 
              onClick={() => setIsSplitDialogOpen(true)}
              disabled={!selectedRoute}
              className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm ${
                !selectedRoute ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
               Split Selected Line to Chunks
            </button>

            <button 
             onClick={buttonFunctions.splitRouteAtPoint}
             disabled={!selectedRoute}
             className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm ${
             !selectedRoute ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            >
             Split Selected Line at Clicked Point
            </button>
            </div>

            {/* Map style selector */}
            <div className="relative">
              <button 
                onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm flex items-center"
              >
                Base Map ▼
              </button>
              {isStyleMenuOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded shadow-lg z-50">
                  <button
                    onClick={() => handleChangeMapStyle('satellite')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => handleChangeMapStyle('streets')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    Streets
                  </button>
                  <button
                    onClick={() => handleChangeMapStyle('satelliteStreets')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                  >
                    Satellite with Streets
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Map container */}
          <div 
            ref={mapContainer} 
            className="h-[calc(100vh-8rem)] flex-1"
          />
        </div>
        
      </div>
    <div className="min-h-screen flex flex-col relative">
    <SaveNotification 
      status={saveStatus}
      onClose={handleClearNotification}
    />
    <SplitRouteDialog
      isOpen={isSplitDialogOpen}
      onClose={() => setIsSplitDialogOpen(false)}
      onConfirm={(chunkSize) => {
        buttonFunctions.splitSelectedLine(chunkSize);
        setIsSplitDialogOpen(false);
      }}
    />
    <div>
      <AdminCommentsView />
    </div>
  </div>
  
  </div>
    
  );
};

export default AdminDashboard;
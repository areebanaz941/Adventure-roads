import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import ElevationChart from '../ElevationChart';
import LeftSidebar from '../LeftSidebar';
import { routeService } from '../services/routeService';
// Add to imports at the top
import SaveNotification from '../SaveNotification';

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

  
  const addRouteToMap = (geoJSON, index) => {
    const sourceId = `route-${index}`;
    const layerId = `${sourceId}-layer`;

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId);
      map.current.removeSource(sourceId);
    }

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: geoJSON
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': [
          'case',
          ['==', ['get', 'hover'], true], '#ff0000',
          ['==', ['get', 'selected'], true], '#ff8800',
          '#ff0000'
        ],
        'line-width': [
          'case',
          ['==', ['get', 'hover'], true], 5,
          ['==', ['get', 'selected'], true], 4,
          3
        ],
        'line-opacity': [
          'case',
          ['==', ['get', 'hover'], true], 1,
          ['==', ['get', 'selected'], true], 0.9,
          0.8
        ]
      }
    });
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
      top: 80px;
      right: 10px;
      background: rgba(0, 0, 0, 0.75);
      border-radius: 4px;
      overflow: hidden;
      padding: 4px;
      gap: 4px;
      display: flex;
      flex-direction: column;
    }
    .custom-control-button {
      width: 30px;
      height: 30px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      transition: all 0.2s;
    }
    .custom-control-button:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .custom-control-button svg {
      width: 16px;
      height: 16px;
      fill: white;
      stroke: white;
    }
    .custom-control-separator {
      height: 1px;
      background: rgba(255, 255, 255, 0.2);
      margin: 4px 0;
    }
  `;
  document.head.appendChild(style);

  const buttons = [
    {
      icon: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>`,
      onClick: () => map.zoomIn(),
      title: 'Zoom in'
    },
    {
      icon: `<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14z"/></svg>`,
      onClick: () => map.zoomOut(),
      title: 'Zoom out'
    },
    'separator',
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
    if (map.current) {
      map.current.setStyle(MAP_STYLES[style]);
      setCurrentStyle(style);
      setIsStyleMenuOpen(false);
    }
  };

  // Map Initialization
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
      new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }),
      'bottom-right'
    );
  }, []);

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
        // Only update visual styles on hover, don't set selectedRoute
        routes.forEach((_, index) => {
          const layerId = `route-${index}-layer`;
          if (map.current.getLayer(layerId)) {
            if (layerId === features[0].layer.id) {
              map.current.setPaintProperty(layerId, 'line-color', '#ff3b30');
              map.current.setPaintProperty(layerId, 'line-width', 5);
              map.current.setPaintProperty(layerId, 'line-opacity', 1);
            } else {
              map.current.setPaintProperty(layerId, 'line-color', '#ff0000');
              map.current.setPaintProperty(layerId, 'line-width', 3);
              map.current.setPaintProperty(layerId, 'line-opacity', 0.6);
            }
          }
        });
      }
    } else {
      map.current.getCanvas().style.cursor = '';
      // Reset styles for non-selected routes
      routes.forEach((route, index) => {
        const layerId = `route-${index}-layer`;
        if (map.current.getLayer(layerId)) {
          // Keep selected route highlighted
          if (route === selectedRoute) {
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
      // Prepare route data with [longitude, latitude, elevation] for waypoints
      const routeToSave = {
        type: "Feature",
        properties: {
          name: selectedRoute.properties.name,
          description: selectedRoute.properties.description || "No description",
          fileName: selectedRoute.properties.fileName,
          roadType: selectedRoute.properties.roadType || "Tar/Sealed Road",
          difficulty: selectedRoute.properties.difficulty || "Unknown",
          time: selectedRoute.properties.time,
          stats: {
            totalDistance: Number(selectedRoute.properties.stats.totalDistance),
            maxElevation: Number(selectedRoute.properties.stats.maxElevation),
            minElevation: Number(selectedRoute.properties.stats.minElevation),
            elevationGain: Number(selectedRoute.properties.stats.elevationGain),
            numberOfPoints: Number(selectedRoute.properties.stats.numberOfPoints)
          }
        },
        geometry: {
          type: "LineString",
          coordinates: selectedRoute.geometry.coordinates.map(coord => [
            Number(coord[0]), // longitude
            Number(coord[1]), // latitude
            coord[2] !== undefined ? Number(coord[2]) : 0 // elevation, default to 0 if missing
          ])
        },
        waypoints: selectedRoute.geometry.coordinates.map(coord => ({
          latitude: coord[1],   // lat
          longitude: coord[0],  // lon
          elevation: coord[2] !== undefined ? coord[2] : 0 // Elevation, default to 0
        }))
      };

      const response = await routeService.saveRoute(routeToSave);

      if (response.success) {
        setSaveStatus({
          type: 'success',
          message: `Route "${routeToSave.properties.name}" saved successfully!`,
          route: response.data
        });

        // Update the routes list with the saved route
        setRoutes(prevRoutes => 
          prevRoutes.map(route => 
            route.id === selectedRoute.id ? { ...route, _id: response.data._id } : route
          )
        );

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
              
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Split Selected Line to Chunks
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Split Selected Line at Clicked Point
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">
                Calculate Route Between
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
  </div>
  </div>
    
  );
};

export default AdminDashboard;
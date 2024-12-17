import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import UsingTheMap from '../UsingTheMap';
import routeService from '../services/routeService';
import RouteInfo from '../Map/userRouteInfo';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MAP_STYLES = {
 satellite: 'mapbox://styles/mapbox/satellite-v9',
 streets: 'mapbox://styles/mapbox/streets-v12',
 satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12',
};

const ROUTE_COLORS = {
 'Sealed Road': '#808080',
  'Gravel/Dirt Road': '#f59e0b',
  'Track/Trail': '#8b4513',
  'Sand': '#fde047',
  'Not Yet Defined': '#d9f99d'
};

// Add popup styles
const style = document.createElement('style');
style.textContent = `
 .mapboxgl-popup-content {
   padding: 0;
   border-radius: 8px;
 }
 .mapboxgl-popup-close-button {
   padding: 4px 8px;
   color: #666;
 }
`;
document.head.appendChild(style);

const UserMap = () => {
 const mapContainer = useRef(null);
 const map = useRef(null);
 const [currentStyle, setCurrentStyle] = useState('satellite');
 const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
 const [routes, setRoutes] = useState([]);
 const [selectedRoutes, setSelectedRoutes] = useState([]);
 const [isRouteInfoExpanded, setIsRouteInfoExpanded] = useState(true);
 const [popup, setPopup] = useState(null);
 const [currentRouteIndex, setCurrentRouteIndex] = useState(0);


 const getTotalDistance = () => {
  return selectedRoutes.reduce((total, route) => {
    return total + (route.properties.stats?.totalDistance || 0);
  }, 0).toFixed(1);
};

const handleExportGPX = () => {
  if (selectedRoutes.length === 0) return;
  
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Your App Name"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  ${selectedRoutes.map(route => `
  <trk>
    <name>${route.properties.name || 'Unnamed Route'}</name>
    <desc>${route.properties.description || ''}</desc>
    <trkseg>
      ${route.geometry.coordinates
        .map(coord => `
      <trkpt lat="${coord[1]}" lon="${coord[0]}">
        <ele>${coord[2] || 0}</ele>
      </trkpt>`).join('')}
    </trkseg>
  </trk>`).join('\n')}
</gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_routes.gpx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleExportKML = () => {
  if (selectedRoutes.length === 0) return;

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Selected Routes</name>
    ${selectedRoutes.map(route => `
    <Placemark>
      <name>${route.properties.name || 'Unnamed Route'}</name>
      <description>${route.properties.description || ''}</description>
      <Style>
        <LineStyle>
          <color>ff0000ff</color>
          <width>4</width>
        </LineStyle>
      </Style>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          ${route.geometry.coordinates
            .map(coord => `${coord[0]},${coord[1]},${coord[2] || 0}`).join(' ')}
        </coordinates>
      </LineString>
    </Placemark>`).join('\n')}
  </Document>
</kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'selected_routes.kml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
const createHelpDialog = () => {
  const dialog = document.createElement('div');
  dialog.className = 'help-dialog';
  dialog.innerHTML = `
    <div class="help-content">
      <h2 class="help-title">Help</h2>
      <div class="help-items">
        <p>- Clicking on more lines will add them to selection. Click on a line again to deselect it.</p>
        <p>- Click on the Deselect All button to start fresh.</p>
        <p>- Once selection is done click Export button</p>
      </div>
      <button class="help-ok-button">OK</button>
    </div>
  `;

  document.head.appendChild(style);
// Add click handler for OK button
const okButton = dialog.querySelector('.help-ok-button');
okButton.onclick = () => {
  document.body.removeChild(dialog);
};

return dialog;
};
const showNextRoute = () => {
  if (currentRouteIndex < selectedRoutes.length - 1) {
    setCurrentRouteIndex(currentRouteIndex + 1);
  }
};

const showPreviousRoute = () => {
  if (currentRouteIndex > 0) {
    setCurrentRouteIndex(currentRouteIndex - 1);
  }
};
const handleHelp = () => {
  const helpDialog = createHelpDialog();
  document.body.appendChild(helpDialog);
 };

 const handleDeselectAll = () => {
  setSelectedRoutes([]);
  if (popup) {
    popup.remove();
    setPopup(null);
  }
};

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

  map.current.on('style.load', () => {
    map.current.setFog({
      color: 'rgb(0, 0, 0)',
      'high-color': 'rgb(20, 20, 40)',
      'horizon-blend': 0.2
    });
    // Add a small delay to ensure the style is fully loaded
    setTimeout(() => {
      routes.forEach((route, index) => addRouteToMap(route, index));
    }, 100);
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
}, []);  // Remove routes from dependency array to prevent infinite loop

const fetchRoutes = async () => {
  try {
    console.log('Fetching routes...'); // Debug log
    const response = await routeService.getAllRoutes();
    console.log('Service Response:', response); // Debug log

    if (!response.success) {
      console.error('Failed to fetch routes:', response.message);
      return;
    }

    if (!response.data?.data) {
      console.error('Invalid response format');
      return;
    }

    const routesData = response.data.data;

    // Clear existing routes
    if (map.current) {
      routes.forEach((_, index) => {
        const sourceId = `route-${index}`;
        const layerId = `${sourceId}-layer`;
        const outlineLayerId = `${sourceId}-outline`;

        if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
        if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
        if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
      });
    }

    // Wait for map style to be loaded before adding routes
    if (map.current) {
      if (map.current.isStyleLoaded()) {
        setRoutes(routesData);
        routesData.forEach((route, index) => {
          console.log(`Adding route ${index}:`, route);
          addRouteToMap(route, index);
        });
      } else {
        map.current.once('style.load', () => {
          setRoutes(routesData);
          routesData.forEach((route, index) => {
            console.log(`Adding route ${index}:`, route);
            addRouteToMap(route, index);
          });
        });
      }
    }
  } catch (error) {
    console.error('Error in fetchRoutes:', error);
  }
};

 // Add a polling mechanism to check for updates (optional)
useEffect(() => {
  const pollInterval = setInterval(fetchRoutes, 600000); // Poll every 60 seconds

  return () => clearInterval(pollInterval);
}, []);

const transformRouteData = (routeData) => ({
  ...routeData,
  properties: {
    ...routeData.properties,
    roadType: routeData.properties.roadType || 'Not Yet Defined',
    description: routeData.properties.description || '',
  },
  id: routeData._id,
});

 // Update the addRouteToMap function in UserMap.js
 const addRouteToMap = (route, index) => {
  console.log(`Adding route ${index} to map:`, route); // Debug log

  if (!map.current || !route?.geometry?.coordinates) {
    console.log('Map or coordinates not available:', {
      mapExists: !!map.current,
      coordinates: route?.geometry?.coordinates
    });
    return;
  }

  const sourceId = `route-${index}`;
  const layerId = `${sourceId}-layer`;
  const outlineLayerId = `${sourceId}-outline`;

  try {
    // Remove existing layers if they exist
    if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

    // Add source
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: route.geometry,
        properties: route.properties
      }
    });

    console.log(`Added source ${sourceId}`); // Debug log

    const isSelected = selectedRoutes.some(r => r.id === route.id);

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
        'line-width': isSelected ? 6 : 5,
        'line-opacity': 0.5
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
        'line-color': ROUTE_COLORS[route.properties.roadType] || ROUTE_COLORS['Not Yet Defined'],
        'line-width': isSelected ? 4 : 3,
        'line-opacity': isSelected ? 1 : 0.8
      }
    });

    console.log(`Added layers for route ${index}`); // Debug log
  } catch (error) {
    console.error(`Error adding route ${index} to map:`, error);
  }
};

 const addPopup = (route, coordinates) => {
  if (popup) {
    popup.remove();
  }

  const newPopup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    className: 'custom-popup',
    maxWidth: '300px'
  })
    .setLngLat(coordinates)
    .setHTML(`
      <div class="bg-white rounded shadow-lg">
        <div class="p-3 border-b flex justify-between items-center">
          <h3 class="font-medium text-gray-900">${route.properties.name || 'Unnamed Route'}</h3>
          <button class="mapboxgl-popup-close-button text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div class="p-3">
          <div class="mb-2">
            <strong class="text-gray-700">Type:</strong> ${route.properties.roadType}
          </div>
          ${route.properties.description ? 
            `<div class="mb-2">
              <strong class="text-gray-700">Description:</strong><br/>
              ${route.properties.description}
            </div>` : ''
          }
          <div>
            <strong class="text-gray-700">Total Distance:</strong> ${route.properties.stats?.totalDistance || 0} km
          </div>
        </div>
      </div>
    `)
    .addTo(map.current);

  setPopup(newPopup);
};


document.head.appendChild(style);

 useEffect(() => {
   if (!map.current) return;
 
   const handleMouseMove = (e) => {
     const features = map.current.queryRenderedFeatures(e.point, {
       layers: routes.map((_, index) => [
         `route-${index}-layer`,
         `route-${index}-outline`
       ]).flat()
     });
 
     if (features.length > 0) {
       map.current.getCanvas().style.cursor = 'pointer';
       const hoveredRoute = routes.find((route, index) => 
         [`route-${index}-layer`, `route-${index}-outline`].includes(features[0].layer.id)
       );
       
       if (hoveredRoute) {
         routes.forEach((route, index) => {
           const layerId = `route-${index}-layer`;
           const outlineLayerId = `route-${index}-outline`;
           
           if (map.current.getLayer(layerId)) {
             if (route.id === hoveredRoute.id) {
               map.current.setPaintProperty(outlineLayerId, 'line-width', 7);
               map.current.setPaintProperty(layerId, 'line-width', 5);
               map.current.setPaintProperty(layerId, 'line-opacity', 1);
             } else {
               map.current.setPaintProperty(outlineLayerId, 'line-width', 5);
               map.current.setPaintProperty(layerId, 'line-width', 3);
               map.current.setPaintProperty(layerId, 'line-opacity', 0.6);
             }
           }
         });
       }
     } else {
       map.current.getCanvas().style.cursor = '';
       routes.forEach((route, index) => {
         const layerId = `route-${index}-layer`;
         const outlineLayerId = `route-${index}-outline`;
         
         if (map.current.getLayer(layerId)) {
          if (selectedRoutes.some(r => r.id === route.id)) {
            map.current.setPaintProperty(outlineLayerId, 'line-width', 6);
            map.current.setPaintProperty(layerId, 'line-width', 4);
            map.current.setPaintProperty(layerId, 'line-opacity', 0.9);
          } else {
            map.current.setPaintProperty(outlineLayerId, 'line-width', 5);
            map.current.setPaintProperty(layerId, 'line-width', 3);
            map.current.setPaintProperty(layerId, 'line-opacity', 0.8);
          }
         }
       });
     }
   };
 
   // Update click handler
   const handleClick = (e) => {
    const features = map.current.queryRenderedFeatures(e.point, {
      layers: routes.map((_, index) => [
        `route-${index}-layer`,
        `route-${index}-outline`
      ]).flat()
    });
  
    if (features.length > 0) {
      const clickedRoute = routes.find((route, index) => 
        [`route-${index}-layer`, `route-${index}-outline`].includes(features[0].layer.id)
      );
      
      if (clickedRoute) {
        const isAlreadySelected = selectedRoutes.some(r => r.id === clickedRoute.id);
        
        if (isAlreadySelected) {
          // Remove from selection
          setSelectedRoutes(prev => prev.filter(r => r.id !== clickedRoute.id));
        } else {
          // Add to selection
          setSelectedRoutes(prev => [...prev, clickedRoute]);
        }
        
        // Update route styling
        routes.forEach((route, index) => {
          const layerId = `route-${index}-layer`;
          const outlineLayerId = `route-${index}-outline`;
          
          if (map.current.getLayer(layerId)) {
            const isSelected = route.id === clickedRoute.id ? !isAlreadySelected : 
                             selectedRoutes.some(r => r.id === route.id);
            
            map.current.setPaintProperty(outlineLayerId, 'line-width', isSelected ? 6 : 5);
            map.current.setPaintProperty(layerId, 'line-width', isSelected ? 4 : 3);
            map.current.setPaintProperty(layerId, 'line-opacity', isSelected ? 1 : 0.8);
          }
        });
  
        addPopup(clickedRoute, e.lngLat);
      }
  }
}
   map.current.on('mousemove', handleMouseMove);
   map.current.on('click', handleClick);
 
   return () => {
     if (map.current) {
       map.current.off('mousemove', handleMouseMove);
       map.current.off('click', handleClick);
     }
     if (popup) {
       popup.remove();
     }
   };
 }, [routes, selectedRoutes, popup]);

 const handleRouteClick = (route, e) => {
  const isAlreadySelected = selectedRoutes.some(r => r.id === route.id);
  
  if (isAlreadySelected) {
    // Deselect the route
    setSelectedRoutes(selectedRoutes.filter(r => r.id !== route.id));
  } else {
    // Add to selection
    setSelectedRoutes([...selectedRoutes, route]);
  }
  
  addPopup(route, e.lngLat);
};

const changeMapStyle = (style) => {
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
           {selectedRoutes.length > 0 ? (
         <>
         {selectedRoutes.map(route => (
           <RouteInfo key={route.id} route={route} />
          ))}
       </>
     ) : (
       <p className="text-gray-900">Select routes to see details...</p>
         )}
       </div>
      </div>  
         <div className="flex-1">
           <div className="bg-[#4B8BF4] p-2 flex justify-between items-center">
             <div className="flex space-x-2">
              <button onClick={handleExportGPX} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">⬇ Export to GPX</button>
              <button onClick={handleExportKML} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">⬇ Export to KML</button>
              <button onClick={handleHelp} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">? Help</button>
              <button onClick={handleDeselectAll} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">× Deselect All</button>
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
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
 'Tar/Sealed Road': '#808080',
 'Gravel Road': '#FFA500', 
 'Dirt Track': '#8B4513',
 'Off Road': '#FFD700',
 'Mixed Road': '#90EE90',
 'Not Yet Defined': '#FF69B4'
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
 const [selectedRoute, setSelectedRoute] = useState(null);
 const [isRouteInfoExpanded, setIsRouteInfoExpanded] = useState(true);
 const [popup, setPopup] = useState(null);
 
// Add these functions near the top of your component
const handleExportGPX = () => {
  if (!selectedRoute) return;
  
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>
 <gpx version="1.1">
  <trk>
    <name>${selectedRoute.properties.name}</name>
    <desc>${selectedRoute.properties.notes}</desc>
    <trkseg>
      ${selectedRoute.geometry.coordinates
        .map(coord => `<trkpt lat="${coord[1]}" lon="${coord[0]}">
        <ele>${coord[2] || 0}</ele>
      </trkpt>`).join('\n')}
    </trkseg>
  </trk>
 </gpx>`;

  const blob = new Blob([gpx], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedRoute.properties.name || 'route'}.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const handleExportKML = () => {
  if (!selectedRoute) return;

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
 <kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${selectedRoute.properties.name}</name>
    <description>${selectedRoute.properties.notes}</description>
    <Placemark>
      <LineString>
        <coordinates>
          ${selectedRoute.geometry.coordinates
            .map(coord => `${coord[0]},${coord[1]},${coord[2] || 0}`).join(' ')}
        </coordinates>
      </LineString>
    </Placemark>
  </Document>
 </kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedRoute.properties.name || 'route'}.kml`;
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

const handleHelp = () => {
  const helpDialog = createHelpDialog();
  document.body.appendChild(helpDialog);
 };

const handleDeselectAll = () => {
  setSelectedRoute(null);
  if (popup) {
    popup.remove();
    setPopup(null);
  }
};


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
     if (!response.success) {
       throw new Error(response.message);
     }

     if (!Array.isArray(response.data.data)) {
       throw new Error("Expected an array of routes");
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
   id: routeData._id,
 });

 const addRouteToMap = (route, index) => {
   if (!map.current || !route?.geometry?.coordinates) return;
 
   const sourceId = `route-${index}`;
   const layerId = `${sourceId}-layer`;
   const outlineLayerId = `${sourceId}-outline`;
 
   if (map.current.getLayer(outlineLayerId)) map.current.removeLayer(outlineLayerId);
   if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
   if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);
 
   map.current.addSource(sourceId, {
     type: 'geojson',
     data: route
   });
 
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
       'line-opacity': 0.5
     }
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
       'line-color': ROUTE_COLORS[route.properties.roadType] || ROUTE_COLORS['Not Yet Defined'],
       'line-width': selectedRoute?.id === route.id ? 4 : 3,
       'line-opacity': 1
     }
   });
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
          ${route.properties.notes ? 
            `<div class="mb-2">
              <strong class="text-gray-700">Notes:</strong><br/>
              ${route.properties.notes}
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
           if (route.id === selectedRoute?.id) {
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
         setSelectedRoute(clickedRoute);
         addPopup(clickedRoute, e.lngLat);
       }
     } else {
       setSelectedRoute(null);
       if (popup) {
         popup.remove();
         setPopup(null);
       }
     }
   };
 
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
 }, [routes, selectedRoute, popup]);

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
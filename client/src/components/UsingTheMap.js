// src/components/UsingTheMap.js
const UsingTheMap = () => {
    return (
      <section className="bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Using The Map</h2>
          
          <div className="space-y-6 text-gray-700">
            <p>
              One way to use this map is as a guide to find the kind of riding you want and create your own plan or GPX files (using other apps/software).
            </p>
  
            <p>
              The other way is to select all of the sections you want to make a ride. Select sections by clicking on them one at a time. Click one again if you wish to deselect it. Use the Deselect All button to start fresh. Then press the Export to GPX button. This will download a folder with each section of the route as a GPX file, which you can then save to your relevant software account or device e.g. Gaia GPS, Garmin Basecamp.
            </p>
  
            <p>
              A third option could be to use the site on your mobile while on a ride (when in service) to help you choose or remember the best routes. There is currently no app version but the mobile site works fairly well.
            </p>
  
            <div>
              <strong className="text-gray-900">Route Info</strong> panel will automatically display on the left (bottom on mobile). It can be hidden by clicking the minimise button. If you select a section on the map it's info will appear in this panel along with elevation and length. You can select multiple sections at once - it will show total distance and only the elevation of the last section.
            </div>
  
            <p>
              You may find that for your preferred route there are no selectable sections between some areas. That may mean that you should just jump on the obvious main road for that section as there is no interesting/unsealed route (or maybe it hasn't been added yet). You may also find that you need to take a different route between some sections to connect them up, eg if there is a road closure or wet weather.
            </p>
  
            <p>
              There is also the <strong className="text-gray-900">Export to KML</strong> option for downloading selected sections in KML file format, which is compatible with Google Maps/Earth (but not super easy to figure out). One feature of this is that it will preserve the line colours.
            </p>
  
            <p>
              There are also <strong className="text-gray-900">points of interest</strong> that show on the map when you zoom in on a general area. These include the all important pubs to stay in, fuel stops etc.
            </p>
  
            <p>
              The <strong className="text-gray-900">Base Map</strong> button can be used to switch to satellite view.
            </p>
  
            <p>
              The <strong className="text-gray-900">Ruler</strong> tool can be used to measure a distance over multiple points to get a rough idea of KMs.
            </p>
          </div>
        </div>
      </section>
    );
  };
  
  export default UsingTheMap;
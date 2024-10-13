/* With this code, Landsat Surface Temperature was calculated. Again, some free and open data code snippets were used from Sean McCartney: 
ARSET Training: Satellite Remote Sensing for Measuring Urban Heat Islands and Constructing Heat Vulnerability Indices
August 2, 2022 - August 11, 2022
*/

var landsat_bands = ['ST_B10', 'QA_PIXEL']; // this is the thermal band needed for ST 
var landsat_collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') // Level 2 because this is already preprocessed to a degree
  .select(landsat_bands) 
  .map(cloud_check); 
var filtered_L8 = landsat_collection.filter(ee.Filter.lt('CLOUD_COVER', 20)); // Filter by cloud cover

var subdistricts = ee.FeatureCollection('projects/ee-skardelly3/assets/ZAEHLBEZIRKOGDPolygon'); // here, upload the asset 
Map.centerObject(subdistricts); // Center the map on the study area (optional)

var period = [
  {from: '2013-07-01', to: '2013-08-31'},
  {from: '2014-07-01', to: '2014-08-31'},
  {from: '2015-07-01', to: '2015-08-31'},
  {from: '2016-07-01', to: '2016-08-31'},
  {from: '2017-07-01', to: '2017-08-31'},
  {from: '2018-07-01', to: '2018-08-31'},
  {from: '2019-07-01', to: '2019-08-31'},
  {from: '2020-07-01', to: '2020-08-31'},
  {from: '2021-07-01', to: '2021-08-31'},
  {from: '2022-07-01', to: '2022-08-31'},
  {from: '2023-07-01', to: '2023-08-31'},
  {from: '2024-07-01', to: '2024-08-31'}
]; // I did it like this as I thought I might have to adjust for some years the time range due to quality reasons


// Here, again the quality of the picture is assessed (in terms of clouds)
function cloud_check(picture) {
  var quality = picture.select('QA_PIXEL');
  var check = quality.bitwiseAnd(1 << 3) // checks for clouds bit 3
    .or(quality.bitwiseAnd(1 << 4)); // Bit 4 checks for so called cloud shadows
  return picture.updateMask(check.not()); // in case true -> removes clouds and shadows
}

function scaling(picture) {
  var thermal_bands = picture.select('ST_B10')
    .multiply(0.00341802) // Kevin scale 
    .add(149.0) // Kelvin offset
    .subtract(273.15) // convert to Celsius
    .rename('LST_Celsius');
  return picture.addBands(thermal_bands, null, true);
}

// To calculate the mean LST for each feature and period
var calculate_ST = function(feature, startDate, endDate) {
  var filtered = landsat_collection.filterBounds(feature.geometry())
    .filterDate(startDate, endDate)
    .map(scaling); 
  
  var mean_ST = filtered.select('LST_Celsius').mean(); 
    var lst = mean_ST.reduceRegion({   // reduce region to one value
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30, 
    maxPixels: 1e9
  });
  
  return feature.set(lst).set('startDate', startDate).set('endDate', endDate);
};

var results = ee.FeatureCollection(subdistricts.map(function(feature) {
  var subdistrict = feature.getString('ZBEZ'); 
  var results_feature = period.map(function(range) {
    var LST = calculate_ST(feature, range.from, range.to);
    return LST.set('subdistrict', subdistrict);
  });
  return ee.FeatureCollection(results_feature);
}).flatten());

Export.table.toDrive({
  collection: results,
  description: 'LST_2024',
  fileFormat: 'CSV'
});

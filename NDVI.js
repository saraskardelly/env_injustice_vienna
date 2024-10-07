// Here, I calculated by NDVI values.
// Literature:
// The following code sample was inspired by the tutorial: NDVI, Mapping a Function over a Collection, Quality Mosaicking
// It is available at: https://developers.google.com/earth-engine/tutorials/tutorial_api_06
// With this license: Apache 2.0 License and Creative Commons Attribution 4.0 License

// Then here, I took the code for the reduceRegion and scale: 
// It is available at: https://developers.google.com/earth-engine/apidocs/ee-image-reduceregion
// With this license: Apache 2.0 License and Creative Commons Attribution 4.0 License

// i imported here the landsat dataset with its images- bands and features
var landsat_images = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA'); 

//I imported my collection with the shapefile- (FYI: contains also the area,which i double checked with the pixels)
var subdistrict_info = ee.FeatureCollection('projects/ee-skardelly3/assets/ZAEHLBEZIRKOGDPolygon'); 

//took these from the free and open code above, see literature. I made a function ,as i do have several areas of interest
var calculate_ndvi = function(image) {
  var nir = image.select('B5');
  var red = image.select('B4');
  var ndvi = nir.subtract(red).divide(nir.add(red)).rename('NDVI');
  return image.addBands(ndvi);
};

//Here , i defined my periods of interests. I went for this long solutions, as I made for a year an exception and extended the time frame
var time_period = [
  {start: '2013-06-01', end: '2013-07-31'},
  {start: '2014-06-01', end: '2014-07-31'},
  {start: '2015-06-01', end: '2015-07-31'},
  {start: '2016-06-01', end: '2016-07-31'},
  {start: '2017-05-01', end: '2017-08-31'},
  {start: '2018-06-01', end: '2018-07-31'},
  {start: '2019-06-01', end: '2019-07-31'},
  {start: '2020-06-01', end: '2020-07-31'}
];

//Next, I created the filter function - as i want to filter the pixel for an area aka my subdistricts, and time periods
//here basically it filters for the given filter for the least cloudy picture
var calculate_filter = function(feature, startDate, endDate) {
  var filtered = landsat_images.filterBounds(feature.geometry())
                   .filterDate(startDate, endDate)
                   .sort('CLOUD_COVER')
                   .map(calculate_ndvi)
                   .first(); // this may be controversial - but it is the same way proposed in the tutorial (see literature) and in my opinion returns the highest quality for a "short study period" - of coure not, if the study time frame would be longer
  
  //in this function, it basically sets the right scale and then out of this pixels takes the mean
  var ndvi = filtered.select('NDVI').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: feature.geometry(),
    scale: 30
  });
  return feature.set(ndvi).set('startDate', startDate).set('endDate', endDate);
};

//here basically it runs it over for all my subdistricts, adds the values to the FeatureCollection, that i later return, but also flattens the code, what means it adds it all to one file
var final_results = ee.FeatureCollection(subdistrict_info.map(function(feature) {
  var subdistrict_ZBEZ = feature.getString('ZBEZ'); 
  var results_filter = time_period.map(function(range) {
    var results_ndvi = calculate_filter(feature, range.start, range.end);
    return results_ndvi.set('subdistrict_ZBEZ', subdistrict_ZBEZ);
  });
  return ee.FeatureCollection(results_filter);
}).flatten());


print(final_results);

Export.table.toDrive({
  collection: final_results,
  description: 'NDVI',
  fileFormat: 'CSV'
});


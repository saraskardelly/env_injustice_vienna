/* In the following, there is the code for the visualization of the Surface Temperature for Vienna. As well as the Time Series for it. Again, open and free code was used, and adopteed from Sean McCartney, NASA Applied Remote Sensing Training (ARSET) program*/

// first, import the asset of Vienna's subdistricts

var year = ee.Filter.calendarRange(2024, 2024,'year');
var time_period = ee.Filter.dayOfYear(182, 243);
var area = table;
var show = true;
var landsat_band = ['ST_B10', 'QA_PIXEL']; 

// again, here cloud masking is applied
function cloud_masking(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3)
    .or(qa.bitwiseAnd(1 << 4));
  return image.updateMask(mask.not());
}

var landsat_collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .select('ST_B10', 'QA_PIXEL')
  .filterBounds(area)
  .filter(year)
  .filter(time_period)
  .map(cloud_masking);


function calculate_ST(image) {
  var scaled = image.select('ST_B10').multiply(0.00341802).add(149.0) // scale for Kelvin
  .subtract(273.15); // to convert to celsius
  return image.addBands(scaled, null, true);
}

var landsatST = landsat_collection.map(calculate_ST);

var mean_landsatST = landsatST.mean();

var clipST = mean_landsatST.clip(area);

// I chose here yellow as it is more inclusive than red
Map.addLayer(clipST, {
  bands: "ST_B10", 
  min: 28, max: 47, 
  palette: ['#0000ff', '#bfbfbf', '#ffcc00']}, "ST", show);

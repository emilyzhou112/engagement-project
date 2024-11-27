import { initMap } from './basemap.js';
import { loadData } from './loadData.js';
import { waterParcel } from './loadWP.js';
import { addWaterParcel } from './wpmap.js';
import { updateSliderValue } from './sliderValue.js';
import { drawBar } from './drawBar.js';
import { initAddressSearch } from './address_search.js';
import { addFloodReport } from './firebase.js';
import { loadPoints} from './loadPoints.js';

const events = new EventTarget();

// basemap data
const {shadow, buildings, landuse, amenities} = await loadData();
const floodPoints = await loadPoints();

// water parcel data and information
const allWaterData = {};
const allParcelData = {};
for (let level = 515; level <= 526; level++) {
  const waterData = await waterParcel(level);
  allWaterData[level] = waterData.waterFeatures;
  allParcelData[level] = waterData.parcelFeatures;
}

// initialize basemap
const mapEl = document.querySelector('#map');
const basemap = initMap(mapEl, shadow, buildings, landuse, allParcelData, floodPoints, amenities);

// initialize water parcel layer
const waterParcelLayerGroup = L.layerGroup().addTo(basemap);
function updateWaterParcels(level) {
  waterParcelLayerGroup.clearLayers();
  addWaterParcel(waterParcelLayerGroup, allWaterData[level], allParcelData[level], allParcelData);
}
const slider = document.querySelector('#waterLevel');
const slider2 = document.querySelector('#waterLevel2');
const barEL = d3.select('#type-bar');
slider.addEventListener('input', (event) => {
  const level = parseInt(event.target.value);
  updateWaterParcels(level);
  updateSliderValue(allParcelData, level);
  drawBar(barEL, allParcelData[level]);
});
await updateWaterParcels(515);
updateSliderValue(allParcelData, 515);
drawBar(barEL, allParcelData[515]);

slider2.addEventListener('input', (event) => {
  const level = parseInt(event.target.value);
  updateWaterParcels(level);
});

// address search component
let lat;
let lng;
const searchEl = document.querySelector('[name="address-search"]');
const submitButton = document.querySelector('#submit');
initAddressSearch(searchEl, events);
function handleAddressSelection(event, map) {
  submitButton.disabled = false;
  const feature = event.detail;
  [lng, lat] = feature.geometry.coordinates;
  map.setView([lat, lng], 17);
}
events.addEventListener('autocompleteselected', (event) => {
  handleAddressSelection(event, basemap);
});
const originalView = { center: [44.26053976443341, -72.583011566153], zoom: 14 };
const ResetControl = L.Control.extend({
  options: { position: 'bottomright' },
  onAdd: function() {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom reset-view-btn');
    container.innerHTML = '<i class="fas fa-sync-alt"></i> Reset View';
    L.DomEvent.on(container, 'click', function() {
      basemap.setView(originalView.center, originalView.zoom);
    });

    return container;
  },
});
basemap.addControl(new ResetControl());

// report flood events
const newAddress = document.querySelector('[name="address-contribute"]');
initAddressSearch(newAddress, events);
const parcelType = document.querySelector('#parcel-select');
const parcelValue = document.querySelector('#parcel-value');
const damageReport = document.querySelector('#damage-report');
const housingType = document.querySelector('#housing-select');
const insurance = document.querySelector('#insurance-select');
submitButton.addEventListener('click', () => {
  addFloodReport(parcelType.value, lat, lng, parcelValue.value, damageReport.value, housingType.value, insurance.value);
  basemap.addData(lat, lng);
  submitButton.disabled = true;
});

// control panels
const tool1Button = document.querySelector('#tool1');
const tool2Button = document.querySelector('#tool2');
const tool3Button = document.querySelector('#tool3');
const tool4Button = document.querySelector('#tool4');
const sidebarContainer = document.querySelector('#sidebar-container');
const sidebarContainer2 = document.querySelector('#sidebar-container-2');
const addressSearchContainer = document.querySelector('#address-search-container');
const reportFloodContainer = document.querySelector('#report-container');

tool1Button.addEventListener('click', () => {
  sidebarContainer.style.display = 'block';
  sidebarContainer2.style.display = 'none';
  addressSearchContainer.style.display = 'none';
  reportFloodContainer.style.display = 'none';
  basemap.hidePointsLayer();
  basemap.hideAmenityLayer();
});

tool2Button.addEventListener('click', () => {
  sidebarContainer.style.display = 'none';
  sidebarContainer2.style.display = 'none';
  addressSearchContainer.style.display = 'block';
  reportFloodContainer.style.display = 'none';
  basemap.hidePointsLayer();
  basemap.hideAmenityLayer();
});

tool3Button.addEventListener('click', () => {
  sidebarContainer.style.display = 'none';
  sidebarContainer2.style.display = 'none';
  addressSearchContainer.style.display = 'none';
  reportFloodContainer.style.display = 'block';
  submitButton.disabled = true;
  basemap.showPointsLayer();
  basemap.hideAmenityLayer();
});

tool4Button.addEventListener('click', () => {
  sidebarContainer.style.display = 'none';
  sidebarContainer2.style.display = 'block';
  addressSearchContainer.style.display = 'none';
  reportFloodContainer.style.display = 'none';
  submitButton.disabled = true;
  basemap.hidePointsLayer();
  basemap.showAmenityLayer();
});

async function loadData() {
  // Load building footprints data
  const bfshadow = await fetch('data/bf_shadow.geojson');
  const shadowCollection = await bfshadow.json();
  const shadow = shadowCollection.features;
  const bf = await fetch('data/bf.geojson');
  const bfCollection = await bf.json();
  const buildings = bfCollection.features;
  // Load landuse data
  const lu = await fetch('data/lu_line2.geojson');
  const luCollection = await lu.json();
  const landuse = luCollection.features;

  return {shadow, buildings, landuse};
}

export { loadData };
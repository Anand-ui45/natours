export const displyMap = (locations) => {
  var map = L.map('map', { zoomControl: false });
  const customIcon = L.icon({
    iconUrl: '/img/pin.png', // URL to your custom icon image
    iconSize: [32, 45], // Size of the icon [width, height]
    iconAnchor: [16, 32], // Anchor point of the icon [left, top]
    popupAnchor: [0, -32], // Anchor point of the popup relative to the icon
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    crossOrigin: '',
  }).addTo(map);

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  // map.scrollWheelZoom.disable();
};

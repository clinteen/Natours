// const locations = JSON.parse(document.getElementById('map').dataset.locations);

// console.log(locations);

// const mapEl = document.getElementById('map');
// if (mapEl) {
//     const locations = JSON.parse(mapEl.dataset.locations);

//     // Center map on first location. Note: flip [lng, lat] to [lat, lng]
//     const map = L.map('map').setView(
//         [locations[0].coordinates[1], locations[0].coordinates[0]],
//         10
//     );

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution: '© OpenStreetMap contributors'
//     }).addTo(map);

//     // Loop all 3 locations and add markers
//     locations.forEach((loc) => {
//         L.marker([loc.coordinates[1], loc.coordinates[0]]) // [lat, lng]
//             .addTo(map)
//             .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`);
//     });
// }

// const map = L.map('map').setView([locations.coordinates], 12);

// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: 'OpenStreetMap contributors'
// }).addTo(map);

// L.marker(locations.coordinates)
//     .addTo(map)
//     .bindPopup('<b>Tour</b><br>Starting Point Here')
//     .openPopup();

document.addEventListener('DOMContentLoaded', function () {
    const mapEl = document.getElementById('map');
    // console.log('Map element:', mapEl);
    // console.log('Raw data:', mapEl?.dataset.locations);

    if (!mapEl || !mapEl.dataset.locations) return;

    try {
        const locations = JSON.parse(mapEl.dataset.locations);
        console.log('Parsed locations:', locations);

        const map = L.map('map');
        L.tileLayer(
            'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 19
            }
        ).addTo(map);

        map.setView([20, 0], 2); // start zoomed out
        map.flyTo([38.3, -122.3], 14, {
            animate: true,
            duration: 3 // 3 seconds
        });

        const markers = locations.map((loc) => {
            console.log('Adding marker:', loc.description, loc.coordinates);
            const [lng, lat] = loc.coordinates;
            return L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`<b>Day ${loc.day}</b><br>${loc.description}`);
        });

        map.zoomControl.remove();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();

        if (markers.length) {
            L.featureGroup(markers).getBounds().pad(0.2);
            map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2));
        }
    } catch (err) {
        console.error('MAP CRASHED:', err);
    }
});

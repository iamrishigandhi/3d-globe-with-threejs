import * as THREE from "three";

// Converts lat/lon to 3D position on a sphere
function latLonToVector3(lat, lon, radius) {
const phi = (90 - lat) * (Math.PI / 180);
const theta = (lon + 180) * (Math.PI / 180);

const x = -radius * Math.sin(phi) * Math.cos(theta);
const y = radius * Math.cos(phi);
const z = radius * Math.sin(phi) * Math.sin(theta);

return new THREE.Vector3(x, y, z);
}

function getCentroid(ring) {
    let totalLat = 0;
    let totalLon = 0;
    let count = 0;

    ring.forEach(([lon, lat]) => {
    totalLat += lat;
    totalLon += lon;
    count++;
    });

    return [totalLat / count, totalLon / count];
}

function makeTextSprite(message, parameters = {}) {
    const fontface = parameters.fontface || "Arial";
    const fontsize = parameters.fontsize || 128;
    const borderThickness = parameters.borderThickness || 4;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    context.font = `${fontsize}px ${fontface}`;
    const textWidth = context.measureText(message).width;

    canvas.width = textWidth + borderThickness * 2;
    canvas.height = fontsize + borderThickness * 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText(message, borderThickness, fontsize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    const scaleFactor = 1;
    sprite.scale.set(scaleFactor, scaleFactor * (canvas.height / canvas.width), 1);

    return sprite;
}

export default function countryLabels(scene, geojson, radius = 2.05) {
    geojson.features.forEach(feature => {
    const name = feature.properties.ADMIN || feature.properties.name;
    const geometry = feature.geometry;

    let centroidLat, centroidLon;

    if (geometry.type === "Polygon") {
        const outerRing = geometry.coordinates[0];
        [centroidLat, centroidLon] = getCentroid(outerRing);
    } else if (geometry.type === "MultiPolygon") {
        // Use largest polygon's outer ring
        const largest = geometry.coordinates.reduce((a, b) =>
        a[0].length > b[0].length ? a : b
        );
        const outerRing = largest[0];
        [centroidLat, centroidLon] = getCentroid(outerRing);
    } else {
        return; // unsupported geometry
    }

    const position = latLonToVector3(centroidLat, centroidLon, radius);
    const label = makeTextSprite(name, { fontsize: 48 });
    label.position.copy(position);
    scene.add(label);
    });
}

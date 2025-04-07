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

function makeTextSprite(message, parameters = {}) {
    const fontface = parameters.fontface || "Arial";
    const fontsize = parameters.fontsize || 96;  // Use a smaller base fontsize
    const borderThickness = parameters.borderThickness || 4;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // Calculate text width and height
    context.font = `${fontsize}px ${fontface}`;
    const textWidth = context.measureText(message).width;

    // Adjust canvas size based on text and border thickness
    canvas.width = textWidth + borderThickness * 2;
    canvas.height = fontsize + borderThickness * 2;

    // Clear canvas and draw text
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText(message, borderThickness, fontsize);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);

    // Adjust scale based on globe radius (set sprite size proportional to the globe size)
    const scaleFactor = 1;  // Scale factor to adjust size
    sprite.scale.set(scaleFactor, scaleFactor, 1); // Keep aspect ratio

    return sprite;
}

// Main function to add labels from geojson
export default function countryLabels(scene, geojson, radius = 2.05) {
geojson.features.forEach(feature => {
    const name = feature.properties.ADMIN || feature.properties.name;
    const coords = feature.geometry;

    let lat, lon;
    if (coords.type === "Polygon") {
    [lon, lat] = coords.coordinates[0][0];
    } else if (coords.type === "MultiPolygon") {
    [lon, lat] = coords.coordinates[0][0][0];
    } else {
    return;
    }

    const position = latLonToVector3(lat, lon, radius);
    const label = makeTextSprite(name, { fontsize: 48 });
    label.position.copy(position);
    scene.add(label);
});
}

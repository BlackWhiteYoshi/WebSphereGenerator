@group(0) @binding(0) var colorTexture: texture_storage_2d<rgba8unorm, write>;

@group(0) @binding(1) var<uniform> _size: u32;
@group(0) @binding(2) var<uniform> _color: vec3<f32>;
@group(0) @binding(3) var<uniform> _backgroundColor: vec3<f32>;
@group(0) @binding(4) var<uniform> _lightDirection: vec3<f32>;
@group(0) @binding(5) var<uniform> _ambient: f32;
@group(0) @binding(6) var<uniform> _diffuse: f32;
@group(0) @binding(7) var<uniform> _specular: f32;
@group(0) @binding(8) var<uniform> _specularShininess: f32;


@compute @workgroup_size(1,1,1)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
    let screenPos: vec2<u32> = globalInvocationId.xy;
    let screenSize: u32 = textureDimensions(colorTexture).x;

    let middle: f32 = f32(screenSize) / 2.0;
    let radius: f32 = middle / 100.0 * f32(_size);

    // map index to coordinates [-1..1]
    let x: f32 = (f32(screenPos.x) - middle) / radius;
    let y: f32 = (f32(screenPos.y) - middle) / radius;

    let squaredDistance: f32 = (x * x + y * y);
    var color: vec3<f32>;
    if (squaredDistance < 1) {
        color = _color * calculateLighting(x, y);
    }
    else {
        color = _backgroundColor;
    }

    textureStore(colorTexture, screenPos, vec4(color, 1.0));
}

fn calculateLighting(x: f32, y: f32) -> f32 {
    let z: f32 = sqrt(1 - x * x - y * y);
    let light: vec3<f32> = normalize(_lightDirection);

    // Phong

    let ambient: f32 = _ambient;

    let diffuseAngle: f32 = max(dot(vec3(x, y, z), light), 0.0);
    let diffuse: f32 = diffuseAngle * _diffuse;

    let viewDirection: vec3<f32> = vec3(0.0, 0.0, 1.0);
    let reflectDirection: vec3<f32> = reflect(-light, vec3(x, y, z));
    let specularAngle: f32 = max(dot(viewDirection, reflectDirection), 0.0);
    let specular: f32 = pow(specularAngle, _specularShininess) * _specular;

    return ambient + diffuse + specular;
}

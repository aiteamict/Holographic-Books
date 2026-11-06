# Hero model

Drop `surveyor.glb` here and the book uses it automatically (see `src/engine/hero.js`); until then a procedural
surveyor stands in. Target: a standing surveyor, 1.7 m, neutral pose, arms by the sides (the book adds the staff),
<= 40k triangles, one material, feet on the ground plane, facing +Z.

Suggested Tripo / Meshy prompt:
"Full-body 3D model of an Indian highway surveyor from the 1960s standing upright, khaki shirt and trousers, field
boots, a white sun hat, neutral A-pose with arms slightly away from the body, realistic proportions, clean low-poly
game-ready topology, single material, plain grey background."

Blender: Import glb -> Decimate (collapse, ratio ~0.3) -> Recalculate normals -> Apply transforms, origin to feet,
face +Y forward in Blender's export (= +Z in three.js) -> Export glTF Binary with Draco off.

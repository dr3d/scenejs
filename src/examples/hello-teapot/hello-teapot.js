/*
 Introductory SceneJS scene which renders the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node is a function
 that will set some WebGL state on entry, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, then the rest of the nodes specify various transforms, lights,
 material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 passed down via data "scopes". Take a close look at the rotate nodes, which use these variables, and
 the invocation of the "render" function near the bottom of this example, which passes them in.

 */
var exampleScene = SceneJS.scene({

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv" },

    /* Viewing transform specifies eye position, looking
     * at the origin by default
     */
        SceneJS.lookAt({
            eye : { x: 0.0, y: 10.0, z: -15 },
            look : { y:1.0 },
            up : { y: 1.0 }
        },
            /* Camera describes the projection
             */
                SceneJS.camera({
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.25,
                        near : 0.10,
                        far : 300.0  }
                },

                    /* A lights node inserts  point lights into the world-space.
                     * You can have many of these, nested within modelling transforms
                     * if you want to move them around.
                     */
                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        }),

                        SceneJS.light({
                            type:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        }),

                    /* Next, modelling transforms to orient our teapot
                     * by a given angle.
                     * See how these have "sid" (scoped identifier) properties,
                     * which they will be referenced by when we push configurations
                     * into the scene graph when we render it
                     */
                        SceneJS.rotate({
                            sid: "pitch",
                            angle: 0.0,
                            x : 1.0
                        },
                                SceneJS.rotate({
                                    sid: "yaw",
                                    angle: 0.0,
                                    y : 1.0
                                },

                                    /* Specify the amounts of ambient, diffuse and specular
                                     * lights our teapot reflects
                                     */
                                        SceneJS.material({
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          6.0
                                        },

                                            /* Teapot's geometry
                                             */
                                                SceneJS.scale({x:1.0,y:1.0,z:1.0},
                                                        SceneJS.teapot()
                                                        )
                                                )
                                        )
                                ) // rotate
                        ) // lookAt
                ) // perspective
        )
        ; // scene


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

/* Throw the switch, Igor - do an intial render of the scene.
 */
exampleScene
        .render();

/* Always get canvas from scene - it will try to bind to a default canvas
 * can't find the one specified
 */
var canvas = document.getElementById(exampleScene.getCanvasId());

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;

        exampleScene
                .setConfigs({ "#pitch": { angle: pitch, "#yaw": { angle: yaw } } })
                .render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);




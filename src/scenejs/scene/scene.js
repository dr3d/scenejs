/**
 *@class Root node of a SceneJS scene graph.
 *
 * <p>This is entry and exit point for traversal of a scene graph, providing the means to inject configs, pick
 * {@link SceneJS.Geometry} and render frames either singularly or in a continuous loop.</p>
 * <p><b>Binding to a canvas</b></p>
 * <p>The Scene node can be configured with a <b>canvasId</b> property to specify the ID of a WebGL compatible Canvas
 * element for the scene to render to. When that is omitted, the node will look for one with the default ID of
 * "_scenejs-default-canvas".</p>
 * <p><b>Usage Example:</b></p><p>Below is a minimal scene graph. To render the scene, SceneJS will traverse its nodes
 * in depth-first order. Each node will set some scene state on entry, then un-set it again before exit. In this graph,
 * the {@link SceneJS.Scene} node binds to a WebGL Canvas element, a {@link SceneJS.LookAt} defines the viewoint,
 * a {@link SceneJS.Camera} defines the projection, a {@link SceneJS.Lights} defines a light source,
 * a {@link SceneJS.Material} defines the current material properties, {@link SceneJS.Rotate} nodes orient the modeling
 * coordinate space, then a {@link SceneJS.Cube} defines our cube.</p>
 * <pre><code>
 *
 * var myScene = new SceneJS.Scene({
 *     canvasId: 'theCanvas'
 *   },
 *
 *   new SceneJS.LookAt({
 *       eye  : { x: -1.0, y: 0.0, z: 15 },
 *       look : { x: -1.0, y: 0, z: 0 },
 *       up   : { y: 1.0 }
 *     },
 *
 *     new SceneJS.Camera({
 *         optics: {
 *           type: "perspective",
 *           fovy   : 55.0,
 *           aspect : 1.0,
 *           near   : 0.10,
 *           far    : 1000.0
 *         }
 *       },
 *
 *       new SceneJS.Light({
 *               type:  "dir",
 *               color: { r: 1.0, g: 1.0, b: 1.0 },
 *               dir:   { x: 1.0, y: -1.0, z: 1.0 }
 *             }),
 *
 *       new SceneJS.Light({
 *               type:  "dir",
 *               color: { r: 1.0, g: 1.0, b: 1.0 },
 *               dir:   { x: -1.0, y: -1.0, z: -3.0 }
 *             }),
 *
 *       new SceneJS.Material({
 *               baseColor:      { r: 0.9, g: 0.2, b: 0.2 },
 *               specularColor:  { r: 0.9, g: 0.9, b: 0.2 },
 *               emit:           0.0,
 *               specular:       0.9,
 *               shine:          6.0
 *            },
 *
 *            // We're going to demonstrate two techniques for updating
 *            // the angles of these rotate nodes. One technique requires
 *            // that they have scoped identifiers (SID)s, while the other
 *            // requires them to have globally-unique IDs.
 *
 *            new SceneJS.Rotate({
 *                     id:   "foo-id",                // Optional global ID
 *                     sid:  "foo-sid",               // Optional scoped identifier
 *                     angle: 0.0, y : 1.0
 *                 },
 *
 *                 new SceneJS.Rotate({
 *                          id:  "bar-id",            // Optional global ID
 *                         sid: "bar-sid",           // Optional scoped identifier
 *                          angle: 0.0, x : 1.0
 *                     },
 *
 *                     new SceneJS.Cube()
 *                   )
 *                )
 *              )
 *           )
 *        )
 *     );
 * </pre></code>
 *
 * <b><p>Injecting Data into the Scene</p></b>
 * <p>Now, to inject some data into those rotate nodes, we can pass a configuration map into the scene graph,
 *  which as traversal descends into the scene, locates our rotate node by their SIDs and stuffs some angles into
 * their appropriate setter methods:</p>
 * <code><pre>
 *   myScene.setConfigs({
 *           "foo-sid": {
 *               angle: 315,       // Maps to SceneJS.Rotate#setAngle
 *               "#bar-sid": {
 *                   angle:20
 *               }
 *           });
 *
 *   myScene.render();
 * </pre></code>
 *
 * <p>Since gave those rotate nodes <b>ID</b>s, then we could instead find them directly and set their angles:
 * <pre><code>
 * SceneJS.getNode("foo-id").setAngle(315);
 * SceneJS.getNode("bar-id").setAngle(20);
 *
 * myScene.render();
 * </pre></code>
 *
 * <p>We can also pass config objects directly to nodes:
 * <pre><code>
 * SceneJS.getNode("foo-id").configure({ angle: 315 });
 * </pre></code>
 *
 * <p>..or pass them in "configure" events:
 * <pre><code>
 * SceneJS.fireEvent("configure", "foo-id", { angle: 315 });
 * </pre></code>
 *
 *
 * <h2>Rendering in a Loop</h2>
 * <p>If you wanted to animate the rotation within the scene example above, then instead of rendering just a single frame
 * you could start a rendering loop on the scene, as shown below:</p>
 * <pre><code>
 *    var yaw = 0.0;
 *    var pitch = 20.0
 *
 *    myScene.start({
 *
 *        // Idle function called before each render traversal
 *
 *        idleFunc: function(scene) {
 *             scene.setConfigs({
 *                 "foo-sid": {
 *                     angle: yaw,
 *                     "#bar-sid": {
 *                         angle: pitch
 *                     }
 *                 });
 *
 *             yaw += 2.0;
 *             if (yaw == 360) {
 *                 scene.stop();
 *             }
 *        },
 *
 *        fps: 20
 * });
 * </code></pre>
 * @extends SceneJS.Node
 */
SceneJS.Scene = SceneJS.createNodeType("scene");

// @private
SceneJS.Scene.prototype._init = function(params) {
    if (params.canvasId) {
        this._canvasId = document.getElementById(params.canvasId) ? params.canvasId : SceneJS.Scene.DEFAULT_CANVAS_ID;
    } else {
        this._canvasId = SceneJS.Scene.DEFAULT_CANVAS_ID;
    }
    this._loggingElementId = params.loggingElementId;
};

/** ID of canvas SceneJS looks for when {@link SceneJS.Scene} node does not supply one
 */
SceneJS.Scene.DEFAULT_CANVAS_ID = "_scenejs-default-canvas";

/** ID ("_scenejs-default-logging") of default element to which {@link SceneJS.Scene} node will log to, if found.
 */
SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID = "_scenejs-default-logging";

/** Returns the ID of the canvas element that this scene is to bind to. When no canvasId was configured, it will be the
 * the default ID of "_scenejs-default-canvas".
 */
SceneJS.Scene.prototype.getCanvasId = function() {
    return this._canvasId;
};

/**
 * Starts the scene rendering repeatedly in a loop. After this {@link #isRunning} will return true, and you can then stop it again
 * with {@link #stop}. You can specify an idleFunc that will be called within each iteration before the scene graph is
 * traversed for the next frame. You can also specify the desired number of frames per second to render, which SceneJS
 * will attempt to achieve.
 *
 * To render just one frame at a time, use {@link #render}.
 *
 * <p><b>Usage Example: Basic Loop</b></p><p>Here we are rendering a scene in a loop, at each frame feeding some data into it
 * (see main {@link SceneJS.Scene} comment for more info on that), then stopping the loop after ten frames are rendered:</p>
 *
 * <pre><code>
 * var n = 0;
 * myScene.start({
 *     idleFunc: function(scene) {
 *
 *         scene.setData({ someData: 5, moreData: 10 };
 *
 *         n++;
 *         if (n == 100) {
 *             scene.stop();
 *         }
 *     },
 *     fps: 20
 * });
 * </code></pre>
 *
 *
 * <p><b>Usage Example: Picking</b></p><p>The snippet below shows how to do picking via the idle function, where we
 * retain the mouse click event in some variables which are collected when the idleFunc is next called. The idleFunc
 * then puts the scene into picking mode for the next traversal. Then any {@link SceneJS.Geometry} intersecting the
 * canvas-space coordinates during that traversal will fire a "picked" event to be observed by "picked" listeners at
 * higher nodes (see examples, wiki etc. for the finer details of picking). After the traversal, the scene will be back
 * "rendering" mode again.</p>
 *
 * <pre><code>
 * var clicked = false;
 * var clickX, clickY;
 *
 * canvas.addEventListener('mousedown',
 *     function (event) {
 *         clicked = true;
 *         clickX = event.clientX;
 *         clickY = event.clientY;
 * }, false);
 *
 * myScene.start({
 *     idleFunc: function(scene) {
 *         if (clicked) {
 *             scene.pick(clickX, clickY);
 *             clicked = false;
 *         }
 *     }
 * });
 * </code></pre>
 * @param cfg
 */
SceneJS.Scene.prototype.start = function(cfg) {
    if (!this._running) {
        this._running = true;
        var self = this;
        var fnName = "__scenejs_renderScene" + this._sceneId;
        window[fnName] = function() {
            if (cfg.idleFunc) {
                cfg.idleFunc();
            }
            if (self._running) { // idleFunc may have stopped render loop
                self._render();
            }
        };
        this._pInterval = setInterval("window['" + fnName + "']()", 1000.0 / (cfg.fps || 100));
    }
};

/** Returns true if the scene is currently rendering repeatedly in a loop after being started with {@link #start}.
 */
SceneJS.Scene.prototype.isRunning = function() {
    return this._running;
};

/**
 * Immediately renders one frame of the scene, applying any config  values given to
 * {#link #setConfigs}, retaining those values in the scene afterwards. Has no effect if the scene has been
 * {@link #start}ed and is currently rendering in a loop.
 */
SceneJS.Scene.prototype.render = function() {
    if (!this._running) {
        this._render();
    }
};

/** @private
 */
SceneJS.Scene.prototype._render = function() {
    if (!this._sceneId) {
        this._sceneId = SceneJS._sceneModule.createScene(this, {
            canvasId: this._canvasId,
            loggingElementId: this._loggingElementId
        });
    }
    SceneJS._sceneModule.activateScene(this._sceneId);
    var traversalContext = {};
    this._renderNodes(traversalContext);
    SceneJS._sceneModule.deactivateScene();
};

/** @private
 */
SceneJS.Scene.prototype.reRender = function() {
    if (!this._sceneId) {
        this._sceneId = SceneJS._sceneModule.createScene(this, {
            canvasId: this._canvasId,
            loggingElementId: this._loggingElementId
        });
        this.render();
    } else {
        SceneJS._sceneModule.redrawScene(this._sceneId);
    }
};

/**
 * Picks whatever {@link SceneJS.Geometry} will be rendered at the given canvas coordinates. When this is called within
 * the idle function of a currently running render loop (ie. started with {@link #start) then pick will be performed on
 * the next render. When called on a non-running scene, the pick is performed immediately.
 * When a node is picked (hit), then all nodes on the traversal path to that node that have "picked" listeners will
 * receive a "picked" event as they are rendered (see examples and wiki for more info).
 *
 * @param canvasX Canvas X-coordinate
 * @param canvasY Canvas Y-coordinate
 */
SceneJS.Scene.prototype.pick = function(canvasX, canvasY) {
    if (!this._sceneId) {
        throw new SceneJS.errors.InvalidSceneGraphException
                ("Attempted pick on Scene that has been destroyed or not yet rendered");
    }
    SceneJS._pickModule.pick(canvasX, canvasY); // Enter pick mode
    if (!this._running) {
        this._render(); // Pick-mode traversal - get picked element and fire events
        this._render(); // Render-mode traversal - process events with listeners while drawing
    }
};

/**
 * Returns count of active processes. A non-zero count indicates that the scene should be rendered
 * at least one more time to allow asynchronous processes to complete - since processes are
 * queried like this between renders (ie. in the idle period), to avoid confusion processes are killed
 * during renders, not between, in order to ensure that this count doesnt change unexpectedly and create
 * a race condition.
 */
SceneJS.Scene.prototype.getNumProcesses = function() {
    return (this._sceneId) ? SceneJS._processModule.getNumProcesses(this._sceneId) : 0;
};

/** Destroys this scene. You should destroy
 * a scene as soon as you are no longer using it, to ensure that SceneJS does not retain
 * resources for it (eg. shaders, VBOs etc) that are no longer in use. A destroyed scene
 * becomes un-destroyed as soon as you render it again. If the scene is currently rendering in a loop (after a call
 * to {@link #start}) then the loop is stopped.
 */
SceneJS.Scene.prototype.destroy = function() {
    if (this._sceneId) {
        this.stop();
        SceneJS._sceneModule.destroyScene(this._sceneId); // Last one fires RESET command
        this._sceneId = null;
    }
};

/** Returns true if scene active, ie. not destroyed. A destroyed scene becomes active again
 * when you render it.
 */
SceneJS.Scene.prototype.isActive = function() {
    return (this._sceneId != null);
};

/** Stops current render loop that was started with {@link #start}. After this, {@link #isRunning} will return false.
 */
SceneJS.Scene.prototype.stop = function() {
    if (this._running) {
        this._running = false;
        window["__scenejs_renderScene" + this._sceneId] = null;
        window.clearInterval(this._pInterval);
    }
};

/** Total SceneJS reset - destroys all scenes and cached resources.
 */
SceneJS.reset = function() {
    var scenes = SceneJS._sceneModule.getAllScenes();
    var temp = [];
    for (var i = 0; i < scenes.length; i++) {
        temp.push(scenes[i]);
    }
    while (temp.length > 0) {

        /* Destroy each scene individually so it they can mark itself as destroyed.
         * A RESET command will be fired after the last one is destroyed.
         */
        temp.pop().destroy();
    }
};


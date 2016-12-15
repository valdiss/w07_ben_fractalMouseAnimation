//  ____       _  __       _____                     _   _
// / ___|  ___| |/ _|     | ____|_  _____  ___ _   _| |_(_)_ __   __ _
// \___ \ / _ \ | |_ _____|  _| \ \/ / _ \/ __| | | | __| | '_ \ / _` |
//  ___) |  __/ |  _|_____| |___ >  <  __/ (__| |_| | |_| | | | | (_| |
// |____/ \___|_|_|       |_____/_/\_\___|\___|\__,_|\__|_|_| |_|\__, |
//                                                               |___/
//     _
//    / \   _ __   ___  _ __  _   _ _ __ ___   ___  _   _ ___
//   / _ \ | '_ \ / _ \| '_ \| | | | '_ ` _ \ / _ \| | | / __|
//  / ___ \| | | | (_) | | | | |_| | | | | | | (_) | |_| \__ \
// /_/   \_\_| |_|\___/|_| |_|\__, |_| |_| |_|\___/ \__,_|___/
//                            |___/
//  _____                 _   _
// |  ___|   _ _ __   ___| |_(_) ___  _ __
// | |_ | | | | '_ \ / __| __| |/ _ \| '_ \
// |  _|| |_| | | | | (__| |_| | (_) | | | |
// |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|
//
// See http://esbueno.noahstokes.com/post/77292606977/self-executing-anonymous-functions-or-how-to-write
(function() {




    // Global variable that handles our canvas 2d context
    var ctx;

    // Global utility variables :
    // Keeps the apply functions to be called at each animation cycle
    var animate_apply_functs = [];
    // Handles our timeout, used for animation
    var animateTimeout;


    // Inits canvas
    // Removes everything from canvas container
    // and then initializes new canvas context in global variable ctx
    var fn_init_canvas = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 700;
        canvas.height = 400;
        canvas.style.width = '100%';

        document.getElementById("fractal_cont").innerHTML = '';
        document.getElementById("fractal_cont").appendChild(canvas);

        ctx = canvas.getContext('2d');
    };

    ///This is the recursive definition of the **drawTree** function. It takes four arguments:
    //- x1: The starting X coordinate
    //- y1: The starting Y coordinate
    //- length: the length of the line segment to draw
    //- angle: The cumulative angle of the line segment
    //- n: The number of levels left to draw
    var drawTree = function(x1, y1, length, angle, n, variableAngle1, variableAngle2) {

        var x2 = x1 + length * Math.cos(angle * Math.PI / 180);
        var y2 = y1 - length * Math.sin(angle * Math.PI / 180);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.strokeStyle = n > 2 ? "green" : "brown";
        ctx.lineWidth = n + 1;
        ctx.stroke();

        if (n == 0) return; ///**Stop drawing** the tree whenever there are no more branches left to draw

        drawTree(x2, y2, length * 0.75, angle + variableAngle1, n - 1, variableAngle1, variableAngle2);
        drawTree(x2, y2, length * 0.75, angle - variableAngle2, n - 1, variableAngle1, variableAngle2); ///**Manipulate **anything by dragging nice friendly sliders around
    };

    // Redraws tree, eventually erase previous one before drawing
    // No arguments, as useful values are taken from DOM inputs
    var recompute_tree = function() {
        fn_init_canvas();
        let current_tree_segments_count = parseInt(document.getElementById("tree_segments_count").value, 10);
        let current_tree_segments_length = parseInt(document.getElementById("tree_segments_length").value, 10);
        let current_tree_segments_angle1 = parseInt(document.getElementById("tree_segments_angle1").value, 10);
        let current_tree_segments_angle2 = parseInt(document.getElementById("tree_segments_angle2").value, 10);

        drawTree(350.5, 367, current_tree_segments_length, 90, current_tree_segments_count, current_tree_segments_angle1, current_tree_segments_angle2);

    };


    // Animates tree modifications, each "frame" is 4ms
    // This function can be called several times, as apply functions would just be added
    // to the global animate_apply_functs list
    // - stepsCount: the number of steps to apply given functions against
    // - fn_apply:  the apply function ; sets environment variables for each animation frame
    //              this function is added to global animate_apply_fctns list, and is called once per animation frame
    //              this function returns false when finished, and is then automatically removed from list
    var animateTree = function(stepsCount, fn_apply) {

        if (typeof fn_apply != 'function') return false;
        animate_apply_functs.push(fn_apply);

        if (!animateTimeout) {

            var f = function() {

                for (fn_applying_idx in animate_apply_functs) {
                    if (typeof animate_apply_functs[fn_applying_idx] != 'function') continue;

                    if (!animate_apply_functs[fn_applying_idx]())
                        animate_apply_functs.splice(fn_applying_idx, 1);
                }

                fn_init_canvas();
                recompute_tree();

                if (animate_apply_functs.length && typeof animate_apply_functs[0] == 'function') {
                    animateTimeout = requestAnimationFrame(f, 4);
                } else {
                    clearTimeout(animateTimeout);
                    animateTimeout = null;
                    return;
                }
            }
            f();
        }

    };


    // Launches animation on page load : the tree is growing
    // - stepsCount : the number of frames (each frame is 4ms)
    var growTree = function(stepsCount, howMuch) {

        let cur_segments_count = parseInt(document.getElementById("tree_segments_count").value, 10);
        let min_segments_count = parseInt(document.getElementById("tree_segments_count").min, 10);
        let max_segments_count = parseInt(document.getElementById("tree_segments_count").max, 10);
        let step_segments_count;

        let cur_segments_length = parseInt(document.getElementById("tree_segments_length").value, 10);
        let min_segments_length = parseInt(document.getElementById("tree_segments_length").min, 10);
        let max_segments_length = parseInt(document.getElementById("tree_segments_length").max, 10);
        let step_segments_length;

        let force = parseFloat(howMuch / 10);
        if (force < 0) force = -force;

        let currentStep = 0;

        if (howMuch < 0) {
            step_segments_count = ((max_segments_count - cur_segments_count) * force) / stepsCount;
            step_segments_length = ((max_segments_length - cur_segments_length) * force) / stepsCount;
        } else if (howMuch > 0) {
            step_segments_length = ((min_segments_length - cur_segments_length) * force) / stepsCount;
            step_segments_count = ((min_segments_count - cur_segments_count) * force) / stepsCount; // negative value expected // negative value expected
        }
        // The apply function given to animate(), would be added to animate_apply_functs list by function animateTree()
        // Returns true, when running ok
        // Returns false when stepsCount is reached, and then is automatically removed from list
        // NOTE: removal is done in function animateTree()
        var fn_apply = function() {
            if (currentStep > stepsCount) return false;

            let current_tree_segments_count = parseInt(cur_segments_count + (step_segments_count * currentStep), 10);
            let current_tree_segments_length = parseInt(cur_segments_length + (step_segments_length * currentStep), 10);
            currentStep++;

            document.getElementById("tree_segments_count").value = current_tree_segments_count;
            document.getElementById("tree_segments_length").value = current_tree_segments_length;
            return true;
        };

        animateTree(stepsCount, fn_apply);
    };

    // Launches bending animation
    // - stepsCount : the number of frames (each frame is 4ms)
    // - howMuch :  in percents, between -100 and 100 ; the force at which bending will occur
    //              positive values bends one side, negative values the opposite side
    var bendTree = function(stepsCount, howMuch) {

        let cur_segments_angle1 = parseInt(document.getElementById("tree_segments_angle1").value, 10);
        let min_segments_angle1 = parseInt(document.getElementById("tree_segments_angle1").min, 10);
        let max_segments_angle1 = parseInt(document.getElementById("tree_segments_angle1").max, 10);
        let step_segments_angle1;

        let cur_segments_angle2 = parseInt(document.getElementById("tree_segments_angle2").value, 10);
        let min_segments_angle2 = parseInt(document.getElementById("tree_segments_angle2").min, 10);
        let max_segments_angle2 = parseInt(document.getElementById("tree_segments_angle2").max, 10);
        let step_segments_angle2;

        let force = parseFloat(howMuch / 100);
        if (force < 0) force = -force;

        let currentStep = 0;

        if (howMuch < 0) {
            step_segments_angle1 = ((max_segments_angle1 - cur_segments_angle1) * force) / stepsCount;
            step_segments_angle2 = ((min_segments_angle2 - cur_segments_angle2) * force) / stepsCount; // negative value expected
        } else if (howMuch > 0) {
            step_segments_angle2 = ((max_segments_angle2 - cur_segments_angle2) * force) / stepsCount;
            step_segments_angle1 = ((min_segments_angle1 - cur_segments_angle1) * force) / stepsCount; // negative value expected
        }


        var fn_apply = function() {
            if (currentStep > stepsCount) return false;

            let current_tree_segments_angle1 = parseInt(cur_segments_angle1 + (step_segments_angle1 * currentStep), 10);
            let current_tree_segments_angle2 = parseInt(cur_segments_angle2 + (step_segments_angle2 * currentStep), 10);
            currentStep++;

            document.getElementById("tree_segments_angle1").value = current_tree_segments_angle1;
            document.getElementById("tree_segments_angle2").value = current_tree_segments_angle2;
            return true;
        };

        animateTree(stepsCount, fn_apply);

    };






    // Actually launch "growing tree" animation
    growTree(100, 60);//Ends @400

    // Optionnally add bending effects while growing
    //     bendTree(40,70) ; // Ends @160
    //     setTimeout(function(){bendTree(60,-70) ;}, 200) ; // Ends @440
    //     setTimeout(function(){bendTree(20,50) ;}, 450) ; // Ends @530



    // Add event listeners

    // When sliders change
    document.getElementById("tree_segments_count").addEventListener("change", recompute_tree);
    document.getElementById("tree_segments_length").addEventListener("change", recompute_tree);
    document.getElementById("tree_segments_angle1").addEventListener("change", recompute_tree);
    document.getElementById("tree_segments_angle2").addEventListener("change", recompute_tree);

    // When mouse is moved
    document.addEventListener("mousemove", function(e) {
        if (!animateTimeout && e.movementX) bendTree(1, e.movementX);
        if (!animateTimeout && e.movementY) growTree(1, e.movementY);
    });



})();

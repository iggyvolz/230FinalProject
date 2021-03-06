// Run js on pageload so this can go in the head
$(function()
{
    // Create SVG
    const svg = SVG("sheetmusic").size(WIDTH,HEIGHT);
    window.svg=svg;
    // Draw viewbox
    svg.viewbox({x:0, y:0, width:WIDTH, height:HEIGHT});
    // Draw background
    const background = svg.rect(WIDTH,HEIGHT).fill(BACKGROUND_COLOUR);
    // Draw staves until there is no more room
    for(let i=0;i<4;i++)
    {
        drawStaff(svg, 50,50+200*i,WIDTH-100,150,2,"treble");
    }
    // https://stackoverflow.com/a/42711775
    var pt = svg.node.createSVGPoint();
    function localClickCoordinates(e)
    {
        pt.x=e.clientX;
        pt.y=e.clientY;
    
        // Translate into svg coordinates
        return pt.matrixTransform(svg.node.getScreenCTM().inverse());
    }
    function drawClef(svg, staff, clef)
    {

        switch(clef)
        {
            case "treble":
                // Draw a treble clef
                // Calculate distance between lines
                const distanceBetweenLines=staff.lines[1]-staff.lines[0];
                // Horizontally, start 2/3ds of the way into the clef
                const x = CLEF_LEFT+CLEF_WIDTH*2/3;
                // Vertically, start one third of a line length above top, end two thirds of a line length below the bottom
                svg.line(x,staff.top-distanceBetweenLines/3,x,staff.lines[4]+distanceBetweenLines*2/3).stroke({width:STEM_STROKE, color: STEM_COLOUR});
                // Now make the curve at the bottom
                const y = staff.lines[4]+distanceBetweenLines*2/3;

                // X-radius should be 1/3rd of a clef (so that the diameter is 2/3ds of a clef,
                // taking us from the main stem to the left edge of the clef)
                const rx=CLEF_WIDTH/3;
                // Y-radius should be 1/3rd of a line length
                const ry=distanceBetweenLines/3;
                const xAxisRotation=0;
                const largeArcFlag=1; // We want a large arc
                const sweepFlag=1; // Make arc point down
                const finalX=CLEF_LEFT; // End at (clef left, current y)
                const finalY=y;
                // Move to (x,y) then draw arc
                const path=`M${x},${y} A${rx},${ry} ${xAxisRotation} ${largeArcFlag},${sweepFlag} ${finalX},${finalY}`;
                svg.path(path).fill("none").stroke({width:STEM_STROKE, color: STEM_COLOUR});
                // Draw dot at end of clef
                svg.ellipse(6,6).move(finalX-3,finalY-3);
                // Draw arc from above line to D line
                // Start at last time's final position
                const x2=x;
                const y2=staff.lines[0]-distanceBetweenLines/2;
                const rx2=CLEF_WIDTH*2/3;
                const ry2=distanceBetweenLines*0.75;
                const xAxisRotation2=0;
                const largeArcFlag2=1;
                const sweepFlag2=1;
                // End at D line
                const finalX2 = x2;
                const finalY2 = staff.lines[1];
                const path2=`M${x2},${y2} A${rx2},${ry2} ${xAxisRotation2} ${largeArcFlag2},${sweepFlag2} ${finalX2},${finalY2}`;
                svg.path(path2).fill("none").stroke({width:STEM_STROKE, color: STEM_COLOUR});
                // Start at same x
                const x3=x;
                // End at end of last line
                const y3=finalY2;
                const rx3=CLEF_WIDTH*4/3;
                const ry3=distanceBetweenLines*1.5;
                const xAxisRotation3=0;
                const largeArcFlag3=1;
                const sweepFlag3=0;
                // End at E line
                const finalX3 = x2;
                const finalY3 = staff.lines[4];
                const path3=`M${x3},${y3} A${rx3},${ry3} ${xAxisRotation3} ${largeArcFlag3},${sweepFlag3} ${finalX3},${finalY3}`;
                svg.path(path3).fill("none").stroke({width:STEM_STROKE, color: STEM_COLOUR});
                // Start at same x
                const x4=x;
                // End at end of last line
                const y4=finalY3;
                const rx4=CLEF_WIDTH*4/3;
                const ry4=distanceBetweenLines;
                const xAxisRotation4=0;
                const largeArcFlag4=1;
                const sweepFlag4=0;
                // End at E line
                const finalX4 = x4;
                const finalY4 = staff.lines[2];
                const path4=`M${x4},${y4} A${rx4},${ry4} ${xAxisRotation4} ${largeArcFlag4},${sweepFlag4} ${finalX4},${finalY4}`;
                svg.path(path4).fill("none").stroke({width:STEM_STROKE, color: STEM_COLOUR});
                // Start at same x
                const x5=x;
                // End at end of last line
                const y5=staff.lines[2];
                const rx5=CLEF_WIDTH*2/3;
                const ry5=distanceBetweenLines/2;
                const xAxisRotation5=0;
                const largeArcFlag5=1;
                const sweepFlag5=0;
                // End at E line
                const finalX5 = x;
                const finalY5 = staff.lines[3];
                const path5=`M${x5},${y5} A${rx5},${ry5} ${xAxisRotation5} ${largeArcFlag5},${sweepFlag5} ${finalX5},${finalY5}`;
                svg.path(path5).fill("none").stroke({width:STEM_STROKE, color: STEM_COLOUR});
                break;
            case "bass":
                // Not impletemented
                break;
            case "none":
                break;
            default:
                console.warn("Clef "+clef+" not supported");
        }
    }
    /**
     * Draws a note on the staff
     * @returns {object} {destroy}
     */
    function drawNote(svg, staff, type, x, spot, colour)
    {
        switch(type)
        {
            case "quarter":
                const ellipseHeight=10;
                const ellipseWidth=15;

                // SVG's move wants the top-left of the rectangle containing the ellipse
                const ellipseLeft = staff.left + x - ellipseWidth/2;
                const ellipseTop = staff.top + staff.height*(spot + 1/2)/9-staff.stroke/2-ellipseHeight/2;
                const ellipse = svg.ellipse(ellipseWidth, ellipseHeight).move(ellipseLeft, ellipseTop).fill(colour);
                let line;
                // Draw the stem
                if(spot<=4)
                {
                    // Draw stem pointing down
                    // Stem starts at the left of the ellipse and goes down
                    const stemTop = ellipseTop + ellipseHeight/2; // Vertical centre of the ellipse
                    const stemBottom = ellipseTop + ellipseHeight/2 + STEM_HEIGHT;
                    const stemX = ellipseLeft + ellipseWidth*.1; // Put the stem a little into the note so it isn't as obvious
                    line = svg.line(stemX, stemTop, stemX, stemBottom).stroke({width:STEM_STROKE, color: colour});
                }
                else
                {
                    // Draw stem pointing up
                    // Stem starts at the right of the ellipse and goes up
                    const stemTop = ellipseTop + ellipseHeight/2 - STEM_HEIGHT; // Vertical centre of the ellipse
                    const stemBottom = ellipseTop + ellipseHeight/2;
                    const stemX = ellipseLeft + ellipseWidth*.9; // Put the stem a little into the note so it isn't as obvious
                    line = svg.line(stemX, stemTop, stemX, stemBottom).stroke({width:STEM_STROKE, color: colour});
                }
                destroy=function()
                {
                    // Run this function to destroy the note
                    ellipse.remove();
                    line.remove();
                }
                return {destroy};
                break;
            default:
                console.error("Unknown note");
        }
    }
    /**
     * Draws a staff
     * @param {SVG} svg SVG.j(s object
     * @param {number} left Left border of the staff
     * @param {number} top Top border of the staff
     * @param {int} width Width of the staff
     * @param {int} height Height of the staff
     * @param {int} stroke Line stroke of the staff
     * @param {string} clef Type of clef to draw (treble/bass/none)
     * @returns {object} {svg, left, top, width, height, stroke, clef, lines}
     */
    function drawStaff(svg, left, top, width, height, stroke, clef)
    {
        // Draw staff
        // Save the line numbers so we can reference their positions later
        const lines=[];
        for(var i=0;i<=4;i++)
        {
            // Draw a line of the staff
            // Go by 1/4.5th of height (plus 1/18th), so we start 1/18th from the top and end 1/18th from the bottom 
            // We also need to subtract half of the stroke, so that the line is centred at the point we want it
            lines.push(top+i*height/4.5+(height/18)-stroke/2);
            svg.line(left, lines[i], left+width, lines[i]).stroke({width:stroke, color: STAFF_COLOUR});
        }
        const staff={svg, left, top, width, height, stroke, clef, lines};
        svg.click(function(e)
        {
            // Get click coordinates relative to the svg
            const clickCoordinates = localClickCoordinates(e);
            // Get coordinates relative to the staff
            clickCoordinates.x-=left;
            clickCoordinates.y-=top;
            if(clickCoordinates.x<0 || clickCoordinates.x>width || clickCoordinates.y<0 || clickCoordinates.y>height)
            {
                // Ignore click, it was not meant for us
                return;
            }
            // Calculate line/space on which we clicked
            // Each line/space has a buffer of 1/9th of the staff, so multiply by 9 and get the floor
            const clickedSpot=Math.floor(clickCoordinates.y/height*9);
            // Place a quarter note at that spot
            let note = drawNote(svg, staff, "quarter", clickCoordinates.x, clickedSpot, "black");
        });
        // Draw the clef
        drawClef(svg, staff, clef);
        // Draw grey note at current mouse position
        let mouseCursor={destroy:function(){}} // Stores the grey note drawn at current position - start with psudo-note that we can destroy without consequence
        svg.on("mousemove",function(e){
            // Destroy old mouse cursor
            mouseCursor.destroy();
            // Get coordinates of cursor
            const coords = localClickCoordinates(e);
            // Get coordinates relative to the staff
            coords.x-=left;
            coords.y-=top;
            if(coords.x<0 || coords.x>width || coords.y<0 || coords.y>height)
            {
                // Ignore mouseover, it is not over this staff
                return;
            }
            const clickedSpot=Math.floor(coords.y/height*9);
            // Place a grey note at that spot
            mouseCursor = drawNote(svg, staff, "quarter", coords.x, clickedSpot, "grey");
        });
    }
});
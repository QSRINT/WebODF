/**
 * Copyright (C) 2014 KO GmbH <copyright@kogmbh.com>
 *
 * @licstart
 * This file is part of WebODF.
 *
 * WebODF is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License (GNU AGPL)
 * as published by the Free Software Foundation, either version 3 of
 * the License, or (at your option) any later version.
 *
 * WebODF is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with WebODF.  If not, see <http://www.gnu.org/licenses/>.
 * @licend
 *
 * @source: http://www.webodf.org/
 * @source: https://github.com/kogmbh/WebODF/
 */

/*global runtime, core, gui, odf, ops, xmldom*/

/**
 * @constructor
 * @param {core.UnitTestRunner} runner
 * @implements {core.UnitTest}
 */
gui.ZoomHelperTests = function ZoomHelperTests(runner) {
    "use strict";
    const SCROLL_POSITION_ABSOLUTE_TOLERANCE = 2;
    var r = runner,
        t;

    this.setUp = function () {
        var testArea = core.UnitTest.provideTestAreaDiv();
        t = {
            zoomHelper : new gui.ZoomHelper(),
            scrollPane : testArea,
            document : testArea.ownerDocument
        };
        t.scrollPane.style.position = "relative";
        t.scrollPane.style.overflow = "auto";
        t.scrollPane.style.width = "100px";
        t.scrollPane.style.height = "100px";
    };

    this.tearDown = function () {
        t = {};
        core.UnitTest.cleanupTestAreaDiv();
    };

    function createInnerScrollPane(width, height) {
        var innerScrollPane = document.createElement("div");
        innerScrollPane.id = "innerScrollPane";
        innerScrollPane.style.transformOrigin = "top left";
        innerScrollPane.style.width = width + "px";
        innerScrollPane.style.height = height + "px";
        innerScrollPane.style.position = "relative";
        innerScrollPane.style.overflow = "auto";
        innerScrollPane.style.border = "1px solid green";
        return innerScrollPane;
    }

    function createSimulatedContent(width, height) {
        var simulatedContent = document.createElement("div");
        simulatedContent.id = "simulatedContent";
        simulatedContent.style.transformOrigin = "top left";
        simulatedContent.style.width = width + "px";
        simulatedContent.style.height = height + "px";
        simulatedContent.style.position = "relative";
        simulatedContent.style.overflow = "hidden";
        simulatedContent.style.border = "1px solid black";
        for(var i = 0; i < 1000; i++) {
            simulatedContent.appendChild(t.document.createTextNode(i + "_" + i + " "));
        }
        return simulatedContent
    }

    function createRedSquare(top, left) {
        var redSquare = document.createElement("div");
        redSquare.id = "redSquare";
        redSquare.style.position = "absolute";
        redSquare.style.width = "5px";
        redSquare.style.height = "5px";
        redSquare.style.top = top + "px";
        redSquare.style.left = left + "px";
        redSquare.style.backgroundColor = "red";
        return redSquare;
    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_in() {
        var simulatedContent = createSimulatedContent(200, 200);
        t.scrollPane.appendChild(simulatedContent);
        t.zoomHelper.setZoomableElement(simulatedContent);
        simulatedContent.appendChild(createRedSquare(49, 80));

        t.scrollPane.scrollTop = 50;
        t.scrollPane.scrollLeft = 80;

        var zoom = 2;
        t.zoomHelper.setZoomLevel(zoom);

        r.shouldBe(t, "t.scrollPane.scrollTop", "100", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "t.scrollPane.scrollLeft", "160", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().left", "t.scrollPane.getBoundingClientRect().left", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().top", "t.scrollPane.getBoundingClientRect().top", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_out() {
        var simulatedContent = createSimulatedContent(200, 200);
        t.scrollPane.appendChild(simulatedContent);
        t.zoomHelper.setZoomableElement(simulatedContent);
        simulatedContent.appendChild(createRedSquare(49, 80));

        t.scrollPane.scrollTop = 50;
        t.scrollPane.scrollLeft = 80;

        var zoom = 0.25;
        t.zoomHelper.setZoomLevel(zoom);

        r.shouldBe(t, "t.scrollPane.scrollTop", "12", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().left", "28", SCROLL_POSITION_ABSOLUTE_TOLERANCE); // Zoomed out such that horizontal scroll is removed.
        r.shouldBe(t, "redSquare.getBoundingClientRect().top", "t.scrollPane.getBoundingClientRect().top", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_out_at_0_0() {
        var simulatedContent = createSimulatedContent(200, 200);
        t.scrollPane.appendChild(simulatedContent);
        t.zoomHelper.setZoomableElement(simulatedContent);

        var zoom = 1.5;
        t.zoomHelper.setZoomLevel(zoom);

        r.shouldBe(t, "t.scrollPane.scrollTop", "0");
        r.shouldBe(t, "t.scrollPane.scrollLeft", "0");
    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_with_multiple_scroll_panes() {
        t.scrollPane.style.width = "800px";
        t.scrollPane.style.height = "200px";
        var innerScrollPane = createInnerScrollPane(200, 800);
        t.scrollPane.appendChild(innerScrollPane);
        var simulatedContent = createSimulatedContent(800, 800);
        innerScrollPane.appendChild(simulatedContent);
        simulatedContent.appendChild(createRedSquare(59, 109));
        t.zoomHelper.setZoomableElement(simulatedContent);

        t.scrollPane.scrollTop = 60;
        innerScrollPane.scrollLeft = 110;

        var zoom = 1.5;
        t.zoomHelper.setZoomLevel(zoom);

        innerScrollPane.style.height = "1220px";

        r.shouldBe(t, "t.scrollPane.scrollTop", "90", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "innerScrollPane.scrollLeft", "165", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().left", "t.scrollPane.getBoundingClientRect().left", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().top", "t.scrollPane.getBoundingClientRect().top", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_in_creates_vertical_scroll() {
        t.scrollPane.style.width = "800px";
        t.scrollPane.style.height = "200px";
        var innerScrollPane = createInnerScrollPane(200, 800);
        t.scrollPane.appendChild(innerScrollPane);
        var simulatedContent = createSimulatedContent(800, 800);
        innerScrollPane.appendChild(simulatedContent);
        simulatedContent.appendChild(createRedSquare(59, 109));
        t.zoomHelper.setZoomableElement(simulatedContent);

        t.scrollPane.scrollTop = 60;
        innerScrollPane.scrollLeft = 110;

        var zoom = 1.5;
        t.zoomHelper.setZoomLevel(zoom);

        r.shouldBe(t, "t.scrollPane.scrollTop", "90", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "innerScrollPane.scrollTop", "0", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "innerScrollPane.scrollLeft", "165", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().left", "t.scrollPane.getBoundingClientRect().left", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().top", "t.scrollPane.getBoundingClientRect().top", SCROLL_POSITION_ABSOLUTE_TOLERANCE);

    }

    function setZoomLevel_Maintains_scroll_position_on_zoom_with_multiple_scroll_panes_and_scroll_directions() {
        t.scrollPane.style.width = "200px";
        t.scrollPane.style.height = "200px";
        var innerScrollPane = createInnerScrollPane(500, 800);
        t.scrollPane.appendChild(innerScrollPane);
        var simulatedContent = createSimulatedContent(800, 800);
        innerScrollPane.appendChild(simulatedContent);
        simulatedContent.appendChild(createRedSquare(59, 109));
        t.zoomHelper.setZoomableElement(simulatedContent);

        t.scrollPane.scrollTop = 60;
        innerScrollPane.scrollLeft = 50;
        t.scrollPane.scrollLeft = 60;

        var zoom = 1.5;
        t.zoomHelper.setZoomLevel(zoom);

        innerScrollPane.style.height = "1220px";

        r.shouldBe(t, "innerScrollPane.scrollLeft", "75", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "t.scrollPane.scrollLeft", "90", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "t.scrollPane.scrollTop", "90", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().left", "t.scrollPane.getBoundingClientRect().left", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
        r.shouldBe(t, "redSquare.getBoundingClientRect().top", "t.scrollPane.getBoundingClientRect().top", SCROLL_POSITION_ABSOLUTE_TOLERANCE);
    }

    this.asyncTests = function () {
        return [];
    };

    this.tests = function () {
        return r.name([
            setZoomLevel_Maintains_scroll_position_on_zoom_in,
            setZoomLevel_Maintains_scroll_position_on_zoom_out,
            setZoomLevel_Maintains_scroll_position_on_zoom_out_at_0_0,
            setZoomLevel_Maintains_scroll_position_on_zoom_with_multiple_scroll_panes,
            setZoomLevel_Maintains_scroll_position_on_zoom_in_creates_vertical_scroll,
            setZoomLevel_Maintains_scroll_position_on_zoom_with_multiple_scroll_panes_and_scroll_directions
        ]);
    };
};
gui.ZoomHelperTests.prototype.description = function () {
    "use strict";
    return "Test the ZoomHelper class.";
};

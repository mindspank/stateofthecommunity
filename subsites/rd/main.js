var d3 = require('d3');
var $ = require('jquery');

var width = $("#map").width(),
    height = $("#map").height(),
    country;

var projection = d3.geo.mercator()
        .scale(1)
		.translate([0, 0]);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("preserveAspectRatio", "xMidYMid")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("width", width)
    .attr("height", height);

var data = [[-71.060093, 42.359968], [13.1929125, 55.7028541], [-0.1262362, 51.5001524], [-75.6979330, 45.4234940], [-21.8952100, 64.1353380], [11.5354214, 45.5454787]]

var g = svg.append("g");

d3.json('world.geo.json', function(error, world) {
    

    b = path.bounds(world),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    svg.selectAll("circle")
		.data(data).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "#6CB33F")

    g.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("id", function(d) { return d.id; })
        .attr("d", path);


});
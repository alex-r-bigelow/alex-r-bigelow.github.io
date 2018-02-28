import * as d3 from './d3.min.js';
import colorScheme from '!!sass-variable-loader!../colors.scss';

// Tool that generates SVG filters that can recolor images
// to whatever color we need.
// Usage: CSS styles should do something like this:
// -webkit-filter: url(#recolorImageToFFFFFF)
// filter: url(#recolorImageToFFFFFF)

var createImageRecoloringFilters = function () {
  var svgDefs = d3.select('body').append('svg')
  .attr('id', 'createImageRecoloringFilters')
  .append('defs');

  // Collect all colors in use
  var allColors = {};
  Object.keys(colorScheme).forEach(function (colorName) {
    var color = colorScheme[colorName];
    if (!allColors.hasOwnProperty(color)) {
      allColors[color] = [];
    }
    allColors[color].push(colorName);
  });

  var colorList = Object.keys(allColors).filter(function (d) {
    return d.startsWith('#');
  });

  var recolorFilters = svgDefs.selectAll('filter.recolor')
  .data(colorList, function (d) {
    return d;
  });
  var recolorFiltersEnter = recolorFilters.enter().append('filter')
  .attr('class', 'recolor')
  .attr('id', function (d) {
    return 'recolorImageTo' + d.slice(1);
  });
  var cmpTransferEnter = recolorFiltersEnter.append('feComponentTransfer')
  .attr('in', 'SourceAlpha')
  .attr('result', 'color');
  cmpTransferEnter.append('feFuncR')
  .attr('type', 'linear')
  .attr('slope', 0)
  .attr('intercept', function (d) {
    var hexvalue = d.slice(1, 3);
    return Math.pow(parseInt(hexvalue, 16) / 255, 2);
  });
  cmpTransferEnter.append('feFuncG')
  .attr('type', 'linear')
  .attr('slope', 0)
  .attr('intercept', function (d) {
    var hexvalue = d.slice(3, 5);
    return Math.pow(parseInt(hexvalue, 16) / 255, 2);
  });
  cmpTransferEnter.append('feFuncB')
  .attr('type', 'linear')
  .attr('slope', 0)
  .attr('intercept', function (d) {
    var hexvalue = d.slice(5, 7);
    return Math.pow(parseInt(hexvalue, 16) / 255, 2);
  });
};

export default createImageRecoloringFilters;

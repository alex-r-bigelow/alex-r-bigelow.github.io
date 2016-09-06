import npm from 'rollup-plugin-node-resolve';

export default {
  entry: 'd3.bundle.js',
  format: 'umd',
  moduleName: 'd3',
  plugins: [npm({jsnext: true})],
  dest: 'lib/d3.js'
};

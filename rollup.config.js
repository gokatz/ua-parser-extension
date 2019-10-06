import copy from 'rollup-plugin-copy';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const commonPlugins = [
  resolve(),
  babel({
    exclude: 'node_modules/**' // only transpile our source code
  }),
];

export default [{
  input: 'src/content/index.js',
  output: {
    file: 'dist/content.js',
    format: 'cjs'
  },
  plugins: [
    ...commonPlugins,
    copy({
      targets: [
        { src: 'public/*', dest: 'dist/' },
        { src: 'src/content/index.css', dest: 'dist/', rename: 'content.css' }
      ],
      copyOnce: true
    })
  ]
}, {
  input: 'src/background/index.js',
  output: {
    file: 'dist/background.js',
    format: 'cjs'
  },
  plugins: [
    ...commonPlugins,
    copy({
      targets: [
        { src: 'src/background/index.html', dest: 'dist/', rename: 'background.html' },
        { src: 'src/background/parser-lib.js', dest: 'dist/' }
      ],
      copyOnce: true
    })
  ]
}];
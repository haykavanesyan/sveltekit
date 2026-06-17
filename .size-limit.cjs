module.exports = [
  {
    path: '.svelte-kit/output/client/_app/immutable/entry/*.js',
    limit: '80 KB',
    name: 'Public Surface JS',
    gzip: true
  },
  {
    path: '.svelte-kit/output/client/_app/immutable/nodes/*.js',
    limit: '150 KB',
    name: 'Dashboard Surface JS',
    gzip: true
  }
];

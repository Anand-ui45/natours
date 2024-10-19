const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://fonts.googleapis.com',
  'https://tile.openstreetmap.org',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

exports.obj = {
  directives: {
    defaultSrc: [],
    connectSrc: ["'self'", ...connectSrcUrls],
    scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
    styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],

    workerSrc: ["'self'", 'blob:'],
    objectSrc: [],
    imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
    fontSrc: ["'self'", ...fontSrcUrls],
  },
};

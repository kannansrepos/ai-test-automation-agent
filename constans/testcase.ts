const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.md'];

const IMPORTANT_FILES = [
  'package.json',
  'next.config',
  'middleware',
  'app/',
  'pages/',
  'components/',
  'src/',
  'lib/',
  'utils/',
  'actions/',
  'api/',
  'server/',
];

const IGNORE_PATHS = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'coverage',
  'public',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.mp4',
  '.mov',
];

export { ALLOWED_EXTENSIONS, IMPORTANT_FILES, IGNORE_PATHS };

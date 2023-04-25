import { readFileSync } from 'fs';

export default () => ({
  JWT_PUBLIC_KEY: readFileSync('src/config/jwtRS256.key.pub'),
});

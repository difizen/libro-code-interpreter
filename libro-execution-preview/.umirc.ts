import { defineConfig } from 'umi';
import routes from './routes';
export default defineConfig({
  publicPath: '/',
  routes: routes,
  runtimePublicPath: {},
  hash: true,
  proxy: {},
  plugins: ['@difizen/umi-plugin-mana', './umi-plugin-html-config'],
  mana: {
    decorator: true,
    nodenext: true,
  },
  mfsu: false,
  jsMinifier: 'none',
});

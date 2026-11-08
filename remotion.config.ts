import {Config} from '@remotion/cli/config';

// Saida "crua" de alta qualidade. A curvatura de tela (CRT) e a aberracao cromatica
// sao aplicadas depois, em scripts/crt-post.mjs, com interpolacao bilinear (sem tremedeira).
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(14);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);

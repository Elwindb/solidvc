(window).global = window;
window.process = {
    env: { NODE_ENV: 'development' },
    stdout: null,
    stderr: null,
    stdin: null,
    argv: [],
    // Add the remaining properties here
};
//import { Buffer } from 'buffer';
//(window).Buffer = Buffer;
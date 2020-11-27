import * as fb from './firebase/convert';

export let init = fb.init;
export let generate = fb.generate;
export let generatem = fb.generatem;
export let changeFormat = fb.changeFormat;

window.addEventListener('load', init);

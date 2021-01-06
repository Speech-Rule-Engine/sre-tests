import * as fb from './convert';
import {init as userinit} from './user';

export let convertInit = fb.init;
export let generate = fb.generate;
export let generatem = fb.generatem;
export let changeFormat = fb.changeFormat;
export let changeFeedback = fb.changeFeedback;
export let fireTest = fb.fireTest;

window.addEventListener('load', userinit);

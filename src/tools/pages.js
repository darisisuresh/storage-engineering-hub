import {createView as overview} from './overview.js';
import {createView as reference} from './reference.js';
import {createView as operations} from './operations.js';
import {createView as automation} from './automation.js';
import {createView as prompts} from './prompts.js';
import {createView as about} from './about.js';
export function createPages(ctx){return Object.assign({},overview(ctx),reference(ctx),operations(ctx),automation(ctx),prompts(ctx),about(ctx));}

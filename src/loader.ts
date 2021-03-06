import path from 'path';
import minimatch from 'minimatch';
import get from 'lodash/get';
import { NotFoundError } from './error';
import FunctionalAPI from './typings.d';

const ignorePaths = [
  '**/node_modules/**',
  '**/.git/**',
];

/**
 * resolve functions path
 * @param src - app src path.
 * @param route - function route.
 * @return Resolved path or null. */
function resolveFunctions(
  src: string,
  route: string,
): string | null {
  let functionPath = null;
  try {
    functionPath = require.resolve(path.join(src, route));
  } catch (err) { }
  return functionPath;
}

/**
 * get target function
 * @param src - app src path.
 * @param urlPath - function url path.
 * @return target's function or null. */
export function getTargetFunction(
  src: string,
  urlPath: string,
): FunctionalAPI.Function {
  const [route, target = 'default'] = urlPath.split(':');

  const functionPath = resolveFunctions(src, route);
  if (functionPath === null || ignorePaths.some(pattern => minimatch(functionPath, pattern))) {
    throw new NotFoundError(`function not found: '${route}'`);
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const functionModule = require(functionPath);

  // gets the target function
  const targetFunction = get(functionModule, target);

  if (typeof targetFunction !== 'function') {
    throw new NotFoundError(`function '${route}' ${target}() is not defined`);
  }

  return targetFunction;
}

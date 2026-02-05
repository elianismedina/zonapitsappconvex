/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as batteries from "../batteries.js";
import type * as cables from "../cables.js";
import type * as http from "../http.js";
import type * as inverters from "../inverters.js";
import type * as kit_components from "../kit_components.js";
import type * as kits from "../kits.js";
import type * as modules from "../modules.js";
import type * as protections from "../protections.js";
import type * as structures from "../structures.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  batteries: typeof batteries;
  cables: typeof cables;
  http: typeof http;
  inverters: typeof inverters;
  kit_components: typeof kit_components;
  kits: typeof kits;
  modules: typeof modules;
  protections: typeof protections;
  structures: typeof structures;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

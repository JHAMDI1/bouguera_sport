/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as coaches from "../coaches.js";
import type * as cron from "../cron.js";
import type * as dashboard from "../dashboard.js";
import type * as disciplines from "../disciplines.js";
import type * as families from "../families.js";
import type * as members from "../members.js";
import type * as mutations from "../mutations.js";
import type * as payments from "../payments.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  coaches: typeof coaches;
  cron: typeof cron;
  dashboard: typeof dashboard;
  disciplines: typeof disciplines;
  families: typeof families;
  members: typeof members;
  mutations: typeof mutations;
  payments: typeof payments;
  seed: typeof seed;
  sessions: typeof sessions;
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

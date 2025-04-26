/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the server-side rendering of your app.
 * This file is required for the build to work properly.
 */

import { renderToString, type RenderToStringOptions } from "@builder.io/qwik/server";
import { manifest } from "@qwik-client-manifest";
import Root from "./root";

/**
 * Server-side render method to be called by a server.
 */
export default function render(opts: RenderToStringOptions) {
  return renderToString(
    <Root />,
    {
      manifest,
      ...opts,
    }
  );
}
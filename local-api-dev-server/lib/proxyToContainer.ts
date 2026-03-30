import { Request, Response } from "express";

export default async function proxyToContainer(
  req: Request,
  res: Response,
  containerUrl: string,
  basePath: string = "",
): Promise<void> {
  const strippedPath = basePath
    ? req.path.slice(basePath.length) || "/"
    : req.path;
  const url = new URL(strippedPath, containerUrl);

  for (const [key, value] of Object.entries(req.query)) {
    url.searchParams.append(key, String(value));
  }

  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || key === "host") continue;
    forwardHeaders[key] = Array.isArray(value) ? value.join(", ") : value;
  }

  const hasBody = req.body && Object.keys(req.body).length > 0;
  const body = hasBody ? JSON.stringify(req.body) : undefined;
  if (hasBody) {
    forwardHeaders["content-type"] = "application/json";
  }

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers: forwardHeaders,
    body,
  });

  upstream.headers.forEach((value, key) => {
    if (key === "transfer-encoding") return;
    res.setHeader(key, value);
  });

  const text = await upstream.text();
  res.status(upstream.status).send(text);
}

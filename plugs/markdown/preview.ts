import { asset, clientStore, editor, markdown, system } from "$sb/syscalls.ts";
import { renderMarkdownToHtml } from "./markdown_render.ts";
import { resolvePath } from "$sb/lib/resolve.ts";
import { expandCodeWidgets } from "./api.ts";
import { folderName, resolve } from "../../common/path.ts";

export async function updateMarkdownPreview() {
  if (!(await clientStore.get("enableMarkdownPreview"))) {
    return;
  }
  const currentPage = await editor.getCurrentPage();
  const text = await editor.getText();
  const mdTree = await markdown.parseMarkdown(text);
  // const cleanMd = await cleanMarkdown(text);
  const css = await asset.readAsset("assets/preview.css");
  const js = await asset.readAsset("assets/preview.js");

  await expandCodeWidgets(mdTree, currentPage);
  const html = renderMarkdownToHtml(mdTree, {
    smartHardBreak: true,
    annotationPositions: true,
    translateUrls: (url, type) => {
      if (!url.includes("://")) {
        if (type === "image" && !url.startsWith("/")) {
          // Make relative to current folder
          url = resolve(folderName(currentPage), decodeURI(url));
        } else if (type === "link") { // link
          url = resolvePath(currentPage, decodeURI(url), true);
        }
      }
      return url;
    },
  });
  await editor.showPanel(
    "rhs",
    2,
    `<html><head><style>${css}</style></head><body><div id="root">${html}</div></body></html>`,
    js,
  );
}

export async function previewClickHandler(e: any) {
  const [eventName, arg] = JSON.parse(e);
  // console.log("Got click", eventName, arg);
  switch (eventName) {
    case "pos":
      // console.log("Moving cursor to", +arg);
      await editor.moveCursor(+arg, true);
      break;
    case "command":
      await system.invokeCommand(arg);
      break;
  }
}

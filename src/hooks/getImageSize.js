// async helper that loads an image and returns its natural dimensions
// used by editor components when "fit-to-image" button is clicked.
// the path should be a URL usable in the browser (e.g. "./images/foo.png").

export function getImageSize(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("no url provided"));
      return;
    }
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error(`failed to load image: ${url}`));
    };
    img.src = url;
  });
}

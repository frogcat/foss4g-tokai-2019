let context = null;

function getContext() {
  return context ? Promise.resolve(context) :
    fetch("dem15-27677-11757.png")
    .then(res => res.blob())
    .then(blob => self.createImageBitmap(blob))
    .then(image => {
      context = new OffscreenCanvas(image.width, image.height).getContext("2d");
      context.drawImage(image, 0, 0);
      return context;
    });
}

self.addEventListener('fetch', (event) => {
  var url = event.request.url;
  if (url.indexOf("https://cyberjapandata.gsi.go.jp/xyz/dem_png/") !== 0) return;
  var zxy = url.split(/[/\.]/).slice(8, 11).map(a => parseInt(a));
  if (zxy[0] < 9) {
    event.respondWith(Promise.resolve(
      Response.redirect(url.replace("dem_png", "demgm_png"))
    ));
  } else if (zxy[0] === 15) {
    event.respondWith(getContext().then(context => {
      var ox = 27677;
      var oy = 11757;
      var rgba = context.getImageData(zxy[1] - ox, zxy[2] - oy, 1, 1).data;
      if (rgba[0]) return Response.redirect(url.replace("dem_png", "dem5a_png"));
      if (rgba[1]) return Response.redirect(url.replace("dem_png", "dem5b_png"));
      return Response.error();
    }));
  }
});

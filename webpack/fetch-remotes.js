const { URL } = require('url');
const http = require('http');
const fs = require('fs');

/**
 * Download remote container bundles
 * @param {{
 *  name: string, 
 *  url: string, 
 *  path: string
 * }[]} remoteEntry `name` of app, `url` of remote entry, download file to `path` 
 * 
 * @returns {Promise<{[index: string]: string}>} local paths to downloaded entries
 */
module.exports = async (remoteEntry) => {
  console.log(remoteEntry);
  var entries = Array.isArray(remoteEntry)
    ? remoteEntry
    : [remoteEntry];

  var getPath = (entry) => {
    var url = new URL(entry.url);
    var path = [
      url.pathname.replace('.js', ''),
      url.hostname.replace('.', '-'),
      url.port,
      entry.name.concat('.js')
    ].join('-');

    return entry.path.concat(path);
  }

  const remotes = await Promise.all(entries.map(async entry => {
    var path = getPath(entry);
    console.log(path);

    return new Promise((resolve, reject) => {
      const rslv = () => resolve({ [entry.name]: path });

      var req = http.request(entry.url, (res) => {
        res.on('error', rslv);
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return rslv();
        }
        res.pipe(fs.createWriteStream(path));
        res.on('end', rslv);
      });

      req.on('error', rslv);
      req.end();
    });
  })).catch(() => {
    return entries.map(entry => ({
      [entry.name]: getPath(entry)
    }));
  });

  return remotes.reduce((p, c) => ({ ...c, ...p }));
}

/** zhiwo/utils/avatar-local-path.js */
export function prepareAvatarLocalPath(pathOrHttps: string | undefined): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = pathOrHttps == null ? "" : String(pathOrHttps).trim();
    if (!p) {
      reject(new Error("empty path"));
      return;
    }
    if (/^https?:\/\//i.test(p)) {
      uni.downloadFile({
        url: p,
        success: (res) => {
          if (res.statusCode === 200 && res.tempFilePath) {
            resolve(res.tempFilePath);
            return;
          }
          reject(new Error("download avatar failed"));
        },
        fail: () => reject(new Error("download avatar failed")),
      });
      return;
    }
    resolve(p);
  });
}

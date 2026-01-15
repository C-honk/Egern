const args = argument();
const urls = args.url
  ? args.url
      .split("@")
      .map(u => u.trim())
      .filter(u => u)
  : [];

const titles = args.title
  ? args.title
      .split("@")
      .map(t => t.trim())
      .filter(t => t)
  : [];

const timeout = args.timeout ? parseInt(args.timeout) : 3000;

function argument() {
  const result = {};

  if ($argument) {
    $argument.split("&").forEach(p => {
      const index = p.indexOf("=");
      if (index === -1) return;

      const key = p.substring(0, index);
      const value = p.substring(index + 1);

      result[key] = decodeURIComponent(value);
    });
  }

  return result;
}

function fetchUsage(url) {
  return new Promise(resolve => {
    $httpClient.get(
      {
        url,
        headers: {
          "User-Agent": "clash.meta/v1.19.16",
        },
        timeout,
      },
      (err, resp) => {
        if (err) {
          resolve({
            status: 0,
            error: err,
          });
        } else {
          resolve(resp);
        }
      }
    );
  });
}

function parseUsage(headers) {
  const headerKey = Object.keys(headers).find(
    k => k.toLowerCase() === "subscription-userinfo"
  );

  if (!headerKey || !headers[headerKey]) return null;

  const data = {};

  headers[headerKey].split(";").forEach(p => {
    const [k, v] = p.trim().split("=");
    if (k && v) {
      data[k] = parseInt(v);
    }
  });

  return data;
}

function formatBytes(bytes, fixed = 2) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let num = bytes;

  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }

  return fixed === 0
    ? Math.floor(num) + units[i]
    : num.toFixed(fixed) + units[i];
}

function generateText(data, title) {
  if (!data) return "";

  const used = (data.upload || 0) + (data.download || 0);
  const total = data.total || 0;
  const percent = total > 0 ? Math.floor((used / total) * 100) : 0;

  const lines = [];

  if (title) {
    lines.push(`机场：${title}`);
  }

  lines.push(`已用：${percent}%`);
  lines.push(`流量：${formatBytes(used)} ⮂ ${formatBytes(total, 0)}`);

  if (data.expire) {
    const d = new Date(data.expire * 1000);
    lines.push(
      `到期：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
    );
  }

  return lines.join("\n");
}

(async () => {
  let texts = [];
  let hasError = false;

  const icon = "antenna.radiowaves.left.and.right.circle.fill";

  if (!urls.length) {
    texts.push("未填写订阅");
    hasError = true;
  } else {
    const results = await Promise.all(
      urls.map(u => fetchUsage(u))
    );

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const title = titles[i];
      const prefix = title ? `${title} ` : "";

      if (!r || r.status !== 200) {
        if (r?.error && String(r.error).includes("timeout")) {
          texts.push(`${prefix}请求超时${timeout}ms`);
        } else if (r?.status) {
          texts.push(`${prefix}HTTP错误${r.status}`);
        } else {
          texts.push(`${prefix}请求失败`);
        }

        hasError = true;
        continue;
      }

      const data = parseUsage(r.headers || {});
      if (data) {
        texts.push(generateText(data, title));
      } else {
        texts.push(`${prefix}非机场订阅或无流量信息`);
        hasError = true;
      }
    }
  }

  $done({
    title: "订阅信息",
    content: texts.join("\n\n"),
    icon,
    "icon-color": hasError ? "#FF3B30" : "#29EA9C",
  });
})();

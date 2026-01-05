const params = parseParams();
const urls = params.url ? params.url.split("@").map(u => u.trim()).filter(u => u) : [];
const titles = params.title ? params.title.split("@").map(t => t.trim()) : [];
const timeout = params.timeout ? parseInt(params.timeout) : 3000;

function parseParams() {
  const result = {};
  if ($argument) {
    $argument.split("&").forEach(p => {
      const [key, value] = p.split("=");
      if (key) result[key] = decodeURIComponent(value || "");
    });
  }
  return result;
}

function fetchSubscription(url) {
  return new Promise(resolve => {
    $httpClient.get(
      { url, headers: { "User-Agent": "clash.meta/v1.19.16" }, timeout },
      (err, resp) => {
        if (err) resolve({ status: 0, error: err });
        else resolve(resp);
      }
    );
  });
}

function parseSubscriptionInfo(headers) {
  const key = Object.keys(headers).find(k => k.toLowerCase() === "subscription-userinfo");
  if (!key || !headers[key]) return null;
  const info = {};
  headers[key].split(";").forEach(p => {
    const [k, v] = p.trim().split("=");
    if (k && v) info[k] = parseInt(v);
  });
  return info;
}

function formatBytes(bytes, fixed = 2) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let num = bytes;
  while (num >= 1024 && i < units.length - 1) {
    num /= 1024;
    i++;
  }
  return fixed === 0 ? Math.floor(num) + units[i] : num.toFixed(fixed) + units[i];
}

function generateSubscriptionText(info, title) {
  if (!info) return "";
  const used = (info.upload || 0) + (info.download || 0);
  const total = info.total || 0;
  const percent = total > 0 ? Math.floor((used / total) * 100) : 0;

  const lines = [];
  if (title) lines.push(`机场：${title}`);
  lines.push(`流量：${percent}% Ⅰ ${formatBytes(used)} ⮂ ${formatBytes(total,0)}`);
  if (info.expire) {
    const d = new Date(info.expire * 1000);
    lines.push(`到期：${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`);
  }
  return lines.join("\n");
}

// 主逻辑
(async () => {
  let texts = [];
  let hasError = false;
  const icon = "antenna.radiowaves.left.and.right.circle.fill";

  if (!urls.length) {
    texts.push("未填写订阅");
    hasError = true;
  } else {
    const results = await Promise.all(urls.map(u => fetchSubscription(u)));
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const title = titles[i] || `订阅${i + 1}`;

      if (!r || r.status !== 200) {
        if (r && r.error && r.error.includes("timeout")) {
          texts.push(`${title} 请求超时${timeout}ms`);
        } else if (r && r.status) {
          texts.push(`${title} HTTP错误${r.status}`);
        } else {
          texts.push(`${title} 请求失败`);
        }
        hasError = true;
        continue;
      }

      const info = parseSubscriptionInfo(r.headers || {});
      if (info) {
        texts.push(generateSubscriptionText(info, title));
      } else {
        texts.push(`${title} 非机场订阅或无流量信息`);
        hasError = true;
      }
    }
  }

  $done({
    title: "订阅信息",
    content: texts.join("\n\n"),
    icon: icon,
    "icon-color": hasError ? "#FF3B30" : "#29EA9C",
  });
})();

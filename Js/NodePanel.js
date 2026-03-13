const mask = $argument?.includes("mask=ON");

$httpClient.get({
  url: "http://ip-api.com/json/?lang=zh-CN",
  headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU OS 17_5 like Mac OS X)" },
  timeout: 3000
}, (err, resp, body) => {


  if (!resp || resp.status !== 200) {
    return $done({
      title: "节点信息",
      content: `请求失败${resp ? resp.status : "超时"}`
    });
  }

  const data = JSON.parse(body);
  let ip = data.query;


  if (mask) {
    ip = ip.replace(/([.:])([^.:]+)$/, (match, separator, lastPart) => {
      return separator + "*".repeat(lastPart.length);
    });
  }


  $done({
    title: "节点信息",
    content: `位置：${data.country} ${data.countryCode}\nIP址：${ip}\n运营：${data.isp}`
  });
});

const mask = $argument.includes("mask=ON");

const options = {
  url: "http://ip-api.com/json/?lang=zh-CN",
  headers: {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1"
  },
  timeout: 5000
};

$httpClient.get(options, (err, resp, body) => {

  if (!resp || resp.status !== 200) {
    const code = resp ? resp.status : "无响应";
    return $done({
      title: "节点信息",
      content: `HTTP错误：${code}`,
      icon: "location.circle.fill",
      "icon-color": "#FF3A3A"
    });
  }

  const data = JSON.parse(body);
  let ip = data.query;

  if (mask) {
    ip = ip.replace(/([.:])([^.:]+)$/, (m, sep, last) => sep + "*".repeat(last.length));
  }

  $done({
    title: "节点信息",
    content: `位置：${data.country} ${data.countryCode}\nIP址：${ip}\n运营：${data.isp}`,
    icon: "location.circle.fill",
    "icon-color": "#2FA3FF"
  });

});

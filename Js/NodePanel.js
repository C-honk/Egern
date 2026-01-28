const mask = $argument.includes("mask=ON");

$httpClient.get(
  { url: "http://ip-api.com/json/?lang=zh-CN", timeout: 5000 },
  (err, resp, body) => {
    let content, iconColor;

    if (err || !resp || resp.status !== 200) {
      content = `HTTP${resp?.status || "请求失败"}`;
      iconColor = "#FF4C4C";
    } else {
      let IP = JSON.parse(body);
      let ipAddr = IP.query;

      if (mask) {
        if (ipAddr.includes(".")) {
          let p = ipAddr.split(".");
          p[p.length - 1] = "*".repeat(p[p.length - 1].length);
          ipAddr = p.join(".");
        } else if (ipAddr.includes(":")) {
          let p = ipAddr.split(":");
          p[p.length - 1] = "*".repeat(p[p.length - 1].length);
          ipAddr = p.join(":");
        }
      }

      content = `位置：${IP.country}${IP.countryCode}\nIP址：${ipAddr}\n运营：${IP.isp}`;
      iconColor = "#2FA3FF";
    }

    $done({
      title: "节点信息",
      content,
      icon: "globe.asia.australia.fill",
      "icon-color": iconColor
    });
  }
);
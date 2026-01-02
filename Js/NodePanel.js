const mask = $argument.includes("mask=ON");

$httpClient.get({url: "http://ip-api.com/json/?lang=zh-CN",timeout: 5000},(err, resp, body) => {
    let content,iconColor;
    if (err || !resp || resp.status !== 200) {
        content = `HTTP${resp?.status || "请求失败"}`;
        iconColor = "#FF4C4C";
    } else {
        let IP = JSON.parse(body);
        let ipAddr = IP.query;
      
        if (mask) {
            if (ipAddr.includes(".")) {
                let parts = ipAddr.split(".");
                parts[3] = "***";
                ipAddr = parts.join(".");
            } else if (ipAddr.includes(":")) {
                let parts = ipAddr.split(":");
                parts[parts.length - 1] = "***";
                ipAddr = parts.join(":");
            }
        }

        content = `位置：${IP.country}${IP.countryCode}\n运营：${IP.isp}\nIP址：${ipAddr}`;
        iconColor = "#2FA3FF";
    }
    $done({
        title: "节点信息",
        content,
        icon: "globe.asia.australia.fill",
        "icon-color": iconColor
    });
});

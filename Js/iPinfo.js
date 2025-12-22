const url = "http://ipinfo.io/json";

let maskIP = false;
if (typeof $argument !== "undefined") {
    const arg = $argument.trim().toLowerCase();
    if (arg === "true" || arg === "maskip=true") maskIP = true;
}

const countryMap = {
    "HK": "香港",
    "TW": "台湾",
    "KR": "韩国",
    "JP": "日本",
    "DE": "德国",
    "FR": "法国",
    "GB": "英国",
    "US": "美国",
    "SG": "新加坡",
    "AU": "澳大利亚",
    "CA": "加拿大",
    "RU": "俄罗斯",
    "IN": "印度",
    "IT": "意大利",
    "ES": "西班牙",
    "BR": "巴西",
    "NL": "荷兰",
    "CH": "瑞士",
    "SE": "瑞典",
    "NO": "挪威",
    "DK": "丹麦",
    "FI": "芬兰",
    "PL": "波兰",
    "UA": "乌克兰",
    "MX": "墨西哥",
    "AE": "阿联酋",
    "SA": "沙特阿拉伯",
    "TR": "土耳其",
    "AR": "阿根廷",
    "ZA": "南非",
    "NZ": "新西兰",
    "MY": "马来西亚",
    "TH": "泰国",
    "PH": "菲律宾",
    "VN": "越南",
    "ID": "印度尼西亚"
};

function maskIPFn(ip) {
    if (!ip) return "";
    const parts = ip.split(".");
    return parts.length === 4 ? parts.slice(0, 3).join(".") + ".*" : ip;
}

$httpClient.get(url, function(error, response, body) {
    let content = "";
    let iconColor = "#007AFF";

    if (error || !body) {
        content = `请求失败：${error.message || error}`;
        iconColor = "#FF3B30";
    } else {
        const data = JSON.parse(body);
        let ip = data.ip;
        const countryCN = countryMap[data.country] || data.country;

        if (maskIP) ip = maskIPFn(ip);

        content = `地区：${countryCN}➣${data.country}\nIP址：${ip}`;
    }

    $done({
        title: "代理出站",
        content: content,
        icon: "globe.asia.australia.fill",
        "icon-color": iconColor
    });
});

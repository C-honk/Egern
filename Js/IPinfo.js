const argStr = ($argument || "").toUpperCase(); 
const maskValue = argStr.split("=")[1];
const maskIP = maskValue !== "NO";

function desensitize(ip) {
  return maskIP ? ip.replace(/(\d+\.\d+\.\d+)\.\d+$/, "$1.*") : ip;
}

// 国家代码映射表
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

const url = "http://ipinfo.io/json";

$httpClient.get(url, (error, response, data) => {
    let content = "";
    let iconColor = "#007AFF";

    if (response && response.status !== 200) {
        content = `状态码：${response.status}`;
        iconColor = "#FF3B30";
    } else if (data) {
        const obj = JSON.parse(data);
        const ip = desensitize(obj.ip);
        const org = obj.org ? obj.org.replace(/^AS\d+\s*/, "") : obj.org;
        const country = countryMap[obj.country] || obj.country;

        content = `IP：${ip}\n服务：${org}\n位置：${country}`;
    }

    $done({
        title: "节点信息",
        content,
        icon: "globe.asia.australia.fill",
        "icon-color": iconColor
    });
});

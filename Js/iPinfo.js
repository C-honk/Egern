const url = "http://ipinfo.io/json";
const riskUrl = "https://my.ippure.com/v1/info";

let maskIP = false;
let enableRisk = false;

if (typeof $argument !== "undefined") {
    const arg = $argument.toLowerCase();
    if (arg.includes("maskip=true")) maskIP = true;
    if (arg.includes("risk=true")) enableRisk = true;
}

const countryMap = {
    "HK": "香港", "TW": "台湾", "KR": "韩国", "JP": "日本", "DE": "德国", "FR": "法国",
    "GB": "英国", "US": "美国", "SG": "新加坡", "AU": "澳大利亚", "CA": "加拿大",
    "RU": "俄罗斯", "IN": "印度", "IT": "意大利", "ES": "西班牙", "BR": "巴西",
    "NL": "荷兰", "CH": "瑞士", "SE": "瑞典", "NO": "挪威", "DK": "丹麦", "FI": "芬兰",
    "PL": "波兰", "UA": "乌克兰", "MX": "墨西哥", "AE": "阿联酋", "SA": "沙特阿拉伯",
    "TR": "土耳其", "AR": "阿根廷", "ZA": "南非", "NZ": "新西兰", "MY": "马来西亚",
    "TH": "泰国", "PH": "菲律宾", "VN": "越南", "ID": "印度尼西亚"
};

function maskIPFn(ip) {
    const parts = ip.split(".");
    return parts.length === 4 ? parts.slice(0, 3).join(".") + ".*" : ip;
}

function getRiskLevel(score) {
    if (score <= 25) return "安全";
    if (score <= 50) return "中等";
    if (score <= 75) return "高危";
    return "极高";
}

const title = "当前节点";
const defaultColor = "#00DFFF";
const errorColor = "#FF3B30";
const iconName = "globe.asia.australia.fill";

$httpClient.get(url, function(error, response, body) {
    let iconColor = defaultColor;

    if (error || !body) {
        iconColor = errorColor;
        $done({ title, content: "", icon: iconName, "icon-color": iconColor });
        return;
    }

    const data = JSON.parse(body);
    let ip = data.ip;
    let countryCN = countryMap[data.country] || data.country;
    if (maskIP) ip = maskIPFn(ip);

    let finalContent = `地区：${countryCN} ${data.country}\nIP址：${ip}`;

    if (!enableRisk) {
        $done({ title, content: finalContent, icon: iconName, "icon-color": iconColor });
        return;
    }

    $httpClient.get(riskUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, function(e, r, bodyRisk) {
        if (e || !bodyRisk) {
            iconColor = errorColor;
        } else {
            try {
                const riskData = JSON.parse(bodyRisk);
                const score = riskData.fraudScore || 0;
                const risk = getRiskLevel(score);
                finalContent += `\n风险：${risk}`;
            } catch (err) {
                iconColor = errorColor;
            }
        }
        $done({ title, content: finalContent, icon: iconName, "icon-color": iconColor });
    });
});

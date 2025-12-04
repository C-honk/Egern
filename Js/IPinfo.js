let url = $request.url;
let body = $response.body;

if (/ipinfo\.io\/json/.test(url)) {
    let obj = JSON.parse(body);

    const map = {
        "HK": "香港",
        "JP": "日本",
        "KR": "韩国",
        "US": "美国",
        "GB": "英国",
        "FR": "法国",
        "DE": "德国"
    };

    const zh = map[obj.country];
    const en = obj.country;
    const isp = obj.org.replace(/AS\d+\s*/,"");
    
    obj = {
        "IP": obj.ip,
        "位置": zh + en,
        "运营": isp
    };
    body = JSON.stringify(obj);
}
$done({ body });

// 2026.3.26

let url = $request.url;
let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        if (/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)) {
            let d = obj.data;
            if (d) {
                if (d.allDayConfig && d.allDayConfig.fmRewards) {
                    delete d.allDayConfig.fmRewards;
                }
                const expireTime = new Date('2100-01-01T09:09:00+08:00').getTime();
                let p = d.payInfo;
                if (p) {
                    p.redFlower = 999;
                    p.isSignedBoolean = true;
                    p.isCtVipBoolean = true;
                    p.isCtPayVipBoolean = false;
                    p.ctExpireDate = expireTime;
                    p.isVip = 1;
                    p.signedCount = 999;
                    p.isVipBoolean = true;
                    p.isBigVipBoolean = true;
                    p.bigExpireDate = expireTime;
                    p.ctPayExpireDate = 0;
                    p.signType = 1;
                    p.bigPayExpireDate = 0;
                    p.actVipType = 0;
                    p.vipType = 1;
                    p.isBigPayVipBoolean = false;
                    p.payExpireDate = expireTime;
                    p.actExpireDate = expireTime;
                    p.isActVipBoolean = true;
                    p.isPayVipBoolean = true;
                    p.lastOrderPrice = 0;
                    p.lastOrderSigned = 0;
                    p.payVipType = 1;
                    p.isSigned = 1;
                    p.expireDate = expireTime;
                }
                let u = d.userInfo;
                if (u) {
                    u.status = 1;
                    u.isVip = 1;
                    u.vipType = 1;
                    u.gender = 1;
                    u.payVipType = 1;
                    u.authType = 1;
                }
            }
        } else if (/api\/service\/global\/config\/scene/.test(url)) {
            if (obj.data) {
                obj.data.showShopEntry = false;
                obj.data.idolTabShow = false;
                for (let key in obj.data) {
                    if (key !== "showShopEntry" && key !== "idolTabShow") {
                        delete obj.data[key];
                    }
                }
            }
        } else if (/api\/service\/home\/index/.test(url)) {
            if (obj.data && obj.data.moduleList) {
                let newList = [];
                for (let i = 0; i < obj.data.moduleList.length; i++) {
                    let m = obj.data.moduleList[i];
                    if (m.type !== 6 && m.type !== 2 && m.type !== 1 && m.type !== 8 && m.type !== 9) {
                        newList.push(m);
                    }
                }
                obj.data.moduleList = newList;
            }
        } else if (/api\/play\/sound\/effect\/list/.test(url)) {
            if (obj.data && obj.data.list) {
                for (let i = 0; i < obj.data.list.length; i++) {
                    obj.data.list[i].vipType = 'free';
                    obj.data.list[i].audition = 0;
                }
            }
        } else if (/api\/voice\/room\/v2\/sidebar/.test(url)) {
            if (obj.data && obj.data.sidebar) {
                obj.data.sidebar = obj.data.sidebar
                    .filter(item => ![1,17,18,21,26,28,31,32,33].includes(item.id))
                    .map(item => {
                        item.coverGif = "";
                        if (item.id === 4) item.name = "开车好歌";
                        else if (item.id === 10) item.name = "睡前轻松";
                        else if (item.id === 25) item.name = "城市漫步";
                        else if (item.id === 27) item.name = "次元精选";
                        else if (item.id === 30) item.name = "通勤好听";
                        else if (item.id === 3) item.name = "深夜放松";
                        return item;
                    });
            }
        }

        body = JSON.stringify(obj);

    } catch (e) {
        console.log("脚本执行异常", e);
    }
}
$done({ body });

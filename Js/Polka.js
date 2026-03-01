let url=$request.url;
let body=$response.body;

try{
    let obj=JSON.parse(body);

    if(/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)){
        let d=obj.data;
        if(d){
            if(d.allDayConfig&&d.allDayConfig.fmRewards){
                delete d.allDayConfig.fmRewards;
            }

            const expireTime=new Date('2099-09-09T09:09:00+08:00').getTime();

            let p=d.payInfo;
            if(p){
                p.redFlower=999;
                p.isSignedBoolean=true;
                p.isCtVipBoolean=true;
                p.isCtPayVipBoolean=false;
                p.ctExpireDate=expireTime;
                p.isVip=1;
                p.signedCount=999;
                p.isVipBoolean=true;
                p.isBigVipBoolean=true;
                p.bigExpireDate=expireTime;
                p.ctPayExpireDate=0;
                p.signType=1;
                p.bigPayExpireDate=0;
                p.actVipType=0;
                p.vipType=1;
                p.isBigPayVipBoolean=false;
                p.payExpireDate=expireTime;
                p.actExpireDate=expireTime;
                p.isActVipBoolean=true;
                p.isPayVipBoolean=true;
                p.lastOrderPrice=0;
                p.lastOrderSigned=0;
                p.payVipType=1;
                p.isSigned=1;
                p.expireDate=expireTime;
            }

            let u=d.userInfo;
            if(u){
                u.status=1;
                u.isVip=1;
                u.vipType=1;
                u.gender=1;
                u.payVipType=1;
                u.authType=1;
            }
        }
    }
    else if(/api\/service\/conf\/all/.test(url)){
        let g=obj.data&&obj.data.groupSign;
        if(g){
            g.adExitChange=0;
            g.adGuideTest=0;
            g.adStartAppDialog=0;
            g.playTips=0;
            g.freeDynamicChange=0;
        }
    }
    else if(/api\/service\/global\/config\/scene/.test(url)){
        let d=obj.data;
        if(d){
            d.showShopEntry=false;
            d.idolTabShow=false;
            d.playingPageCollectPagList=[];
            d.adsNotFinishVipPop4DayInterval=9999;
            d.AllDialogIntervals=9999;
            if(d.warmStartDialog) d.warmStartDialog.count=0;
            d.offlineFavTipsGuide=0;
            if(d.downLoadZoneConfig) d.downLoadZoneConfig.freeTimeRemindTip=0;
            if(d.iapNewConfig) d.iapNewConfig.enable=0;
            if(d.iapConfig) d.iapConfig.enable=0;
            d.iosAudioSessionManager_ErrAlert=false;
        }
    }
    else if(/api\/service\/home\/index/.test(url)){
        let list=obj.data&&obj.data.moduleList;
        if(Array.isArray(list)){
            obj.data.moduleList=list.filter(m=>![6,2,1,8,9].includes(m.type));
        }
    }
    else if(/api\/play\/sound\/effect\/list/.test(url)){
        let list=obj.data&&obj.data.list;
        if(Array.isArray(list)){
            list.forEach(item=>{
                item.vipType='free';
                item.audition=0;
            });
        }
    }
    else if(/abtest\/ui\/info/.test(url)){
        let map=obj.data&&obj.data.mapTestInfo;
        if(map){
            let modules=[
                map.DownloadAd&&map.DownloadAd.mapParams,
                map.DownloadAdios&&map.DownloadAdios.mapParams,
                map.WZDownloadAd&&map.WZDownloadAd.mapParams,
                map.DownloadZoneOptimizationAZ&&map.DownloadZoneOptimizationAZ.mapParams,
                map.adExpiresFreemodeShowad&&map.adExpiresFreemodeShowad.mapParams,
                map.BDLaunchApp&&map.BDLaunchApp.mapParams,
                map.insert&&map.insert.mapParams,
                map.CommentADPosition&&map.CommentADPosition.mapParams,
                map.DiscoverADPosition&&map.DiscoverADPosition.mapParams,
                map.ClickView&&map.ClickView.mapParams,
                map.hongbao&&map.hongbao.mapParams,
                map.Dynamiccoins&&map.Dynamiccoins.mapParams,
                map.Wanliu&&map.Wanliu.mapParams,
                map.bodianmvdialog&&map.bodianmvdialog.mapParams,
                map.FreeModVoiceReminder&&map.FreeModVoiceReminder.mapParams,
                map.MvTryShowAds&&map.MvTryShowAds.mapParams
            ];
            modules.forEach(mod=>{
                if(mod){
                    for(let k in mod) mod[k]="0";
                }
            });
        }
    }

    body=JSON.stringify(obj);

}catch(e){
    console.log("脚本执行异常", e);
}

$done({body});

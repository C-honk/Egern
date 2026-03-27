// 2026.03.27 08:11

export default async function (ctx) {
  let info = null,
    errorMessage = null;

  try {
    const res = await ctx.http.get(ctx.env.URL, {
      headers: { 'User-Agent': 'clash.meta/v1.19.16' }
    });

    if (res.status === 200) {
      const header = res.headers.get('subscription-userinfo');
      if (header) {
        const data = Object.fromEntries(
          header
            .split(';')
            .map(i => i.trim().split('='))
            .filter(i => i.length === 2)
        );

        const upload = parseInt(data.upload || 0);
        const download = parseInt(data.download || 0);
        const total = parseInt(data.total || 0);
        const expireTime = Number(data.expire || 0);

        const used = upload + download;
        const remain = Math.max(0, total - used);
        const ratio = total > 0 ? Math.min(1, used / total) : 0;

        const format = v => {
          if (!v) return '0 B';
          const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
          let i = 0;
          while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
          }
          return (v % 1 === 0 ? v : v.toFixed(1)) + ' ' + units[i];
        };

        const pad = n => String(n).padStart(2, '0');

        info = {
          total: format(total),
          used: format(used),
          remain: format(remain),
          ratio,
          expire:
            expireTime > 0
              ? (() => {
                  const d = new Date(expireTime * 1000);
                  return `到期${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(
                    d.getDate()
                  )}`;
                })()
              : '永久'
        };
      } else {
        errorMessage = '无流量信息';
      }
    } else {
      errorMessage = `HTTP ${res.status}`;
    }
  } catch (e) {
    errorMessage = e.message || '请求失败';
  }

  const progressColor = !info
    ? '#9A9AD4'
    : info.ratio > 0.9
    ? '#E86253'
    : info.ratio > 0.7
    ? '#E8985A'
    : '#549EF2';

  return {
    type: 'widget',
    refreshAfter: new Date(Date.now() + 300 * 1000).toISOString(),
    backgroundColor: { light: '#FFFFFF', dark: '#1E1E1E' },
    padding: 17,
    gap: 10,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        children: [
          { type: 'image', src: 'sf-symbol:chart.bar.fill', width: 14, height: 14 },
          {
            type: 'text',
            text: errorMessage ? '请求失败' : ctx.env['备注'] || '订阅流量',
            font: { size: 14, weight: 'regular' },
            textColor: { light: '#1C1C1E', dark: '#FFFFFF' }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: info ? info.expire : '-',
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#414141', dark: '#DEDEDE' },
            maxLines: 1
          }
        ]
      },
      { type: 'stack', height: 1, backgroundColor: { light: '#1C1C1E', dark: '#FFFFFF' }, borderRadius: 1 },
      {
        type: 'stack',
        direction: 'row',
        height: 13,
        borderRadius: 6,
        clip: true,
        backgroundColor: { light: '#F2F2F7', dark: '#2C2C2E' },
        margin: [0, 0, 5, 0],
        children: [
          { type: 'stack', height: 13, flex: info?.ratio || 0, minWidth: 6, backgroundColor: progressColor },
          { type: 'stack', height: 13, flex: 1 - (info?.ratio || 0), backgroundColor: 'transparent' }
        ]
      },
      {
        type: 'stack',
        direction: 'row',
        gap: 5,
        padding: [10, 10],
        backgroundColor: { light: '#F2F2F7', dark: '#2C2C2E' },
        borderRadius: 12,
        children: [
          card('全部', info?.total || '-', '#7587FE'),
          divider(),
          card('已用', info?.used || '-', progressColor),
          divider(),
          card('剩余', info?.remain || '-', '#64C298')
        ]
      }
    ]
  };
}

function card(label, value, color) {
  return {
    type: 'stack',
    direction: 'column',
    flex: 1,
    gap: 5,
    padding: [4, 6],
    borderRadius: 10,
    alignItems: 'center',
    children: [
      { type: 'text', text: label, font: { size: 12, weight: 'medium' }, textColor: { light: '#5C5C5C', dark: '#D2D2D6' }, textAlign: 'center' },
      { type: 'text', text: value, font: { size: 12, weight: 'medium' }, textColor: color, maxLines: 1, minScale: 0.6, textAlign: 'center' }
    ]
  };
}

function divider() {
  return {
    type: 'stack',
    width: 1,
    height: 30,
    alignSelf: 'center',
    backgroundColor: { light: '#D1D1D6', dark: '#3A3A3C' }
  };
}

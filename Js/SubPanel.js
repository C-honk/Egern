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
          header.split(';')
            .map(i => i.trim().split('='))
            .filter(i => i.length === 2)
        );

        const upload = parseInt(data.upload || 0, 10) || 0;
        const download = parseInt(data.download || 0, 10) || 0;
        const total = parseInt(data.total || 0, 10) || 0;
        const expireTime = Number(data.expire || 0) || 0;

        const used = upload + download;
        const remain = Math.max(0, total - used);
        const ratio = total > 0 ? Math.min(1, used / total) : 0;
        const percent = Math.round(ratio * 100);

        const format = v => {
          if (!v) return '0 B';
          const units = ['B', 'KB', 'MB', 'GB', 'TB'];
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
          percent,
          expire: expireTime > 0
            ? (() => {
                const d = new Date(expireTime * 1000);
                return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
              })()
            : '永久订阅'
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
    ? '#DF494A'
    : info.ratio > 0.9
      ? '#DF5F5F'
      : info.ratio > 0.7
        ? '#DF9260'
        : '#7E8FDF';

  return {
    type: 'widget',
    refreshAfter: new Date(Date.now() + 3600000).toISOString(),
    backgroundColor: { light: '#FFFFFF', dark: '#1E1E1E' },
    padding: 16,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        padding: [-4, 0, 0, 0],
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
            text: info ? `到期${info.expire}` : '无数据',
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#666666', dark: '#AAAAAA' }
          }
        ]
      },
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        height: 15,
        alignItems: 'center',
        children: [
          { type: 'stack', flex: Math.max(info?.ratio - 0.01, 0) },
          {
            type: 'text',
            text: info ? `${info.percent}%` : '-',
            font: { size: 11, weight: 'semibold' },
            textColor: progressColor
          },
          { type: 'stack', flex: 1 - (info?.ratio || 0) }
        ]
      },
      {
        type: 'stack',
        direction: 'row',
        height: 9,
        borderRadius: 4,
        clip: true,
        backgroundColor: { light: '#EDEDF0', dark: '#2C2C2E' },
        children: [
          { type: 'stack', height: 20, flex: Math.max(0.001, info?.ratio || 0), backgroundColor: progressColor },
          { type: 'stack', height: 20, flex: 1 - (info?.ratio || 0), backgroundColor: 'transparent' }
        ]
      },
      { type: 'spacer' },
      {
        type: 'stack',
        direction: 'row',
        gap: 6,
        height: 60,
        padding: [6, 8],
        backgroundColor: { light: '#F4F4F6', dark: '#2C2C2E' },
        borderRadius: 12,
        children: [
          card('全部', info?.total || '-', '#DF8EA6'),
          divider(),
          card('已用', info?.used || '-', progressColor),
          divider(),
          card('剩余', info?.remain || '-', '#1293DF')
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    children: [
      { type: 'text', text: label, font: { size: 12 }, textColor: { light: '#343436', dark: '#CCCCCC' } },
      { type: 'text', text: value, font: { size: 13, weight: 'regular' }, textColor: color, maxLines: 1, minScale: 0.7 }
    ]
  };
}

function divider() {
  return {
    type: 'stack',
    width: 1,
    height: 27,
    alignSelf: 'center',
    backgroundColor: { light: '#DDD', dark: '#3A3A3C' }
  };
}

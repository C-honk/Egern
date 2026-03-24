export default async function (ctx) {
  let info = null;
  let errorMessage = null;

  try {
    const res = await ctx.http.get(ctx.env.URL, {
      headers: { 'User-Agent': 'clash.meta' }
    });

    if (res.status === 200) {
      const header = res.headers.get('subscription-userinfo');

      if (header) {
        const data = Object.fromEntries(
          header.split(';').map(i => i.trim().split('='))
        );

        const upload = parseInt(data.upload || 0);
        const download = parseInt(data.download || 0);
        const total = parseInt(data.total || 0);
        const expireTime = parseInt(data.expire);

        const used = upload + download;
        const remain = total - used;

        const format = (v) => {
          if (!v) return '0 B';
          const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
          let i = 0;
          while (v >= 1024 && i < units.length - 1) {
            v /= 1024;
            i++;
          }
          return (v % 1 === 0 ? v : v.toFixed(2)) + ' ' + units[i];
        };

        info = {
          total: format(total),
          used: format(used),
          remain: format(remain),
          expire: expireTime && expireTime > 0
            ? (() => {
                const d = new Date(expireTime * 1000);
                return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
              })()
            : '订阅永久'
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

  const colorMap = {
    total: '#34C759',
    used: '#FF9500',
    remain: '#3599ED',
    expire: '#DE5858'
  };

  const errorColor = '#FF3B30';

  return {
    type: 'widget',
    refreshAfterDate: new Date(Date.now() + 300 * 1000),
    backgroundGradient: {
      type: 'linear',
      colors: [
        { light: '#EEEEEE', dark: '#252525' },
        { light: '#C5DAF3', dark: '#2F3A46' }
      ],
      stops: [0, 1.0],
      startPoint: { x: 0, y: 0 },
      endPoint: { x: 1, y: 1 }
    },
    padding: 17,
    gap: 10,
    children: [
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 6,
        children: [
          {
            type: 'image',
            src: 'sf-symbol:antenna.radiowaves.left.and.right.circle.fill',
            width: 14,
            height: 14
          },
          {
            type: 'text',
            text: errorMessage ? '订阅异常' : ctx.env['备注'] || '订阅流量',
            font: { size: 14, weight: 'regular' },
            textColor: errorMessage
              ? errorColor
              : { light: '#1C1C1E', dark: '#FFFFFF' }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: new Date().toTimeString().slice(0, 5),
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#545454', dark: '#D0D0D0' },
            lineLimit: 1
          }
        ]
      },
      {
        type: 'stack',
        height: 1,
        backgroundColor: { light: '#1C1C1E', dark: '#FFFFFF' },
        borderRadius: 0.5
      },
      ...(errorMessage
        ? [
            {
              type: 'stack',
              direction: 'row',
              alignItems: 'center',
              gap: 8,
              children: [
                {
                  type: 'text',
                  text: errorMessage,
                  font: { size: 14, weight: 'regular' },
                  textColor: errorColor,
                  lineLimit: 2
                }
              ]
            }
          ]
        : [
            row('icloud.circle.fill', '总量', info.total, colorMap.total),
            row('chart.line.uptrend.xyaxis.circle.fill', '已用', info.used, colorMap.used),
            row('chart.pie.fill', '剩余', info.remain, colorMap.remain),
            row('calendar.circle.fill', '到期', info.expire, colorMap.expire)
          ])
    ]
  };
}

function row(icon, label, value, color) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    gap: 8,
    children: [
      {
        type: 'image',
        src: `sf-symbol:${icon}`,
        width: 14,
        height: 14,
        color: color
      },
      {
        type: 'text',
        text: `${label}：`,
        font: { size: 14, weight: 'regular' },
        textColor: { light: '#1C1C1E', dark: '#FFFFFF' }
      },
      {
        type: 'text',
        text: value,
        font: { size: 14, weight: 'regular' },
        textColor: { light: '#1C1C1E', dark: '#E5E5E7' },
        lineLimit: 1
      }
    ]
  };
}

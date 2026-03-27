// 2026.03.28 04:17

export default async function (ctx) {
  let ipData, riskData;
  let failed = false;

  try {
    ipData = await (await ctx.http.get('https://ipwho.is/?lang=zh-CN')).json();
    riskData = await (await ctx.http.get('http://my.ippure.com/v1/info')).json();
  } catch (e) {
    failed = true;
  }

  if (!ipData) {
    ipData = {
      ip: '-',
      country: '-',
      connection: { isp: '-' }
    };
  }
  if (!riskData) {
    riskData = { isResidential: null };
  }

  let displayIP = ipData.ip || '-';
  if (ctx.env.IP === 'true' || ctx.env.IP === true) {
    const sep = displayIP.includes(':') ? ':' : '.';
    const parts = displayIP.split(sep);
    if (parts.length > 1) {
      parts[parts.length - 1] = '*'.repeat(parts[parts.length - 1].length);
      displayIP = parts.join(sep);
    }
  }
  ipData.ip = displayIP;

  const typeText =
    riskData.isResidential === null
      ? '-'
      : riskData.isResidential
      ? '家宽住宅IP'
      : '机房广播IP';

  return {
    type: 'widget',
    refreshAfterDate: new Date(Date.now() + 60 * 1000),
    backgroundColor: {
      light: '#FFFFFF',
      dark: '#1E1E1E'
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
            src: 'sf-symbol:globe',
            width: 14,
            height: 14
          },
          {
            type: 'text',
            text: failed ? '请求失败' : '节点信息',
            font: { size: 14, weight: 'regular' },
            textColor: { light: '#1C1C1E', dark: '#FFFFFF' }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: '更新于 ' + new Date().toTimeString().slice(0, 5),
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#414141', dark: '#DEDEDE' }
          }
        ]
      },
      {
        type: 'stack',
        height: 1,
        backgroundColor: { light: '#1C1C1E', dark: '#FFFFFF' }
      },
      buildRow('globe.asia.australia.fill','IP址', ipData.ip, '#08C77A'),
      buildRow('location.circle.fill','位置', ipData.country, '#3599FA'),
      buildRow('antenna.radiowaves.left.and.right.circle.fill','服务', ipData.connection?.isp || '-', '#998EE3'),
      buildRow('internaldrive.fill','检测', typeText, '#D48388')
    ]
  };
}

function buildRow(symbol, label, value, color) {
  return {
    type: 'stack',
    direction: 'row',
    alignItems: 'center',
    gap: 8,
    children: [
      {
        type: 'image',
        src: `sf-symbol:${symbol}`,
        width: 14,
        height: 14,
        color: color
      },
      {
        type: 'text',
        text: `${label}`,
        font: { size: 14 },
        textColor: color
      },
      {
        type: 'text',
        text: value,
        font: { size: 14 },
        lineLimit: 1
      }
    ]
  };
}

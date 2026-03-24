//2026.03.25.04.29

export default async function (ctx) {
  const ipData = await (await ctx.http.get('https://ipwho.is/?lang=zh-CN')).json();

  let displayIP = ipData.ip;
  if (ctx.env.IP === 'true' || ctx.env.IP === true) {
    const sep = displayIP.includes(':') ? ':' : '.';
    const parts = displayIP.split(sep);
    if (parts.length > 1) {
      parts[parts.length - 1] = '*'.repeat(parts[parts.length - 1].length);
      displayIP = parts.join(sep);
    }
  }
  ipData.ip = displayIP;

  const riskData = await (await ctx.http.get('http://my.ippure.com/v1/info')).json();
  const isResidential = riskData.isResidential;
  const typeText = isResidential ? '家宽住宅IP' : '机房广播IP';

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
            text: '节点信息',
            font: { size: 14, weight: 'regular' },
            textColor: { light: '#1C1C1E', dark: '#FFFFFF' }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: new Date().toTimeString().slice(0, 5),
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#414141', dark: '#DEDEDE' },
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
      buildRow('globe.asia.australia.fill','IP址', ipData.ip, '#09D180'),
      buildRow('location.circle.fill','位置', ipData.country, '#4891E9'),
      buildRow('antenna.radiowaves.left.and.right.circle.fill','运营', ipData.connection.isp, '#998EE3'),
      {
        type: 'stack',
        direction: 'row',
        alignItems: 'center',
        gap: 8,
        children: [
          {
            type: 'image',
            src: 'sf-symbol:internaldrive.fill',
            width: 14,
            height: 14,
            color: '#5AC8FA'
          },
          {
            type: 'text',
            text: '检测：',
            font: { size: 14, weight: 'regular' },
            textColor: { light: '#1C1C1E', dark: '#FFFFFF' }
          },
          {
            type: 'text',
            text: typeText,
            font: { size: 14, weight: 'regular' },
            textColor: { light: '#1C1C1E', dark: '#E5E5E7' },
            lineLimit: 1
          }
        ]
      }
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

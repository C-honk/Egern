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
  const typeText = isResidential ? '住宅IP' : '机房IP';

  const typeColor = isResidential ? '#007AFF' : '#FF7272';

  const colorMap = {
    ip: '#007AFF',
    location: '#34C759',
    isp: '#998EE3'
  };

  return {
    type: 'widget',
    refreshAfterDate: new Date(Date.now() + 60 * 1000),
    backgroundColor: { light: '#EDEDED', dark: '#232323' },
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
            src: 'sf-symbol:server.rack',
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
            text: new Date().toTimeString().slice(0,5),
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

      buildRow('network', 'IP址', ipData.ip, colorMap.ip),
      buildRow('location.circle', '位置', ipData.country, colorMap.location),
      buildRow('antenna.radiowaves.left.and.right.circle', '运营', ipData.connection.isp, colorMap.isp),
      buildRow('internaldrive.fill', '类型', typeText, typeColor)
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

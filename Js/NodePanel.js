export default async function (ctx) {
  let ipData, riskData;
  let failed = false;

  try {
    ipData = await (await ctx.http.get('https://ipwho.is/?lang=zh-CN')).json();
    riskData = await (await ctx.http.get('http://my.ippure.com/v1/info')).json();
  } catch (e) {
    failed = true;
  }

  if (!ipData) ipData = { ip: '-', country: '-', region: '-', connection: { isp: '-' } };
  if (!riskData) riskData = { isResidential: null };

  let displayIP = ipData.ip || '-';
  if (ctx.env.IP === 'true' || ctx.env.IP === true) {
    const sep = displayIP.includes(':') ? ':' : '.';
    const parts = displayIP.split(sep);
    if (parts.length > 1) parts[parts.length - 1] = '*'.repeat(parts[parts.length - 1].length);
    displayIP = parts.join(sep);
  }
  ipData.ip = displayIP;

  const ipTypeText =
    riskData.isResidential === null
      ? '-'
      : riskData.isResidential
      ? '家宽住宅IP'
      : '机房广播IP';

  return {
    type: 'widget',
    refreshAfter: new Date(Date.now() + 300000).toISOString(),
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
          { type: 'image', src: 'sf-symbol:globe.asia.australia.fill', width: 14, height: 14 },
          {
            type: 'text',
            text: failed ? '请求失败' : '节点信息',
            font: { size: 14, weight: 'regular' }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: new Date().toTimeString().slice(0, 5),
            font: { size: 13, weight: 'regular' },
            textColor: { light: '#666666', dark: '#AAAAAA' }
          }
        ]
      },
      {
        type: 'stack',
        direction: 'column',
        gap: 1,
        padding: [18, 0, -4, 0],
        children: [
          buildRow('globe', 'IP址：', ipData.ip, '#29C18B'),
          buildRow('location.circle.fill', '位置：', `${ipData.country}`, '#3599FA'),
          buildRow('antenna.radiowaves.left.and.right.circle.fill', '服务：', ipData.connection?.isp || '-', '#998EE3'),
          buildRow('internaldrive.fill', '检测：', ipTypeText, '#D48388')
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
      { type: 'image', src: `sf-symbol:${symbol}`, width: 14, height: 14, color: color },
      { type: 'text', text: label, font: { size: 14 }, flex: 0 },
      { type: 'text', text: value, font: { size: 14 }, lineLimit: 1, flex: 1, textColor: color }
    ]
  };
}

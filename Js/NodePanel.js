export default async function (ctx) {
  let hasError = false;

  const [ipData, riskData] = await Promise.all([
    ctx.http.get('https://ipwho.is/?lang=zh-CN').then(r => r.json()).catch(() => null),
    ctx.http.get('http://my.ippure.com/v1/info').then(r => r.json()).catch(() => null)
  ]).catch(() => {
    hasError = true;
    return [null, null];
  });

  const ip = ipData?.ip || '-';
  const country = ipData?.country || '-';
  const isp = ipData?.connection?.isp || '-';
  const isResidential = riskData?.isResidential ?? null;

  let displayIP = ip;
  if (ctx.env.IP === true || ctx.env.IP === 'true') {
    const sep = displayIP.includes(':') ? ':' : '.';
    const parts = displayIP.split(sep);
    if (parts.length > 1) {
      parts[parts.length - 1] = '*'.repeat(parts[parts.length - 1].length);
    }
    displayIP = parts.join(sep);
  }

  const ipType =
    isResidential === null
      ? '-'
      : isResidential
      ? '家宽住宅IP'
      : '机房广播IP';

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
          { type: 'image', src: 'sf-symbol:globe.asia.australia.fill', width: 14, height: 14 },
          {
            type: 'text',
            text: hasError ? '请求失败' : '节点信息',
            font: { size: 14 }
          },
          { type: 'spacer' },
          {
            type: 'text',
            text: new Date().toTimeString().slice(0, 5),
            font: { size: 13 },
            textColor: { light: '#666', dark: '#AAA' }
          }
        ]
      },
      {
        type: 'stack',
        direction: 'column',
        gap: 6,
        padding: [18, 0, -5, 0],
        children: [
          row('globe', 'IP址：', displayIP, '#70C777'),
          row('location.circle.fill', '位置：', country, '#3599FA'),
          row('antenna.radiowaves.left.and.right.circle.fill', '服务：', isp, '#ED8585'),
          row('internaldrive.fill', '检测：', ipType, '#61C1C3')
        ]
      }
    ]
  };
}

const row = (icon, label, value, color) => ({
  type: 'stack',
  direction: 'row',
  alignItems: 'center',
  gap: 6,
  children: [
    { type: 'image', src: `sf-symbol:${icon}`, width: 14, height: 14, color },
    { type: 'text', text: label, font: { size: 14 } },
    { 
      type: 'text', 
      text: value, 
      font: { size: 14 }, 
      flex: 1, 
      lineLimit: 1,
      textColor: { light: '#3C3C3C', dark: '#DDDDDD' }
    }
  ]
});

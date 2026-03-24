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
    ip: '#09D180',
    location: '#4891E9',
    isp: '#998EE3'
  };

  const isDark =
    ctx.widgetFamily !== undefined ? ctx.colorScheme === 'dark' : false;

  const gradient = {
    type: 'linear',
    colors: [
      { light: '#EEEEEE', dark: '#252525' },
      { light: '#C5DAF3', dark: '#2F3A46' }
    ],
    stops: [0, 1.0],
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 1, y: 1 }
  };

  return {
    type: 'widget',
    refreshAfterDate: new Date(Date.now() + 60 * 1000),
    backgroundGradient: gradient,
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
            src: 'sf-symbol:globe.asia.australia.fill',
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

      buildRow('map.circle.fill', 'IP址', ipData.ip, colorMap.ip),
      buildRow('location.circle.fill', '位置', ipData.country, colorMap.location),
      buildRow(
        'antenna.radiowaves.left.and.right.circle.fill',
        '运营',
        ipData.connection.isp,
        colorMap.isp
      ),
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

export default async function(ctx) {
    let data;
    try {
        const resp = await ctx.http.get("http://ip-api.com/json/?lang=zh-CN");
        data = await resp.json();
    } catch (e) {
        return {
            type: "widget",
            padding: 16,
            children: [{ type: "text", text: "网络连接失败", textColor: "#FF3B30", font: { size: 12 } }]
        };
    }

    const isSmall = ctx.widgetFamily === 'systemSmall';
    let displayIP = data.query;
    
    if (ctx.env.IP掩码 === "true" || ctx.env.IP掩码 === true) {
        const isV6 = displayIP.includes(':');
        const separator = isV6 ? ':' : '.';
        const parts = displayIP.split(separator);
        const lastIndex = parts.length - 1;
        parts[lastIndex] = "*".repeat(parts[lastIndex].length);
        displayIP = parts.join(separator);
    }

    return {
        type: "widget",
        padding: 12,
        backgroundGradient: {
            type: "linear",
            colors: [
                { light: "#F8F9FB", dark: "#232931" }, 
                { light: "#E2E8F0", dark: "#101318" },
                { light: "#F8F9FB", dark: "#050505" }
            ],
            stops: [0, 0.5, 1],
            startPoint: { x: 0.2, y: 0 },
            endPoint: { x: 0.8, y: 1 }
        },
        children: [
            {
                type: "stack",
                direction: "row",
                alignItems: "center",
                children: [
                    { type: "image", src: "sf-symbol:network", color: "#007AFF", width: 14, height: 14 },
                    { type: "spacer", length: 4 },
                    { type: "text", text: "节点信息", font: { size: 12, weight: "bold" }, textColor: { light: "#475569", dark: "#94A3B8" } },
                    { type: "spacer" }, 
                    {
                        type: "date",
                        date: new Date().toISOString(),
                        format: "time",
                        font: { size: 10 },
                        textColor: { light: "#94A3B8", dark: "#64748B" }
                    }
                ]
            },
            { type: "spacer", flex: 1 },
            {
                type: "stack",
                direction: "row",
                children: [
                    { type: "spacer", flex: 1 },
                    {
                        type: "text",
                        text: displayIP,
                        font: { 
                            size: displayIP.includes(':') ? (isSmall ? 13 : 15) : (isSmall ? 20 : 24), 
                            weight: "heavy", 
                            family: "Menlo" 
                        },
                        textColor: { light: "#1E293B", dark: "#F8FAFC" },
                        shadowColor: { light: "#00000010", dark: "#000000A0" },
                        shadowRadius: 4
                    },
                    { type: "spacer", flex: 1 }
                ]
            },
            { type: "spacer", flex: 1 },
            {
                type: "stack",
                direction: "column",
                padding: 10,
                backgroundColor: { light: "#FFFFFFCC", dark: "#FFFFFF0A" }, 
                borderRadius: 10,              
                borderWidth: 0.5,             
                borderColor: { light: "#E2E8F0", dark: "#334155" },     
                children: [
                    {
                        type: "text", 
                        text: data.country, 
                        font: { size: 11, weight: "bold" }, 
                        textColor: { light: "#334155", dark: "#E2E8F0" } 
                    },
                    { type: "spacer", length: 2 },
                    { 
                        type: "text", 
                        text: data.isp, 
                        font: { size: 10, family: "Menlo" }, 
                        textColor: { light: "#64748B", dark: "#94A3B8" },
                        maxLines: 1 
                    }
                ]
            }
        ]
    };
}

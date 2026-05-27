import geoip from "geoip-lite";
const UAParser = require("ua-parser-js");

export const parseDevice = (userAgent: string) => {
    const parser = new UAParser(userAgent);

    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const type = parser.getDevice().type || "desktop";

    return {
        browser,
        os,
        type,
    };
};
export const getDeviceKey = (meta: any) => {
    return `${meta.browser}-${meta.os}-${meta.device}`;
};

export const getCountryFromIP = (ip: string) => {
    const geo = geoip.lookup(ip);
    return geo?.country || "unknown";
};

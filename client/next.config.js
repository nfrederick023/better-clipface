const config = require("config");

module.exports = {
    publicRuntimeConfig: {
        // Will be available on both server and client
        headerTitle: config.get("header_title"),
        pageTitle: config.get("page_title"),
    },
    compiler: {
        // ssr and displayName are configured by default
        styledComponents: true,
    },
}

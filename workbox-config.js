module.exports = {
    globDirectory: "public/",
    globPatterns: ["**/*.{html,ico,json,js,css}", "src/images/*.{jpg,png}"],
    swDest: "public/workbox_sw.js",
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
};

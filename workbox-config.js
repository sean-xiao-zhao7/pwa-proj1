module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{html,ico,json,js,css,png,jpg}'
	],
	swDest: 'public/workbox_sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
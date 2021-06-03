export const section1 = {
	id: 'about',
	lightBg: false,
	lightText: true,
	lightTextDesc: true,
	topLine: 'Currently supports 2 versions',
	headLine: 'Windows and Android Devices',
	description: 'View their respective repositories on GitHub for instructions on how to opt-in.',
	imgStart: false,
	img: require('../../assets/svgMultipleDevices.svg').default,
	imgWidth: '400px',
	imgHeight: '500px',
	alt: 'PC and Android Devices'
};

export const section2 = {
	id: 'about',
	lightBg: true,
	lightText: false,
	lightTextDesc: false,
	topLine: 'Completely optional',
	headLine: 'Optional submission of stats to AWS DB',
	description: 'All stats collected by AWS DB does not contain any identifiable information.',
	imgStart: true,
	img: require('../../assets/svgChartsAndGraphs.svg').default,
	imgWidth: '400px',
	imgHeight: '500px',
	alt: 'Statistics',
	svgPattern: true
};

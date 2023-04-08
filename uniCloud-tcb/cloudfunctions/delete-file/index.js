'use strict';
exports.main = async (event, context) => {
	let res = await uniCloud.deleteFile({
		fileList: event.fileList
	});

	return res;
};
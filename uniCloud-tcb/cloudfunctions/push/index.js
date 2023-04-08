'use strict';

const uniPush = uniCloud.getPushManager({
	appId: "__UNI__E179C2C"
});

exports.main = async (event, context) => {
	return await uniPush.sendMessage({
		user_id: event.user_id,
		payload: event.payload
	});
};
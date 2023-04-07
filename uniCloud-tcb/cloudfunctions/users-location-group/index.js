'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const $ = db.command.aggregate;

	let cityGroup = await db.collection("uni-id-users").aggregate()
		.group({
			_id: "$city",
			city_lng: $.first("$city_lng"),
			city_lat: $.first("$city_lat"),
			list: $.push({
				user_id: "$_id",
				avatar_url: "$avatar_file.url"
			}),
		})
		.project({
			city: "$_id.city",
			city_lng: 1,
			city_lat: 1,
			list: 1
		})
		.end();

	let districtGroup = await db.collection("uni-id-users").aggregate()
		.match({
			city: event.city
		})
		.group({
			_id: "$district",
			district_lng: $.first("$district_lng"),
			district_lat: $.first("$district_lat"),
			list: $.push({
				user_id: "$_id",
				avatar_url: "$avatar_file.url"
			}),
		})
		.project({
			district: "$_id.district",
			district_lng: 1,
			district_lat: 1,
			list: 1
		})
		.end();

	return event.city ? districtGroup : cityGroup;
};
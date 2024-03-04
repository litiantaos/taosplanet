'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const $ = db.command.aggregate;

	if (event.city) {
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
				count: $.sum(1)
			})
			.sort({
				register_date: -1
			})
			.limit(5)
			.project({
				district: "$_id.district",
				district_lng: 1,
				district_lat: 1,
				list: 1,
				count: 1
			})
			.end();

		return districtGroup;
	} else {
		let cityGroup = await db.collection("uni-id-users").aggregate()
			.group({
				_id: "$city",
				city_lng: $.first("$city_lng"),
				city_lat: $.first("$city_lat"),
				list: $.push({
					user_id: "$_id",
					avatar_url: "$avatar_file.url"
				}),
				count: $.sum(1)
			})
			.sort({
				register_date: -1
			})
			.limit(5)
			.project({
				city: "$_id.city",
				city_lng: 1,
				city_lat: 1,
				list: 1,
				count: 1
			})
			.end();

		return cityGroup;
	}
};
export function getReGeocode(param) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "https://restapi.amap.com/v3/geocode/regeo?key=8d3d3ff4e265c5f36892ec241fe737c0&location=" +
				param,
			success: res => {
				let rd = res.data.regeocode.addressComponent;
				let data = {
					adcode: rd.adcode,
					province: rd.province,
					city: rd.city,
					district: rd.district
				};

				resolve(data);
			},
			fail: err => {
				reject(err);
			}
		});
	});
}

export function getDistrict(param) {
	return new Promise((resolve, reject) => {
		uni.request({
			url: "https://restapi.amap.com/v3/config/district?key=8d3d3ff4e265c5f36892ec241fe737c0&keywords=" +
				param,
			success: res => {
				// console.log(res);
				let data = res.data.districts[0];

				resolve(data);
			},
			fail: (err) => {
				reject(err);
			}
		})
	})
}
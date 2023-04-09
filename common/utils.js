export function isValidUrl(str) {
	const pattern = new RegExp(
		"^(https?:\\/\\/)?" +
		"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
		"((\\d{1,3}\\.){3}\\d{1,3}))" +
		"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
		"(\\?[;&a-z\\d%_.~+=-]*)?" +
		"(\\#[-a-z\\d_]*)?$",
		"i"
	);
	return pattern.test(str);
}

export const debounce = function(func, wait = 1000, immediate = true) {
	let timer;
	return function() {
		let context = this,
			args = arguments;
		if (timer) clearTimeout(timer);
		if (immediate) {
			let callNow = !timer;
			timer = setTimeout(() => {
				timer = null;
			}, wait);
			if (callNow) func.apply(context, args);
		} else {
			timer = setTimeout(() => {
				func.apply(context, args);
			}, wait);
		}
	}
}

export const throttle = function(func, wait = 2000, type = 1) {
	let previous = 0,
		timer;
	return function() {
		let context = this,
			args = arguments;
		if (type === 1) {
			let now = Date.now();

			if (now - previous > wait) {
				func.apply(context, args);
				previous = now;
			}
		} else if (type === 2) {
			if (!timer) {
				timer = setTimeout(() => {
					timer = null;
					func.apply(context, args);
				}, wait);
			}
		}
	}
}
import posts from "./modules/posts.js";
import messages from "./modules/messages.js";

import {
	createStore
} from "vuex";

const store = createStore({
	modules: {
		posts,
		messages
	}
});

export default store;
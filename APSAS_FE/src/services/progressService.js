// src/services/progressService.js
import api from "./api";

// Normalize ProgressDTO (from /progress/{id}/current) to UI-friendly shape
function mapProgressDtoToUi(data) {
	const daily = Array.isArray(data?.dailyScoreDTOList) ? data.dailyScoreDTOList : [];

	const activityData = daily.map((d, idx) => ({
		date: d?.date ?? `D${idx + 1}`,
		score: Number(d?.score ?? d?.value ?? 0) || 0,
	}));

	const totalCourses = Number(data?.totalCourses ?? 0) || 0;
	const completed = Number(data?.completedCourses ?? 0) || 0;
	const averageScore = Number(data?.averageScore ?? data?.average ?? 0) || 0;
	const completionRate = averageScore;

	return {
		rawProgress: daily,
		stats: { totalCourses, completed, averageScore, completionRate },
		activityData,
		currentCourses: Array.isArray(data?.currentCourses) ? data.currentCourses : [],
		achievements: Array.isArray(data?.achievements) ? data.achievements : [],
	};
}

// Map legacy list response (unknown shape) into a safe UI shape
function mapLegacyListToUi(list) {
	if (!Array.isArray(list)) {
		return {
			rawProgress: [],
			stats: { totalCourses: 0, completed: 0, averageScore: 0, completionRate: 0 },
			activityData: [],
			currentCourses: [],
			achievements: [],
		};
	}

	// Best-effort mapping: count items as courses, assume `completed` boolean if present
	const totalCourses = list.length;
	const completed = list.filter((c) => c?.completed).length || 0;

	return {
		rawProgress: list,
		stats: { totalCourses, completed, averageScore: 0, completionRate: 0 },
		activityData: [],
		currentCourses: list.slice(0, 10),
		achievements: [],
	};
}

const EMPTY_RESULT = {
	rawProgress: [],
	stats: { totalCourses: 0, completed: 0, averageScore: 0, completionRate: 0 },
	activityData: [],
	currentCourses: [],
	achievements: [],
};

const progressService = {
	// Returns the raw API response in exactly the two shapes you showed:
	// - Direct DTO: { name, email, totalCourses, completedCourses, averageScore, dailyScoreDTOList: [...] }
	// - Wrapped envelope: { code, message, data: { ...DTO... } }
	// If the preferred endpoint is missing (404) it will try the legacy endpoint and return its body.
	async getProgressRaw(studentId) {
		if (!studentId) return null;

		try {
			const res = await api.get(`/progress/${studentId}/current`);
			const body = res?.data ?? null;
			// If server uses envelope { code, message, data }, unwrap it to return the inner data
			if (body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "data")) {
				return body.data;
			}
			return body;
		} catch (err) {
			const status = err?.response?.status;
			if (status === 404) {
				try {
					const r2 = await api.get(`/progress/${studentId}`);
					const b2 = r2?.data ?? null;
					if (b2 && typeof b2 === "object" && Object.prototype.hasOwnProperty.call(b2, "data")) return b2.data;
					return b2;
				} catch {
					return null;
				}
			}
			// For other errors, return null so caller can decide how to handle
			return null;
		}
	},

	// Convenience: normalized UI-friendly shape (keeps previous behavior)
	async getProgress(studentId) {
		const raw = await this.getProgressRaw(studentId);
		if (!raw) return EMPTY_RESULT;

		// If wrapped envelope, extract data
		if (raw && typeof raw === "object" && Object.prototype.hasOwnProperty.call(raw, "code") && raw.data) {
			return mapProgressDtoToUi(raw.data);
		}

		// If direct DTO
		if (raw && typeof raw === "object" && (raw.name || Array.isArray(raw))) {
			// If it's an array (legacy list), map via legacy mapper
			if (Array.isArray(raw)) return mapLegacyListToUi(raw);
			return mapProgressDtoToUi(raw);
		}

		return EMPTY_RESULT;
	},
	// Fetch daily scores for a given range (from and to are ISO dates YYYY-MM-DD)
	async getDailyScores(studentId, from, to) {
		if (!studentId || !from || !to) return null;
		try {
			const res = await api.get(`/progress/${studentId}/scores`, {
				params: { from, to },
			});
			const body = res?.data ?? null;
			if (body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "data")) {
				return body.data;
			}
			return body;
		} catch {
			return null;
		}
	},
};

export default progressService;


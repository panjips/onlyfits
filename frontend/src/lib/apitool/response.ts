export interface BaseResponse<T = undefined> {
	data?: T;
	message: string;
	success: boolean;
}

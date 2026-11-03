export class AppError extends Error{constructor(status,code,message){super(message);this.status=status;this.code=code}}
export const normalize=e=>e instanceof AppError?e:new AppError(e?.status||0,"UNKNOWN",e?.message||"Something went wrong");

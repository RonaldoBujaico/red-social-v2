import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler =
    (fn: RequestHandler): RequestHandler =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export const asyncHandlerRedirect =
    (options: { successRedirect: string; errorRedirect: string }) =>
    (fn: (req: Request, res: Response) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res))
            .then(() => res.redirect(options.successRedirect))
            .catch((error) => {
                console.log("error code", error.code);
                return res.redirect(
                    `${options.errorRedirect}code=${error.code || "UNKNOWN"}`,
                );
            });
    };

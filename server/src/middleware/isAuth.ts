import { MyContext } from "src/types/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    if (!context.req.session.userId) {
        context.res.status(401);
        throw new Error("Not Authenticated");
    }

    return next();
};

import { UsernamePasswordEmailInput } from "src/resolvers/inputTypes";

export const validateRegister = (options: UsernamePasswordEmailInput) => {

    if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "Username cannot contain @ sign"
            }
        ];
    }

    if (options.username.length < 6) {
        return [
            {
                field: "username",
                message: "Username must be at least six characters"
            }
        ];
    }

    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid email"
            }
        ];
    }

    if (options.password.length < 6) {
        return [
            {
                field: "password",
                message: "Password must be at least six characters"
            }
        ];
    }

    return null;
};

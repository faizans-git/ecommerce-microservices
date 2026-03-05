import prisma from "./prisma.js";
const findUser = async (email) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    return existingUser;
};
export default findUser;
//# sourceMappingURL=checkExistance.js.map
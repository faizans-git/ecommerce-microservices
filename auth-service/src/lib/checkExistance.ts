import { User } from "../generated/client.js";
import prisma from "./prisma.js";

const findUser = async (email: string): Promise<User | null> => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  return existingUser;
};

export default findUser;

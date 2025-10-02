import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); //make a prisma client insatnce
export default prisma; //export the insatance later used in the controllers 

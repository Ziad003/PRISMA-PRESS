import { prisma } from "../../lib/prisma";
import config from "../../config";
import bcrypt from "bcryptjs";
import { regUserPayload } from "./userInterface";

const registerUserIntoDb = async (payload: regUserPayload) => {
    const { name, email, password, profilePhoto } = payload

    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (isUserExist) {
        throw new Error("This user already exists");
    }
    const hashPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds));

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashPassword,
            profile: {
                create: {
                    profilePhoto
                },
            }
        }
    });

    // await prisma.profile.create({
    //     data: {
    //         userId: createdUser.id,
    //         profilePhoto
    //     }
    // });

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: email
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });

    return user;
}

const getMyProfileFromDB = async (userId: string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    });
    return user
};

const updateMyProfileInDB = async (userId: string, payload: any) => {
    // const {email,name,profilePhoto,bio}=payload;

    // const updatedUser=await prisma.user.update({
    //     where:{
    //         id:userId
    //     },
    //     data:{
    //         name,
    //         email,
    //         profile:{
    //             update:{
    //                 profilePhoto,
    //                 bio
    //             }
    //         }
    //     },
    //     omit:{
    //         password:true
    //     },
    //     include:{
    //         profile:true
    //     }
    // });
    // return updatedUser;

    const { email, name, profilePhoto, bio } = payload;

    const transaction = await prisma.$transaction(
        async (tx) => {
            const updatedUser = await tx.user.update({
                where: {
                    id: userId
                },
                data: {
                    name,
                    email,
                    profile: {
                        upsert: {
                            create: {
                                profilePhoto,
                                bio
                            },
                            update: {
                                profilePhoto,
                                bio
                            }
                        }
                    }
                }, omit: {
                    password: true,
                },
                include: {
                    profile: true
                }
            });
            return updatedUser

        }
    )
    return transaction
};

export const userServe = {
    registerUserIntoDb,
    getMyProfileFromDB,
    updateMyProfileInDB
}
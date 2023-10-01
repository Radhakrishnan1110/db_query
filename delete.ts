import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const deleteUsers = async () => {
  try {
    // Define the email you want to match for deletion
    const emailToDelete = "radhakrishnankannan1110@gmail.com";

    // Find the user with the matching email
    const userToDelete = await db.user.findUnique({
      where: {
        email: emailToDelete,
      },
      select: {
        id: true,
        kycId: true,
        bankDetailsId: true,
        UserKycRel: {
          select: {
            encryptedUserDataId: true,
          },
        },
      },
    });

    if (!userToDelete) {
      return;
    } else if (
      userToDelete &&
      userToDelete.kycId !== null &&
      userToDelete.bankDetailsId !== null &&
      userToDelete.UserKycRel !== null
    ) {
      if (userToDelete.UserKycRel.encryptedUserDataId != null) {
        db.encryptedUserData.delete({
          where: {
            id: userToDelete.UserKycRel.encryptedUserDataId,
          },
        });
      }
      await db.$transaction([
        db.userAccount.delete({
          where: {
            userId: userToDelete.id,
          },
        }),
        db.userKyc.delete({
          where: {
            id: userToDelete.kycId,
          },
        }),
        db.userBankDetails.delete({
          where: {
            id: userToDelete.bankDetailsId,
          },
        }),
        db.twoFA.deleteMany({
          where: {
            userId: userToDelete.id,
          },
        }),
        db.user.delete({
          where: {
            id: userToDelete.id,
          },
        }),
      ]);

      console.log(
        `User with email ${emailToDelete} and related records deleted successfully.`
      );
    }
  } catch (error) {
    console.error("Error deleting user:", error);
  } finally {
    // Close the Prisma client connection
    await db.$disconnect();
  }
};

// Call the function to delete the db enteries of the user
deleteUsers();

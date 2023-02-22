import { Result } from '../../../constants/result';
import { AppDataSource } from '../../../db/dataSource';
import { Courier } from '../../../db/entity/Courier';
import { User } from '../../../db/entity/User';
import { UserCourier } from '../../../db/entity/UserCourier';
import { ErrorResult, NotFoundResult, SuccessResult } from '../../../interfaces/result';
import { CreateUserDTO, ICourier, UpdateCourierDTO, UpdateUserDTO } from '../../../interfaces/user';
import { uploadeImageToCloudinary } from '../../../middlewares/cloudinary';

export type CreateOrUpdateUserResult = SuccessResult<User> | ErrorResult;
export type CreateOrUpdateCourierResult = SuccessResult<Courier> | ErrorResult;
export type DeleteUserResult = SuccessResult<null> | ErrorResult;
export type UsersResult = SuccessResult<User[]> | ErrorResult;
export type UserResult = SuccessResult<UserCourier> | NotFoundResult | ErrorResult;

export const UserRepository = AppDataSource.getRepository(User);
export const CourierRepository = AppDataSource.getRepository(Courier);
export const UserCourierRepository = AppDataSource.getRepository(UserCourier);

export async function createUserEntry(user: CreateUserDTO): Promise<CreateOrUpdateUserResult> {
	try {
		let currentUser = await UserRepository.findOne({ where: { userUid: user.user.uid } });
		if (currentUser) {
			currentUser.accessToken = user.accessToken;
			currentUser = await UserRepository.save(currentUser);
		} else {
			const createdUser = UserRepository.create({
				userUid: user.user.uid,
				username: user.user.username,
				accessToken: user.accessToken,
			});
			currentUser = await UserRepository.save(createdUser);

			const courierUser = UserCourierRepository.create({
				user: currentUser,
			});
			await UserCourierRepository.save(courierUser);
		}
		return {
			type: Result.SUCCESS,
			data: currentUser,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred while creating user`,
			error,
		};
	}
}

export async function updateUserEntry(
	userUid: string,
	userData: UpdateUserDTO
): Promise<CreateOrUpdateUserResult> {
	try {
		const user = await UserRepository.findOne({
			where: {
				userUid,
			},
		});
		if (userData.profileImg) {
			const option = user.imagePublicId
				? {
						public_id: user.imagePublicId,
				  }
				: {};
			const { secureURL, publicId } = await uploadeImageToCloudinary(userData.profileImg, option);
			user.profileImg = secureURL;
			user.imagePublicId = publicId;
		}
		user.accessToken = userData?.accessToken || user.accessToken;
		user.walletAddress = userData?.walletAddress || user.walletAddress;
		const updatedUser = await UserRepository.save(user);
		return {
			type: Result.SUCCESS,
			data: updatedUser,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred during updating user with id ${userUid}`,
			error,
		};
	}
}

export async function updateCourierInfo(
	courierUserId: string,
	courierData: UpdateCourierDTO
): Promise<CreateOrUpdateCourierResult> {
	try {
		await CourierRepository.update(courierUserId, courierData);
		const updatedCourier = await CourierRepository.findOne({
			where: {
				courierUserId: courierUserId,
			},
		});
		return {
			type: Result.SUCCESS,
			data: updatedCourier,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred during updating user with id ${courierUserId}`,
			error,
		};
	}
}

export async function findUser(userUid: string): Promise<UserResult> {
	try {
		const currentUser = await UserCourierRepository.findOne({
			where: { user: { userUid } },
		});
		if (!currentUser) {
			return {
				type: Result.NOT_FOUND,
				message: `Could not find user with id: ${userUid}`,
			};
		}
		return {
			type: Result.SUCCESS,
			data: currentUser,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred during finding user with id ${userUid}`,
			error,
		};
	}
}

export async function findUserByUsername(
	username: string
): Promise<SuccessResult<User> | NotFoundResult | ErrorResult> {
	try {
		const currentUser = await UserRepository.findOne({
			where: { username },
		});
		if (!currentUser) {
			return {
				type: Result.NOT_FOUND,
				message: `Could not find user with username: ${username}`,
			};
		}
		return {
			type: Result.SUCCESS,
			data: currentUser,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred during finding user with username ${username}`,
			error,
		};
	}
}

export async function deleteUserEntry(userUid: string): Promise<DeleteUserResult> {
	try {
		const userCourier = await UserCourierRepository.findOne({
			where: { user: { userUid } },
		});
		await UserCourierRepository.delete(userCourier.id);
		await UserRepository.delete(userUid);
		return {
			type: Result.SUCCESS,
			data: null,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred while deleting user with id ${userUid}`,
			error: error,
		};
	}
}

export async function deleteCourierEntry(courierUid: string): Promise<DeleteUserResult> {
	try {
		const userCourier = await UserCourierRepository.findOne({
			where: { user: { userUid: courierUid } },
		});
		userCourier.courier = null;
		await UserCourierRepository.save(userCourier);
		await CourierRepository.delete(courierUid);
		return {
			type: Result.SUCCESS,
			data: null,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred while deleting user with id ${courierUid}`,
			error: error,
		};
	}
}

export async function getUsersEntry(): Promise<UsersResult> {
	try {
		const results = await UserRepository.find();
		return {
			type: Result.SUCCESS,
			data: results,
		};
	} catch (error) {
		return {
			type: Result.ERROR,
			message: error.message,
			error,
		};
	}
}

export async function createCourierEntry(courier: ICourier): Promise<CreateOrUpdateCourierResult> {
	try {
		let currentCourier = await CourierRepository.findOne({
			where: { courierUserId: courier.courierUserId },
		});
		if (!currentCourier) {
			const createdUser = CourierRepository.create({
				courierUserId: courier.courierUserId,
				modeOfTransportation: courier.modeOfTransportation,
				regionOfOperation: courier.regionOfOperation,
				preferredDeliveryAmount: courier.preferredDeliveryAmount,
				country: courier.country,
			});
			currentCourier = await CourierRepository.save(createdUser);
			const courierUser = await UserCourierRepository.findOne({
				where: { user: { userUid: courier.courierUserId } },
			});
			if (courierUser) {
				await UserCourierRepository.save({
					id: courierUser.id,
					courier: currentCourier,
				});
			}
		}
		return {
			type: Result.SUCCESS,
			data: currentCourier,
		};
	} catch (error) {
		console.log(error);
		return {
			type: Result.ERROR,
			message: `An unexpected error occurred while creating user`,
			error,
		};
	}
}

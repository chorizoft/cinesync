import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { FriendStatus } from '../users.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersDao {
	constructor(private readonly prisma: PrismaService) {}

	async getUser(userId: string) {
		return await this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
		});
	}

	async getUserByUsername(username: string) {
		return await this.prisma.user.findUniqueOrThrow({
			where: { username },
		});
	}

	async getUserByEmail(userEmail: string) {
		return await this.prisma.user.findUniqueOrThrow({
			where: { email: userEmail },
		});
	}

	async getFriends(userId: string) {
		const friends = await this.prisma.user.findMany({
			where: { id: userId },
			include: {
				friendsWith: true,
				friendsRequest: true,
			},
		});

		return { user1: friends[0].friendsWith, user2: friends[0].friendsRequest };
	}

	async getUsernameById(userId: string) {
		const user = await this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
		});

		return user.username;
	}

	async getUserData(userId: string) {
		return await this.prisma.user.findUniqueOrThrow({
			where: { id: userId },
			include: {
				list: {
					include: {
						movie: true,
					},
				},
				movie: true,
			},
		});
	}

	async createUser(createUser: CreateUserDto) {
		return await this.prisma.user.create({
			data: {
				...createUser,
				id: uuidv4(),
				role: Role.USER,
			},
		});
	}

	createFriendship(userId: string, friendId: string) {
		return Promise.all([
			this.prisma.friends.create({
				data: {
					user_1: { connect: { id: userId } },
					user_2: { connect: { id: friendId } },
					isFriend: true,
				},
			}),
			this.prisma.friends.create({
				data: {
					user_2: { connect: { id: userId } },
					user_1: { connect: { id: friendId } },
					isFriend: false,
				},
			}),
		]);
	}

	async updateUser(userId: string, attrs: Partial<CreateUserDto>) {
		return await this.prisma.user.update({
			where: { id: userId },
			data: attrs,
		});
	}

	async updateFriendship(
		userId: string,
		friendId: string,
		status: FriendStatus,
	) {
		if (status === 'ACCEPT') {
			return await this.prisma.friends.update({
				where: {
					userId1_userId2: {
						userId1: userId,
						userId2: friendId,
					},
				},
				data: {
					isFriend: true,
				},
			});
		}

		if (status === 'REJECT') {
			return Promise.all([
				this.prisma.friends.deleteMany({
					where: {
						OR: [
							{
								userId1: userId,
								userId2: friendId,
							},
							{
								userId1: friendId,
								userId2: userId,
							},
						],
					},
				}),
			]);
		}
	}

	async deleteUser(userId: string) {
		return await this.prisma.user.delete({
			where: { id: userId },
		});
	}
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { UpdateListDto } from '../dto/update-list.dto';
import { QueryDto } from '../dto/query.dto';

@Injectable()
export class ListDao {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicList(listId: string) {
    const list = await this.getList(listId);

    if (!list.isPrivate) {
      return list;
    }

    throw new BadRequestException('List is private');
  }

  async getList(listId: string) {
    const list = await this.prisma.list.findUniqueOrThrow({
      where: { id: listId },
      select: {
        id: true,
        name: true,
        isPrivate: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return list;
  }

  async getLists(query: QueryDto) {
    const l = await this.prisma.list.findMany({
      where: {
        user: {
          some: {
            id: query.id,
          },
        },
      },
      take: query.per_page || 10,
      skip: (query.page_number || 0) * (query.per_page || 10),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { list: l };
  }

  async getSharees(listId: string, currentUser: string) {
    const { user } = await this.prisma.list.findUniqueOrThrow({
      where: { id: listId },
      include: {
        user: {
          where: {
            NOT: {
              id: currentUser,
            },
          },
          orderBy: {
            username: 'asc',
          },
          select: {
            id: true,
            username: true,
            email: true,
            avatarName: true,
          },
        },
      },
    });

    return user;
  }

  async createList(listName: string, userId: string) {
    return await this.prisma.list.create({
      data: {
        id: uuidv4(),
        name: listName,
        isPrivate: true,
        creatorId: userId,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async updateListPrivacy(listId: string) {
    const list = await this.prisma.list.findUniqueOrThrow({
      where: { id: listId },
      include: { user: true, movie: true },
    });

    return await this.prisma.list.update({
      where: { id: listId },
      data: {
        isPrivate: !list.isPrivate,
      },
    });
  }

  async updateList(listId: string, listUpdate: UpdateListDto) {
    return await this.prisma.list.update({
      where: { id: listId },
      data: listUpdate,
    });
  }

  async deleteList(listId: string, user: User) {
    const list = await this.prisma.list.findUniqueOrThrow({
      where: { id: listId },
      select: { creatorId: true },
    });

    if (list.creatorId === user.id || user.role === Role.ADMIN) {
      await this.prisma.user.update({
        where: { id: list.creatorId },
        data: {
          list: {
            disconnect: { id: listId },
          },
        },
      });

      return await this.prisma.list.delete({
        where: { id: listId },
      });
    }
  }

  async toggleShareList(listId: string, email: string, isShared: boolean) {
    return await this.prisma.list.update({
      where: { id: listId },
      data: {
        user: {
          ...(isShared
            ? {
                disconnect: { email },
              }
            : {
                connect: { email },
              }),
        },
      },
    });
  }
}

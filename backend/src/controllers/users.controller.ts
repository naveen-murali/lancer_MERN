import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestException, HttpException } from '../exceptions';
import { AdminModel, CustomRequest, UserModel } from '../interface';
import { UserService } from '../services';
import { Role } from '../util';
import { AddSellerInfoBody, EditSellerInfoBody, EditUserBody } from '../validation';

interface SearchInter {
    search: string;
    page: string;
    pages: string;
    pageSize: string;
    sort: Object;
}

export class UserController {

    public userService: UserService = new UserService();


    // @desc        Get all the users
    // @rout        POST /users
    // @acce        Admin
    getAllUsers = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as unknown as SearchInter;
        const users = await this.userService.getAllUsers(query);

        res.json(users);
    });


    // @desc        Get all the users
    // @rout        POST /users/:id/sellers
    // @acce        User[Buyer]
    addSellerInfo = asyncHandler(async (req: CustomRequest, res: Response) => {
        const user = <UserModel>req.headers['user'];
        if (user && user._id && user.role.includes(Role.SELLER))
            throw new HttpException(401, `user is already is a ${Role.SELLER}`);

        const sellerData = <AddSellerInfoBody>req.body;
        const users = await this.userService.addSellerInfo((user._id as string), sellerData);

        res.status(201).json(users);
    });


    // @desc        Get user by id
    // @rout        GET /users
    // @acce        User/Admin
    getUserById = asyncHandler(async (req: CustomRequest, res: Response) => {
        const id = req.params.id as unknown as string;

        const body = req.headers['user'] as UserModel | AdminModel;

        if (!id)
            throw new BadRequestException("id is missing");

        if (
            body && body._id &&
            !body.role.includes(Role.ADMIN) &&
            id !== body._id.toString()
        ) {
            throw new HttpException(401, "You can't access this information");
        }

        const user = await this.userService.getUserById(id);
        res.json(user);
    });


    // @desc        Editing user
    // @rout        PUT /users/:id
    // @acce        User
    editUser = asyncHandler(async (req: CustomRequest, res: Response) => {
        const id = req.params.id as unknown as string;
        const body: EditUserBody = req.body;
        const user = req.headers['user'] as UserModel | AdminModel;

        if (!id)
            throw new BadRequestException("id is missing");

        if (user && user._id && id !== user._id.toString())
            throw new HttpException(401, "You can't access this information");

        await this.userService.editUser(id, body);
        res.status(201).json({});
    });


    // @desc        Block user
    // @rout        PUT /users/:id/block
    // @acce        Admin
    blockUser = asyncHandler(async (req: CustomRequest, res: Response) => {
        const id = req.params.id as unknown as string;

        await this.userService.blockUser(id);
        res.status(204).json({});
    });


    // @desc        Unblock user
    // @rout        PUT /users/:id/unblock
    // @acce        Admin
    unblockUser = asyncHandler(async (req: CustomRequest, res: Response) => {
        const id = req.params.id as unknown as string;

        await this.userService.unblockUser(id);
        res.status(204).json({});
    });


    // @desc        Edit user info
    // @rout        PUT /users/:id/sellers
    // @acce        Users[Seller]
    editSellerInfo = asyncHandler(async (req: CustomRequest, res: Response) => {
        const id = req.params.id as unknown as string;
        const body = <EditSellerInfoBody>req.body;

        const { description, personalWebsite, certifications, skills } = await this.userService.editSellerInfo(id, body);
        const sellerInfo: EditSellerInfoBody = {
            description,
            personalWebsite,
            certifications,
            skills
        };
        res.status(201).json(sellerInfo);
    });

}
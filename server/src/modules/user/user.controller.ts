import { Router } from 'express';
import { createUser } from './handlers/createUser';
import { deleteUser } from './handlers/deleteUser';
import { getAllUsers } from './handlers/getAllUser';
import { getUser } from './handlers/getUser';
import { getUserByUsername } from './handlers/getUserByUsername';
import { updateUser } from './handlers/updateUser';
import { signInUser } from './handlers/signInUser';
import { signOutUser } from './handlers/signOutUser';
import { isAuthenticated } from '../../middlewares/session';
import { createCourier } from './handlers/createCourier';
import { updateCourier } from './handlers/updateCourier';
import { deleteCourier } from './handlers/deleteCourier';
import { multerUploadImage } from '../../middlewares/multer';

const userRouter = Router();

userRouter.get('/', isAuthenticated, getAllUsers);
userRouter.post('/', isAuthenticated, createUser);
userRouter.get('/:id', isAuthenticated, getUser);
userRouter.get('/:username', isAuthenticated, getUserByUsername);
userRouter.delete('/:id', isAuthenticated, deleteUser);
userRouter.patch('/:id', isAuthenticated, multerUploadImage, updateUser);
userRouter.post('/courier', isAuthenticated, createCourier);
userRouter.delete('/courier/:id', isAuthenticated, deleteCourier);
userRouter.patch('/courier/:id', isAuthenticated, updateCourier);
userRouter.post('/sign-in', signInUser);
userRouter.get('/sign-out', isAuthenticated, signOutUser);

export const UserController = { router: userRouter };

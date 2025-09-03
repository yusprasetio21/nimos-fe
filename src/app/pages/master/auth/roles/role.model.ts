import { Permission } from '../permission/models/permission.model';

export class Role {
    id: number;
    name: string;
    permissions: Permission[];
    usersCount: number;
    createdAt: Date;
    updatedAt: Date;
}

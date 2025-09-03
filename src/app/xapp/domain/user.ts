import { Organization } from './organization';
import { Role } from './../../pages/master/auth/roles/role.model';

export class User {
    id: number;
    name: string;
    phone: string;
    username: string;
    password: string;
    category: number;
    email: string;
    is_active: number;
    organization_id?: number;
    email_organization: string;
    organization?: Organization;

    category_org?: number;
    role_id_int?: number;
    role_id?: number[];
    roles?: Role[];
    password_confirmation?: string;
    agree?: boolean;

    public static readonly CAT_ORGANIZATION = 1;
    public static readonly CAT_PERSONAL = 2;
}

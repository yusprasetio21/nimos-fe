import { Organization } from './organization';
import { Role } from './../../pages/master/auth/roles/role.model';

export class Param {
    id: number;
    variable_code: string;
    variable_name_en: string;
    variable_name_id: string;
    variable_tooltip_en: string;
    variable_tooltip_id: string;
    is_visible: boolean;
    is_basic: boolean;
    is_mandatory: boolean;
    is_geophysic: boolean;
    is_calculated: boolean;
    classname: string;
    column_name: string;
    module: string;
}

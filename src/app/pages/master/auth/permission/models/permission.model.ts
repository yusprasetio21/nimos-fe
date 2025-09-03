import { Role } from '../../roles/role.model';
import { AbilityName } from './ability-name.model';
import { AbilityType } from './ability-type.model';
import * as _ from 'lodash';

export class Permission {
    id?: number;
    private _name: string;
    roles: Role[] = [];
    createdAt: Date;
    updatedAt: Date;

    public get name(): string {
        if (this._name === null || this._name === undefined) {
            return '';
        }

        return `${getAbilityType(this.abilityType)} ${_.startCase(this.abilityName)}`;
    }

    public set name(value: string) {
        this._name = value;
    }

    public get abilityType(): string {
        return beforeLast(this._name, ' ');
    }

    public get abilityName(): string {
        if (this._name === null || this._name === undefined) return '';
        const secondWord = this._name.split(' ')[1];
        return secondWord !== '' ? secondWord : '';
    }

    getRawName() {
        return this._name;
    }

    setPermission(permission: Permission) {
        this.id = permission.id;
        this.name = permission.name;
        this.roles = permission.roles;
        this.createdAt = permission.createdAt;
        this.updatedAt = permission.updatedAt;
    }
}

function beforeLast(value: string, delimiter: string) {
    value = value || '';

    if (delimiter === '') {
        return value;
    }

    const substrings = value.split(delimiter);

    return substrings.length === 1
        ? value // delimiter is not part of the string
        : substrings.slice(0, -1).join(delimiter);
}

function getAbilityType(value: string): string {
    switch (value) {
        case 'viewAny':
            return 'Browse';
        case 'view':
            return 'Read';
        case 'update':
            return 'Edit';
        case 'create':
            return 'Add';
        case 'delete':
            return 'Delete';
        case 'restore':
            return 'Restore';
        case 'forceDelete':
            return 'Hard Delete';
        default:
            return _.startCase(value);
    }
}

export class Institution {
    id: number;
    code: string;
    name: string;
    short_name: string;
    email: string;
    category: number;
    publicKey: string;
    is_active: number;

    public static readonly ORG_TYPE_PRINCIPAL = 'P';
    //public static readonly ORG_TYPE_BANK = 'B';
    //public static readonly ORG_TYPE_INSTITUTION = 'I';
}
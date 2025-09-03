export class Organization {
    //email
    //code

    id: number;
    short_name: string;
    long_name: string;
    url: string;
    country_id: string;
    category: number;
    is_active: number;
    is_oscar: boolean;

    public static readonly CAT_PEMERINTAH = 1;
    public static readonly CAT_BUMN = 2;
    public static readonly CAT_SWASTA = 3;
    public static readonly CAT_UNIV = 4;
    public static readonly CAT_NGO = 5;
    public static readonly CAT_MANDIRI = 97;
}

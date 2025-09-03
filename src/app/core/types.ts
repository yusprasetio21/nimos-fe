export interface PagedResponse<T> {
    current_page?: number;
    data?: T[] | any[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    links?: Link[];
    next_page_url?: string;
    path?: string;
    per_page?: number;
    prev_page_url?: string;
    to?: number;
    total?: 88;
    [key: string]: any;
}

export interface Link {
    url?: string;
    label?: string;
    active?: boolean;
}
